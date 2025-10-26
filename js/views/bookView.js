// views/bookView.js
export class BookView {
  constructor({
    onAddBook = () => {},
    onDeleteBook = () => {},
    onEditBook = () => {},
    onNavigate = () => {},
  } = {}) {
    this.callbacks = { onAddBook, onDeleteBook, onEditBook, onNavigate };
  }

  // Start with simple methods
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
    editButton.addEventListener("click", () => {
      displayContainer.classList.add("hidden");
      editContainer.classList.remove("hidden");
    });

    // Delete calls back to the manager
    deleteButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this book?")) {
        this.callbacks.onDeleteBook(book.id);
      }
    });

    buttonsContainer.appendChild(editButton);
    buttonsContainer.appendChild(deleteButton);

    return buttonsContainer;
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

    saveButton.addEventListener("click", () => {
      const newTitle = titleInput.value.trim();
      const newAuthor = authorInput.value.trim();
      if (!newTitle || !newAuthor) {
        alert("Title and author are required.");
        return;
      }
      // Tell LibraryManager to persist the change
      this.callbacks.onEditBook(book.id, newTitle, newAuthor);
      // Optimistically update UI and toggle back
      const titleEl = displayContainer.querySelector(".book-title");
      const authorEl = displayContainer.querySelector(".book-author");
      if (titleEl) titleEl.textContent = newTitle;
      if (authorEl) authorEl.textContent = `by ${newAuthor}`;
      editContainer.classList.add("hidden");
      displayContainer.classList.remove("hidden");
    });

    cancelButton.addEventListener("click", () => {
      titleInput.value = book.title;
      authorInput.value = book.author;
      editContainer.classList.add("hidden");
      displayContainer.classList.remove("hidden");
    });

    editContainer.appendChild(titleInput);
    editContainer.appendChild(authorInput);
    editContainer.appendChild(saveButton);
    editContainer.appendChild(cancelButton);

    return editContainer;
  }

  renderLibraryView(books, outputEl) {
    outputEl.innerHTML = "";
    const libraryContainer = document.createElement("div");
    libraryContainer.classList.add("library-container");

    books.forEach((book) => {
      const preview = document.createElement("div");
      preview.classList.add("book", "preview");

      const displayContainer = this.createDisplayContainer(book);
      const editContainer = this.createEditContainer(book, displayContainer);
      const buttons = this.createButtonsContainer(
        book,
        displayContainer,
        editContainer
      );

      // Add a "View Book Page" button (use onNavigate callback)
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View Book Page";
      viewBtn.classList.add("view-btn");
      viewBtn.addEventListener("click", () => {
        this.callbacks.onNavigate(`#book-${book.id}`);
      });
      buttons.appendChild(viewBtn);

      preview.appendChild(displayContainer);
      preview.appendChild(editContainer);
      preview.appendChild(buttons);

      libraryContainer.appendChild(preview);
    });

    outputEl.appendChild(libraryContainer);
  }
}
