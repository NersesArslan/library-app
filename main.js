function Book(title, author) {
  this.title = title;
  this.author = author;
  this.id = crypto.randomUUID();
}

const LibraryManager = {
  books: [],

  addBook(title, author) {
    const book = new Book(title, author);
    this.books.push(book);
    this.render();
  },

  deleteBook(id) {
    this.books = this.books.filter((book) => book.id !== id);
    this.render();
  },

  render() {
    output.innerHTML = "";
    this.books.forEach((book) => {
      const bookElement = document.createElement("div");
      bookElement.classList.add("book");
      bookElement.textContent = `${book.title} by ${book.author}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "x";
      deleteBtn.addEventListener("click", () => {
        this.deleteBook(book.id);
      });
      bookElement.addEventListener("click", () => {
        location.hash = book.id;
      });
      bookElement.appendChild(deleteBtn);
      output.appendChild(bookElement);
    });
  },
};

window.addEventListener("hashchange", () => {
  const bookId = location.hash.slice(1);
  if (!bookId) {
    LibraryManager.render(); // back to full list
    return;
  }

  const book = LibraryManager.books.find((b) => b.id === bookId);
  if (book) {
    renderBookDetail(book);
  }
});

window.addEventListener("load", () => {
  if (location.hash) {
    const bookId = location.hash.slice(1);
    const book = LibraryManager.books.find((b) => b.id === bookId);
    if (book) {
      renderBookDetail(book);
    }
  }
});

function processFormData(formElement) {
  const formData = new FormData(formElement);
  const data = Object.fromEntries(formData.entries());
  LibraryManager.addBook(data.title, data.author);
  formElement.reset();
}

function toggleFormVisibility(formElement, toggleButton) {
  const isHidden = formElement.style.display === "none";
  formElement.style.display = isHidden ? "block" : "none";
  toggleButton.innerHTML = isHidden ? "Close Form" : "Show Form";
}

function initUI(formElement, toggleButton) {
  toggleButton.addEventListener("click", () => {
    toggleFormVisibility(formElement, toggleButton);
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

window.addEventListener("hashchange", () => {
  const bookId = location.hash.slice(1);
  const book = LibraryManager.books.find((b) => b.id === bookId);
  if (book) renderBookDetail(book);
});

function renderBookDetail(book) {
  output.innerHTML = `
    <div class="book-detail">
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author}</p>
      <button onclick="location.hash = ''">Back</button>
    </div>
  `;

  document.getElementById("backButton").addEventListener("click", () => {
    location.hash = ""; // triggers hashchange
  });
}

const showFormButton = document.getElementById("showFormButton");
const myForm = document.getElementById("myForm");

LibraryManager.addBook("Madame Bovary", "Gustave Flaubert");
LibraryManager.addBook("Ulysses", "James Joyce");
LibraryManager.addBook("The Autobiography of Malcom X", "Alex Hailey");

initUI(myForm, showFormButton);
