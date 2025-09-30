const output = document.getElementById("output");
const showFormButton = document.getElementById("showFormButton");
const myForm = document.getElementById("myForm");

//Models

function Book(title, author) {
  this.title = title;
  this.author = author;
  this.id = crypto.randomUUID();
}
// === UI Rendering ===

function hideFormAndToggleButton() {
  if (myForm) myForm.style.display = "none";
  if (showFormButton) showFormButton.style.display = "none";
}

function showToggleButton() {
  if (showFormButton) showFormButton.style.display = ""; // restore default display
}

function createBookDetailElement(book) {
  const container = document.createElement("div");
  container.classList.add("book-detail");

  const title = document.createElement("h2");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.innerHTML = `<strong>Author:</strong> ${book.author}`;

  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.addEventListener("click", () => {
    location.hash = "";
  });

  container.append(title, author, backButton);
  return container;
}

function renderBookDetail(book) {
  const detailElement = createBookDetailElement(book);
  // hide the form and its toggle when viewing a detail
  hideFormAndToggleButton();

  output.innerHTML = "";
  output.appendChild(detailElement);
}

function render(books, deleteCallback) {
  // ensure the toggle button is visible in list view
  showToggleButton();

  output.innerHTML = "";
  books.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book");
    bookElement.textContent = `${book.title} by ${book.author}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "x";
    deleteBtn.addEventListener("click", () => {
      deleteCallback(book.id);
    });
    bookElement.addEventListener("click", () => {
      location.hash = book.id;
    });
    bookElement.appendChild(deleteBtn);
    output.appendChild(bookElement);
  });
}

// === Library Logic ===

const LibraryManager = {
  books: [],

  addBook(title, author) {
    const book = new Book(title, author);
    this.books.push(book);
    render(this.books, this.deleteBook.bind(this));
  },

  deleteBook(id) {
    this.books = this.books.filter((book) => book.id !== id);
    render(this.books, this.deleteBook.bind(this));
  },
};

window.addEventListener("hashchange", () => {
  const bookId = location.hash.slice(1);
  if (!bookId) {
    render(
      LibraryManager.books,
      LibraryManager.deleteBook.bind(LibraryManager)
    );
    return;
  }

  const book = LibraryManager.books.find((b) => b.id === bookId);
  if (book) {
    renderBookDetail(book);
  }
});

function processFormData(formElement) {
  const formData = new FormData(formElement);
  const data = Object.fromEntries(formData.entries());
  LibraryManager.addBook(data.title, data.author);
  formElement.reset();
}

function toggleFormVisibility(formElement, toggleButton) {
  // Toggle the hidden class
  const nowHidden = formElement.classList.toggle("hidden");

  // Update button label and ARIA state
  toggleButton.innerHTML = nowHidden ? "Show Form" : "Close Form";
  toggleButton.setAttribute("aria-expanded", String(!nowHidden));
  formElement.setAttribute("aria-hidden", String(nowHidden));
}

function initUI(formElement, toggleButton) {
  toggleButton.addEventListener("click", () => {
    toggleFormVisibility(formElement, toggleButton);
  });

  // === Event Listeners ===

  window.addEventListener("load", () => {
    if (location.hash) {
      const bookId = location.hash.slice(1);
      const book = LibraryManager.books.find((b) => b.id === bookId);
      if (book) {
        renderBookDetail(book);
      }
    }
  });

  formElement.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = formElement.querySelector("#title");
    const authorInput = formElement.querySelector("#author");

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) {
      alert("Please fill in both title and author fields.");
      return;
    }

    processFormData(formElement);
  });
}

function seedLibrary() {
  LibraryManager.addBook("Madame Bovary", "Gustave Flaubert");
  LibraryManager.addBook("Ulysses", "James Joyce");
  LibraryManager.addBook("The Autobiography of Malcom X", "Alex Hailey");
}
seedLibrary();

initUI(myForm, showFormButton);
