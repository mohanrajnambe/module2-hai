import { EmailService } from "@/common/services/emailService";
import { config } from "dotenv";
import { MongoClient, ObjectId } from "mongodb"; // Removed ModifyResult import
import { type Book, BookSchema, type Note } from "./bookModel";

config();

const uri = process.env.DOCUMENTDB_URI || ""; // Ensure environment variable is set

// Utility function to connect to the database
const connectToDatabase = async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db(process.env.DOCUMENTDB_DB_NAME);
  const collection = database.collection<Book>("inventory");
  return { client, collection };
};

export const getBooks = async (): Promise<Book[]> => {
  const { client, collection } = await connectToDatabase();
  try {
    const books = await collection
      .find({
        $or: [
          { isApproved: { $ne: false } }, // Include books where isApproved is not false
          { isApproved: { $exists: false } }, // Include books where isApproved field does not exist
        ],
      })
      .toArray();
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  } finally {
    await client.close();
  }
};

export const deleteBook = async (bookId: string): Promise<boolean> => {
  if (!bookId || typeof bookId !== "string") {
    throw new Error("Invalid book ID");
  }

  const { client, collection } = await connectToDatabase();
  try {
    const queryId = bookId.trim();
    if (!queryId) {
      throw new Error("Book ID cannot be empty");
    }

    const result = await collection.deleteOne({ id: queryId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw new Error("Failed to delete book");
  } finally {
    await client.close();
  }
};

export const getBooksPendingApprovals = async (): Promise<Book[]> => {
  const { client, collection } = await connectToDatabase();
  try {
    const books = await collection.find({ isApproved: false }).toArray();
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  } finally {
    await client.close();
  }
};

export const getBookById = async (bookId: string): Promise<Book | null> => {
  const { client, collection } = await connectToDatabase();
  try {
    const queryId = bookId.trim();
    let book: Book | null = null;

    // Try to find by '_id'
    try {
      const objectId = new ObjectId(queryId);
      book = await collection.findOne({ _id: objectId });
    } catch (err) {
      // If invalid ObjectId, ignore and try by 'id' field
    }

    // If not found, try to find by 'id' field
    if (!book) {
      book = await collection.findOne({ id: queryId });
    }

    return book;
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    throw new Error("Failed to fetch book by ID");
  } finally {
    await client.close();
  }
};

export const updateBook = async (bookId: string, updateData: Partial<Book>): Promise<Book | null> => {
  const { client, collection } = await connectToDatabase();
  try {
    const queryId = bookId.trim();
    let updatedBook: Book | null = null;

    // Try to update by '_id'
    try {
      const objectId = new ObjectId(queryId);
      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: "after" },
      );
      if (result) {
        updatedBook = result;
      }
    } catch (err) {
      // If invalid ObjectId, ignore and try by 'id' field
    }

    // If not updated, try to update by 'id' field
    if (!updatedBook) {
      const result = await collection.findOneAndUpdate(
        { id: queryId },
        { $set: updateData },
        { returnDocument: "after" },
      );
      if (result) {
        updatedBook = result;
      }
    }

    return updatedBook;
  } catch (error) {
    console.error("Error updating book:", error);
    throw new Error("Failed to update book");
  } finally {
    await client.close();
  }
};

export const addNoteToBook = async (
  bookId: string,
  note: { text: string; contributor: string; imageUrl: string },
): Promise<void> => {
  const { client, collection } = await connectToDatabase();
  try {
    const book = await collection.findOne({ id: bookId });
    if (book) {
      const existingNote = book.notes?.find((n: Note) => n.contributor === note.contributor);
      if (existingNote) {
        throw new Error("Contributor has already added a note to this book.");
      }
      await collection.updateOne({ id: bookId }, { $push: { notes: note } });
    } else {
      throw new Error("Book not found.");
    }
  } catch (error) {
    console.error("Error adding note to book:", error);
    throw new Error("Failed to add note to book");
  } finally {
    await client.close();
  }
};

export const updateNoteInBook = async (
  bookId: string,
  noteIndex: number,
  note: { text: string; contributor: string; imageUrl: string },
): Promise<boolean> => {
  const { client, collection } = await connectToDatabase();
  try {
    console.log(`Updating note at index ${noteIndex} for book ID ${bookId}`);
    const book = await collection.findOne({ id: bookId });
    if (book && book.notes && book.notes[noteIndex]) {
      const updateResult = await collection.updateOne(
        { id: bookId, [`notes.${noteIndex}`]: { $exists: true } },
        { $set: { [`notes.${noteIndex}`]: note } },
      );
      console.log(`Update result: ${updateResult.modifiedCount} document(s) modified.`);
      return updateResult.modifiedCount > 0;
    } else {
      console.error("Note not found.");
      throw new Error("Note not found.");
    }
  } catch (error) {
    console.error("Error updating note in book:", error);
    throw new Error("Failed to update note in book");
  } finally {
    await client.close();
  }
};

export const deleteNoteFromBook = async (bookId: string, noteIndex: number): Promise<boolean> => {
  const { client, collection } = await connectToDatabase();
  try {
    const book = await collection.findOne({ id: bookId });
    if (book && book.notes && book.notes[noteIndex]) {
      const updatedNotes = book.notes.filter((_, index) => index !== noteIndex);
      const updateResult = await collection.updateOne({ id: bookId }, { $set: { notes: updatedNotes } });
      return updateResult.modifiedCount > 0;
    } else {
      console.error("Note not found.");
      throw new Error("Note not found.");
    }
  } catch (error) {
    console.error("Error deleting note from book:", error);
    throw new Error("Failed to delete note from book");
  } finally {
    await client.close();
  }
};

export const createBookInRepo = async (bookData: Book): Promise<Book> => {
  const { client, collection } = await connectToDatabase();
  try {
    const parsedData = BookSchema.safeParse(bookData);
    if (!parsedData.success) {
      throw new Error("Invalid book data");
    }
    const response = await collection.insertOne(parsedData.data);
    if (response.acknowledged) {
      if (!parsedData.data.isApproved) {
        const emailService = new EmailService();
        emailService.sendApprovalEmail(parsedData.data.addedBy, parsedData.data.title);
      }
      return parsedData.data;
    } else {
      throw new Error("Failed to add book");
    }
  } catch (error) {
    console.error("Error adding book:", error);
    throw new Error("Failed to add book");
  } finally {
    await client.close();
  }
};

export const checkBookExistence = async (title: string, author: string): Promise<boolean> => {
  const { client, collection } = await connectToDatabase();
  try {
    const existingBook = await collection.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      author: { $regex: new RegExp(`^${author}$`, "i") },
    });
    return !!existingBook;
  } catch (error) {
    console.error("Error validating book uniqueness:", error);
    throw new Error("Failed to validate book uniqueness");
  } finally {
    await client.close();
  }
};
