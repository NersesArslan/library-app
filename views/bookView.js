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

    if (book.thumbnail) {
      const img = document.createElement("img");
      img.src = book.thumbnail;
      img.alt = book.title;
      img.classList.add("book-thumbnail");
      displayContainer.appendChild(img);
    }

    const titleContainer = document.createElement("div");
    titleContainer.classList.add("title-container");

    const title = document.createElement("h3");
    title.textContent = book.title;
    title.classList.add("book-title");

    if (book.title.length > 40) {
      title.classList.add("truncated");

      const showMoreBtn = document.createElement("button");
      showMoreBtn.textContent = "Show more";
      showMoreBtn.classList.add("show-more-btn");

      showMoreBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Don't trigger card click
        title.classList.toggle("truncated");
        showMoreBtn.textContent = title.classList.contains("truncated")
          ? "Show more"
          : "Show less";
      });

      titleContainer.append(title, showMoreBtn);
    } else {
      titleContainer.appendChild(title);
    }
    const authorElement = document.createElement("h2");
    authorElement.classList.add("book-author");
    authorElement.textContent = book.author;

    displayContainer.appendChild(titleContainer);
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
      this.showDeleteModal(
        `Are you sure you want to delete "${book.title}"? This will also delete all its quotes.`,
        () => {
          this.callbacks.onDeleteBook(book.id);
        }
      );
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

  showDeleteModal(message, onConfirm) {
    // Create modal overlay
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content", "delete-modal");

    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    messageEl.style.marginBottom = "1.5rem";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "1rem";
    buttonContainer.style.justifyContent = "center";

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Delete";
    confirmBtn.classList.add("delete-btn");
    confirmBtn.addEventListener("click", () => {
      modal.remove();
      onConfirm();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.addEventListener("click", () => {
      modal.remove();
    });

    buttonContainer.append(cancelBtn, confirmBtn);
    modalContent.append(messageEl, buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}
