// views/bookView.js
export class BookView {
  constructor({
    onAddBook = () => {},
    onDeleteBook = () => {},
    onNavigate = () => {},
  } = {}) {
    this.callbacks = { onAddBook, onDeleteBook, onNavigate };
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

  // Methods that need callbacks
  createButtonsContainer(book) {
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-container");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");

    // Delete calls back to the manager
    deleteButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this book?")) {
        this.callbacks.onDeleteBook(book.id);
      }
    });

    buttonsContainer.appendChild(deleteButton);

    return buttonsContainer;
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

    // Buttons container
    const buttonsContainer = this.createButtonsContainer(book);

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
  renderLibraryView(books, outputEl) {
    outputEl.innerHTML = "";
    const libraryContainer = document.createElement("div");
    libraryContainer.classList.add("library-container");

    books.forEach((book) => {
      const preview = document.createElement("div");
      preview.classList.add("book", "preview");

      const displayContainer = this.createDisplayContainer(book);
      const buttons = this.createButtonsContainer(book);

      // Add a "View Book Page" button (use onNavigate callback)
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View Book Page";
      viewBtn.classList.add("view-btn");
      viewBtn.addEventListener("click", () => {
        this.callbacks.onNavigate(`#book-${book.id}`);
      });
      buttons.appendChild(viewBtn);

      preview.appendChild(displayContainer);
      preview.appendChild(buttons);

      libraryContainer.appendChild(preview);
    });

    outputEl.appendChild(libraryContainer);
  }
}
