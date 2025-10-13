// Simple router for handling page navigation
class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;

    // Handle hash changes
    window.addEventListener("hashchange", () => {
      this.handleRoute(window.location.hash);
    });
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  handleRoute(hash) {
    if (hash.startsWith("#book-")) {
      const bookId = hash.replace("#book-", "");
      this.routes["#book"](bookId);
    } else {
      const handler = this.routes[hash] || this.routes["#library"];
      handler();
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}

const myForm = document.querySelector("#myForm");
const output = document.querySelector("#output");
// Book class. Creates book objects
class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
    this.id = crypto.randomUUID();
  }
}

class LibraryManager {
  constructor() {
    this.books = [];
    this.router = new Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.addRoute("#library", () => this.renderLibraryView());
    this.router.addRoute("#book", (id) => this.renderBookView(id));

    // Handle initial route
    const hash = window.location.hash || "#library";
    this.router.handleRoute(hash);
  }

  addBook(title, author) {
    const book = new Book(title, author);
    this.books.push(book);
    this.renderLibraryView();
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

    detailElement.appendChild(backButton);
    detailElement.appendChild(contentContainer);

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
    output.innerHTML = "";
    const libraryContainer = document.createElement("div");
    libraryContainer.classList.add("library-container");

    myForm.classList.remove("hidden");

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

    output.innerHTML = "";
    myForm.classList.add("hidden");

    const detailView = this.createDetailView(book);
    output.appendChild(detailView);
  }
}

// Create an instance of LibraryManager
const library = new LibraryManager();

myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const titleValue = document.querySelector("#title").value.trim();
  const authorValue = document.querySelector("#author").value.trim();

  if (titleValue && authorValue) {
    library.addBook(titleValue, authorValue);
    myForm.reset();
  }
});
