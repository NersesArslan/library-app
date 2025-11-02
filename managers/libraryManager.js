// Updated LibraryManager.js with backend integration
import { Router } from "../services/router.js";
import { Book } from "../models/book.js";
import { BookService } from "../services/bookService.js";
import { ApiService } from "../services/apiService.js";
import { BookView } from "../views/bookView.js";
import { SearchView } from "../views/searchView.js";
import { CommentView } from "../views/commentView.js";

export class LibraryManager {
  constructor() {
    this.books = [];
    this.router = new Router();
    this.bookService = new BookService();
    this.apiService = new ApiService(); // NEW: API service

    this.bookView = new BookView({
      onAddBook: (data) => this.addBook(data),
      onDeleteBook: (id) => this.deleteBook(id),
      onEditBook: (id, title, author) => this.editBook(id, title, author),
      onNavigate: (path) => this.router.navigate(path),
    });

    this.searchView = new SearchView({
      onAddBook: (data) => this.addBook(data),
    });

    this.commentView = new CommentView({
      onNavigate: (path) => this.router.navigate(path),
      onRenderBook: (id) => this.renderBookView(id),
    });

    this.setupRoutes();
    this.setupSearchHandler();
    this.loadBooks(); // NEW: Load books from backend on init
  }

  // NEW: Load all books from backend
  async loadBooks() {
    try {
      const booksData = await this.apiService.getAllBooks();
      this.books = booksData.map((data) => {
        const book = new Book(data);
        book.id = data.id; // Use existing ID from database
        book.comments = data.comments || [];
        return book;
      });
      this.renderLibraryView();
    } catch (error) {
      console.error("Error loading books:", error);
      // Show error message to user
      this.showError("Failed to load your library. Please refresh the page.");
    }
  }

  setupSearchHandler() {
    console.debug("setupSearchHandler: initializing");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (!searchForm) {
      console.error("setupSearchHandler: #searchForm not found");
      return;
    }
    if (!searchInput) {
      console.error("setupSearchHandler: #searchInput not found");
      return;
    }

    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      console.debug(`setupSearchHandler: submit with query='${query}'`);
      if (query) {
        try {
          const results = await this.bookService.searchBooks(query);
          console.debug(
            `setupSearchHandler: received ${results.length} results`
          );
          this.searchView.displaySearchResults(results);
        } catch (err) {
          console.error("Error searching books:", err);
        }
      }
    });
  }

  setupRoutes() {
    this.router.addRoute("#library", () => this.renderLibraryView());
    this.router.addRoute("#book", (id) => this.renderBookView(id));

    const hash = window.location.hash || "#library";
    this.router.handleRoute(hash);
  }

  // UPDATED: Save book to backend
  async addBook(bookData) {
    try {
      const book = new Book(bookData);
      console.debug("addBook: preparing to add", bookData && bookData.title);

      // Save to backend first
      const savedBook = await this.apiService.addBook(book);

      // Update local state with backend data
      book.id = savedBook.id; // Ensure we use the backend ID
      this.books.push(book);

      console.debug("addBook: books count after push", this.books.length);
      this.renderLibraryView();

      // Clear search results
      const searchResults = document.getElementById("searchResults");
      if (searchResults) searchResults.innerHTML = "";
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = "";
        searchInput.blur();
      }

      console.log(this.books);
    } catch (error) {
      console.error("Error adding book:", error);
      this.showError("Failed to add book. Please try again.");
    }
  }

  // UPDATED: Delete book from backend
  async deleteBook(id) {
    try {
      await this.apiService.deleteBook(id);
      this.books = this.books.filter((book) => book.id !== id);
      this.renderLibraryView();
    } catch (error) {
      console.error("Error deleting book:", error);
      this.showError("Failed to delete book. Please try again.");
    }
  }

  // UPDATED: Update book in backend
  async editBook(id, newTitle, newAuthor) {
    try {
      await this.apiService.updateBook(id, newTitle, newAuthor);
      const book = this.books.find((book) => book.id === id);
      if (book) {
        book.title = newTitle;
        book.author = newAuthor;
        this.renderLibraryView();
      }
    } catch (error) {
      console.error("Error editing book:", error);
      this.showError("Failed to update book. Please try again.");
    }
  }

  renderLibraryView() {
    const output = document.getElementById("output");
    if (!output) {
      console.error("#output element not found in DOM");
      return;
    }

    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) searchContainer.classList.remove("hidden");

    this.bookView.renderLibraryView(this.books, output);
  }

  async renderBookView(bookId) {
    try {
      const bookData = await this.apiService.getBook(bookId);
      if (!bookData) {
        this.router.navigate("#library");
        return;
      }

      // Convert plain object to Book instance
      const book = new Book(bookData);
      book.id = bookData.id; // Preserve the ID
      book.comments = bookData.comments || []; // Preserve comments

      // Map created_at to timestamp for all comments
      book.comments = (bookData.comments || []).map((comment) => ({
        ...comment,
        timestamp: comment.timestamp || comment.created_at,
      }));

      const output = document.getElementById("output");
      if (!output) {
        console.error("#output element not found in DOM");
        return;
      }

      output.innerHTML = "";
      const searchContainer = document.querySelector(".search-container");
      if (searchContainer) searchContainer.classList.add("hidden");

      const detailView = this.commentView.createDetailView(book);
      output.appendChild(detailView);
    } catch (error) {
      console.error("Error rendering book view:", error);
      this.showError("Failed to load book details.");
    }
  }
  // NEW: Show error messages to user
  showError(message) {
    const output = document.getElementById("output");
    if (!output) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText =
      "background: #fee; color: #c00; padding: 1rem; margin: 1rem; border-radius: 4px;";

    output.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}
