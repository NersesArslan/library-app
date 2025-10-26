import { Router } from "./js/services/router.js";
import { Book } from "./js/models/book.js";
import { BookService } from "./js/services/bookService.js";
import { BookView } from "./js/views/bookView.js";

// Book class. Creates book objects

class LibraryManager {
  constructor() {
    this.books = [];
    this.router = new Router();
    this.bookService = new BookService();
    this.setupRoutes();
    this.setupSearchHandler();
  }

  displaySearchResults(results) {
    const searchResults = document.getElementById("searchResults");
    if (!searchResults) {
      console.error("displaySearchResults: #searchResults element not found");
      return;
    }
    console.debug(`displaySearchResults: rendering ${results.length} results`);
    searchResults.innerHTML = "";

    results.forEach((bookData) => {
      const resultElement = document.createElement("div");
      resultElement.classList.add("search-result");

      resultElement.innerHTML = `
        <div class="book-preview">
          ${
            bookData.thumbnail
              ? `<img src="${bookData.thumbnail}" alt="${bookData.title} cover">`
              : ""
          }
          <div class="book-info">
            <h3>${bookData.title}</h3>
            <p>by ${bookData.author}</p>
            ${
              bookData.publishedDate
                ? `<p>Published: ${bookData.publishedDate}</p>`
                : ""
            }
          </div>
        </div>
        <button type="button" class="add-book-btn">Add to Library</button>
      `;

      const addButton = resultElement.querySelector(".add-book-btn");
      addButton.addEventListener("click", () => {
        console.debug(
          "displaySearchResults: addButton clicked for",
          bookData.title
        );
        this.addBook(bookData);
      });

      searchResults.appendChild(resultElement);
      console.debug(
        `displaySearchResults: appended result for ${bookData.title}`
      );
    });
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
          this.displaySearchResults(results);
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

  createBookPreview(book) {
    const previewElement = document.createElement("div");
    previewElement.classList.add("book", "preview");

    // Display container for title and author
    const displayContainer = document.createElement("div");
    displayContainer.classList.add("display-container");

    const titleElement = document.createElement("h2");
    titleElement.classList.add("book-title");
    titleElement.textContent = book.title;

    const authorElement = document.createElement("p");
    authorElement.classList.add("book-author");
    authorElement.textContent = `by ${book.author}`;

    displayContainer.appendChild(titleElement);
    displayContainer.appendChild(authorElement);

    // Edit container (hidden by default)
    const editContainer = this.createEditContainer(book, displayContainer);

    // Buttons container
    const buttonsContainer = this.createButtonsContainer(
      book,
      displayContainer,
      editContainer
    );

    // View details button
    const viewButton = document.createElement("button");
    viewButton.textContent = "View Book Page";
    viewButton.classList.add("view-btn");
    viewButton.addEventListener("click", () => {
      window.location.hash = `#book-${book.id}`;
    });
    buttonsContainer.appendChild(viewButton);

    previewElement.appendChild(displayContainer);
    previewElement.appendChild(editContainer);
    previewElement.appendChild(buttonsContainer);

    return previewElement;
  }

  createCommentForm() {
    const form = document.createElement("form");
    form.classList.add("comment-form");

    const textArea = document.createElement("textarea");
    textArea.placeholder = "Add a passage, quote, or note...";
    textArea.classList.add("comment-input");

    const pageInput = document.createElement("input");
    pageInput.type = "text";
    pageInput.placeholder = "Page number (optional)";
    pageInput.classList.add("page-input");

    const typeSelect = document.createElement("select");
    typeSelect.classList.add("comment-type");
    ["quote", "note", "insight"].forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      typeSelect.appendChild(option);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Save";
    submitButton.classList.add("save-btn");

    form.append(textArea, pageInput, typeSelect, submitButton);
    return { form, textArea, pageInput, typeSelect };
  }

  createCommentElement(comment, book) {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment", comment.type);

    const header = document.createElement("div");
    header.classList.add("comment-header");

    const typeLabel = document.createElement("span");
    typeLabel.classList.add("comment-type-label");
    typeLabel.textContent =
      comment.type.charAt(0).toUpperCase() + comment.type.slice(1);

    const pageLabel = document.createElement("span");
    pageLabel.classList.add("comment-page");
    pageLabel.textContent = comment.page ? `Page ${comment.page}` : "";

    const date = new Date(comment.timestamp).toLocaleDateString();
    const timeLabel = document.createElement("span");
    timeLabel.classList.add("comment-time");
    timeLabel.textContent = date;

    header.append(typeLabel, pageLabel, timeLabel);

    const content = document.createElement("div");
    content.classList.add("comment-content");
    content.textContent = comment.text;

    const actions = document.createElement("div");
    actions.classList.add("comment-actions");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () =>
      this.editComment(comment, commentElement, book)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this comment?")) {
        book.deleteComment(comment.id);
        this.renderBookView(book.id);
      }
    });

    actions.append(editBtn, deleteBtn);
    commentElement.append(header, content, actions);
    return commentElement;
  }

  editComment(comment, commentElement, book) {
    const { form, textArea, pageInput } = this.createCommentForm();
    textArea.value = comment.text;
    pageInput.value = comment.page || "";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.renderBookView(book.id);
    });

    form.appendChild(cancelBtn);
    commentElement.replaceWith(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      book.editComment(comment.id, textArea.value, pageInput.value);
      this.renderBookView(book.id);
    });
  }

  createDetailView(book) {
    const detailElement = document.createElement("div");
    detailElement.classList.add("book-detail");

    const backButton = document.createElement("button");
    backButton.textContent = "← Back to Library";
    backButton.classList.add("back-btn");
    backButton.addEventListener("click", () => {
      this.router.navigate("#library");
    });

    // Create a centered container for title and author
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("book-detail-content");

    const titleElement = document.createElement("h1");
    titleElement.classList.add("book-title");
    titleElement.textContent = book.title;

    const authorElement = document.createElement("h2");
    authorElement.classList.add("book-author");
    authorElement.textContent = book.author;

    contentContainer.appendChild(titleElement);
    contentContainer.appendChild(authorElement);

    // Add comments section
    const commentsSection = document.createElement("div");
    commentsSection.classList.add("comments-section");

    const commentsHeader = document.createElement("h3");
    commentsHeader.textContent = "Passages & Notes";
    commentsHeader.classList.add("comments-header");

    // Add comment form
    const { form, textArea, pageInput, typeSelect } = this.createCommentForm();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (textArea.value.trim()) {
        book.addComment(
          textArea.value.trim(),
          pageInput.value.trim(),
          typeSelect.value
        );
        this.renderBookView(book.id);
      }
    });

    // Add existing comments
    const commentsList = document.createElement("div");
    commentsList.classList.add("comments-list");
    book.comments.forEach((comment) => {
      commentsList.appendChild(this.createCommentElement(comment, book));
    });

    commentsSection.append(commentsHeader, form, commentsList);

    detailElement.appendChild(backButton);
    detailElement.appendChild(contentContainer);
    detailElement.appendChild(commentsSection);

    return detailElement;
  }

  createDisplayContainer(book) {
    const displayContainer = document.createElement("div");
    displayContainer.classList.add("display-container");

    const headerElement = document.createElement("h1");
    headerElement.classList.add("book-title");
    headerElement.textContent = book.title;

    const authorElement = document.createElement("h2");
    authorElement.classList.add("book-author");
    authorElement.textContent = book.author;

    displayContainer.appendChild(headerElement);
    displayContainer.appendChild(authorElement);

    return displayContainer;
  }

  createEditContainer(book, displayContainer) {
    const editContainer = document.createElement("div");
    editContainer.classList.add("edit-container", "hidden");

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = book.title;
    titleInput.classList.add("edit-title");

    const authorInput = document.createElement("input");
    authorInput.type = "text";
    authorInput.value = book.author;
    authorInput.classList.add("edit-author");

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-btn");

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("cancel-btn");

    // Add event listeners
    saveButton.addEventListener("click", () =>
      this.handleSave(book.id, titleInput, authorInput)
    );
    cancelButton.addEventListener("click", () =>
      this.handleCancel(
        editContainer,
        displayContainer,
        book,
        titleInput,
        authorInput
      )
    );

    editContainer.appendChild(titleInput);
    editContainer.appendChild(authorInput);
    editContainer.appendChild(saveButton);
    editContainer.appendChild(cancelButton);

    return editContainer;
  }

  createButtonsContainer(book, displayContainer, editContainer) {
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-container");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-btn");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");

    // Add event listeners
    editButton.addEventListener("click", () =>
      this.handleEdit(displayContainer, editContainer)
    );
    deleteButton.addEventListener("click", () => this.handleDelete(book.id));

    buttonsContainer.appendChild(editButton);
    buttonsContainer.appendChild(deleteButton);

    return buttonsContainer;
  }

  handleSave(bookId, titleInput, authorInput) {
    const newTitle = titleInput.value.trim();
    const newAuthor = authorInput.value.trim();

    if (newTitle && newAuthor) {
      this.editBook(bookId, newTitle, newAuthor);
    }
  }

  handleCancel(editContainer, displayContainer, book, titleInput, authorInput) {
    displayContainer.classList.remove("hidden");
    editContainer.classList.add("hidden");
    titleInput.value = book.title;
    authorInput.value = book.author;
  }

  handleEdit(displayContainer, editContainer) {
    displayContainer.classList.add("hidden");
    editContainer.classList.remove("hidden");
  }

  handleDelete(bookId) {
    if (confirm("Are you sure you want to delete this book?")) {
      this.deleteBook(bookId);
    }
  }

  renderLibraryView() {
    const output = document.getElementById("output");
    if (!output) {
      console.error("#output element not found in DOM");
      return;
    }

    output.innerHTML = "";
    const libraryContainer = document.createElement("div");
    libraryContainer.classList.add("library-container");

    // Show search form in library view
    document.querySelector(".search-container").classList.remove("hidden");

    this.books.forEach((book) => {
      const bookPreview = this.createBookPreview(book);
      libraryContainer.appendChild(bookPreview);
    });

    output.appendChild(libraryContainer);
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
    document.querySelector(".search-container").classList.add("hidden");

    const detailView = this.createDetailView(book);
    output.appendChild(detailView);
  }
}

// Create an instance of LibraryManager
window.addEventListener("DOMContentLoaded", () => {
  // instantiate after DOM is ready to avoid timing issues when this file is
  // loaded as a module (and to ensure elements like #output exist)
  const library = new LibraryManager();
  // expose for debugging
  window.library = library;
});
