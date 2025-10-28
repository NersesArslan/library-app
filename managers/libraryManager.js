import { Router } from "../services/router.js";
import { Book } from "../models/book.js";
import { BookService } from "../services/bookService.js";
import { BookView } from "../views/bookView.js";
import { SearchView } from "../views/searchView.js";
import { CommentView } from "../views/commentView.js";

export class LibraryManager {
  constructor() {
    this.books = [];
    this.router = new Router();
    this.bookService = new BookService();
    this.bookView = new BookView({
      onAddBook: (data) => this.addBook(data),
      onDeleteBook: (id) => this.deleteBook(id),
      onEditBook: (id, title, author) => this.editBook(id, title, author),
      onNavigate: (path) => this.router.navigate(path),
    });

    // Instantiate views with their callbacks
    this.searchView = new SearchView({
      onAddBook: (data) => this.addBook(data),
    });

    this.commentView = new CommentView({
      onNavigate: (path) => this.router.navigate(path),
      onRenderBook: (id) => this.renderBookView(id),
    });
    this.setupRoutes();
    this.setupSearchHandler();
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
          // delegate rendering to the SearchView
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

    // Handle initial route
    const hash = window.location.hash || "#library";
    this.router.handleRoute(hash);
  }

  addBook(bookData) {
    const book = new Book(bookData);
    console.debug("addBook: preparing to add", bookData && bookData.title);
    this.books.push(book);
    console.debug("addBook: books count after push", this.books.length);
    this.renderLibraryView();
    // After adding a book, clear the search results and reset the search input
    // so the search list closes and doesn't remain visible.
    const searchResults = document.getElementById("searchResults");
    if (searchResults) searchResults.innerHTML = "";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = "";
      // remove focus from the input so any dropdown/UX closes
      searchInput.blur();
    }

    console.log(this.books);
  }

  deleteBook(id) {
    this.books = this.books.filter((book) => book.id !== id);
    this.renderLibraryView();
  }

  editBook(id, newTitle, newAuthor) {
    const book = this.books.find((book) => book.id === id);
    if (book) {
      book.title = newTitle;
      book.author = newAuthor;
      this.renderLibraryView();
    }
  }
  renderLibraryView() {
    const output = document.getElementById("output");
    if (!output) {
      console.error("#output element not found in DOM");
      return;
    }

    // Manager still controls whether search form is visible
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) searchContainer.classList.remove("hidden");

    // Delegate rendering to the view
    this.bookView.renderLibraryView(this.books, output);
  }

  renderBookView(bookId) {
    const book = this.books.find((book) => book.id === bookId);
    if (!book) {
      this.router.navigate("#library");
      return;
    }

    const output = document.getElementById("output");
    if (!output) {
      console.error("#output element not found in DOM");
      return;
    }

    output.innerHTML = "";
    // Hide search form in book detail view
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) searchContainer.classList.add("hidden");

    const detailView = this.commentView.createDetailView(book);
    output.appendChild(detailView);
  }
}
