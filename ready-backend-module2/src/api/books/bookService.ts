import fs from "fs";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { StatusCodes } from "http-status-codes";
import type { Book } from "./bookModel";
import {
  addNoteToBook as addNoteToBookInRepo,
  checkBookExistence,
  createBookInRepo,
  deleteBook as deleteBookInRepo,
  deleteNoteFromBook as deleteNoteFromBookInRepo,
  getBookById as getBookByIdFromRepo,
  getBooks,
  getBooksPendingApprovals,
  updateBook as updateBookInRepo,
  updateNoteInBook as updateNoteInBookInRepo,
} from "./bookRepository";

const s3 = new S3Client({ region: "us-east-1" });

class BookService {
  public async getAllBooks(): Promise<Book[]> {
    return await getBooks();
  }

  public async getBooksWithPendingApprovals(): Promise<Book[]> {
    return await getBooksPendingApprovals();
  }

  public async getBookById(id: string): Promise<Book | null> {
    return await getBookByIdFromRepo(id);
  }

  public async addNoteToBook(id: string, note: { text: string; contributor: string; imageUrl: string }): Promise<void> {
    await addNoteToBookInRepo(id, note);
  }

  public async updateNoteInBook(
    id: string,
    noteIndex: number,
    note: { text: string; contributor: string; imageUrl: string },
  ): Promise<boolean> {
    return await updateNoteInBookInRepo(id, noteIndex, note);
  }

  public async deleteNoteFromBook(id: string, noteIndex: number): Promise<boolean> {
    return await deleteNoteFromBookInRepo(id, noteIndex);
  }

  static async createBook(bookData: Book, file: any): Promise<Book> {
    try {
      const isDuplicate = await checkBookExistence(bookData.title, bookData.author);
      if (isDuplicate) {
        throw new Error("Book with the same title and author already exists");
      }

      if (!file) {
        ServiceResponse.failure("No file provided", null, StatusCodes.INTERNAL_SERVER_ERROR);
      }
      const thumbnail_name = bookData.title?.replace(/ /g, "_");
      const objectKey = `books/thumbnails/${thumbnail_name}.png`;
      const fileContent = fs.readFileSync(file.path);

      const userName = bookData?.emailId?.split("@")[0];
      const userImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${userName}.png`;
      bookData.userImageUrl = userImageUrl;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      // Upload the file to S3
      const command = new PutObjectCommand(params);
      await s3.send(command);
      // Construct file URL
      const thumbnail = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;
      const data = { ...bookData, thumbnail };
      return await createBookInRepo(data);
    } catch (error) {
      const err = error as Error;
      if (err.message === "Book with the same title and author already exists") {
        throw new Error(err.message);
      } else {
        throw new Error("File upload failed");
      }
    } finally {
      // Cleanup the temporary file
      if (file?.path) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting temporary file at ${file.path}:`, err);
          } else {
            console.log(`Temporary file ${file.path} deleted.`);
          }
        });
      }
    }
  }

  public async updateBook(id: string, bookData: Partial<Book>, file: any): Promise<Book | null> {
    try {
      if (file) {
        const thumbnail_name = bookData.title?.replace(/ /g, "_");
        const objectKey = `books/thumbnails/${thumbnail_name}.png`;
        const fileContent = fs.readFileSync(file.path);

        const userName = bookData?.emailId?.split("@")[0];
        const userImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${userName}.png`;
        bookData.userImageUrl = userImageUrl;

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: objectKey,
          Body: fileContent,
          ContentType: file.mimetype,
        };

        // Upload the file to S3
        const command = new PutObjectCommand(params);
        await s3.send(command);
        // Construct file URL
        const thumbnail = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;
        const data = { ...bookData, thumbnail };
        return await updateBookInRepo(id, data);
      } else {
        return await updateBookInRepo(id, bookData);
      }
    } catch (error) {
      throw new Error("File upload failed");
    } finally {
      // Cleanup the temporary file
      if (file?.path) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting temporary file at ${file.path}:`, err);
          } else {
            console.log(`Temporary file ${file.path} deleted.`);
          }
        });
      }
    }
  }

  public async deleteBook(id: string): Promise<boolean> {
    const deleteBook: boolean = await deleteBookInRepo(id);
    return deleteBook;
  }
}

export default BookService;
