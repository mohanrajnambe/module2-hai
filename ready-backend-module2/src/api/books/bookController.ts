import type { Request, Response } from "express";
import BookService from "./bookService";

class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  public async getBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await this.bookService.getAllBooks();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  }

  // Get books with pending approvals
  public async getBooksPendingApproval(req: Request, res: Response): Promise<void> {
    try {
      const books = await this.bookService.getBooksWithPendingApprovals();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books with pending approvals" });
    }
  }

  public async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const book = await this.bookService.getBookById(bookId);
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book" });
    }
  }

  public async addNoteToBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const noteData = req.body;

      // Validate noteData
      if (!noteData.text || !noteData.contributor) {
        res.status(400).json({ error: "Note text and contributor are required" });
        return;
      }

      await this.bookService.addNoteToBook(bookId, noteData);
      res.status(201).json({ message: "Note added successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to add note to book" });
    }
  }

  public async updateNoteInBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const noteIndex = Number.parseInt(req.params.noteIndex, 10);
      const noteData = req.body;

      // Validate noteData
      if (!noteData.text || !noteData.contributor) {
        res.status(400).json({ error: "Note text and contributor are required" });
        return;
      }

      const updatedNote = await this.bookService.updateNoteInBook(bookId, noteIndex, noteData);
      if (updatedNote) {
        res.status(200).json({ message: "Note updated successfully" });
      } else {
        res.status(404).json({ error: "Note not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update note in book" });
    }
  }

  public async deleteNoteFromBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const noteIndex = Number.parseInt(req.params.noteIndex, 10);

      const isDeleted = await this.bookService.deleteNoteFromBook(bookId, noteIndex);
      if (isDeleted) {
        res.status(200).json({ message: "Note deleted successfully" });
      } else {
        res.status(404).json({ error: "Note not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note from book" });
    }
  }

  public async createBook(req: Request, res: Response): Promise<void> {
    try {
      const bookData = req.body;
      if (!req.body.author || !req.body.title) {
        res.status(400).json({ error: "Author , and title required" });
        return;
      }
      bookData.emailId = req.user?.preferred_username;
      bookData.addedBy = req.user?.name;
      bookData.isApproved = req.user?.roles?.includes("Admin.Write") || false;
      const file = req.file;
      const result = await BookService.createBook(bookData, file);
      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      if (err.message === "Book with the same title and author already exists") {
        res.status(409).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Failed to create book" });
      }
    }
  }

  public async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const bookData = req.body;
      const file = req.file;
      const updatedBook = await this.bookService.updateBook(bookId, bookData, file);
      if (updatedBook) {
        res.status(200).json(updatedBook);
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update book" });
    }
  }

  public async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id;
      const isDeleted = await this.bookService.deleteBook(bookId);
      if (isDeleted) {
        res.status(204).send({ message: "Book Deleted Successfully" });
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete book" });
    }
  }
}

export default BookController;
