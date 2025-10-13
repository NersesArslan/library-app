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

let Library = [];

function addBook(title, author) {
  const book = new Book(title, author);
  Library.push(book);
  render();
  console.log(Library);
}

function render() {
  output.innerHTML = "";

  Library.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book");
    const headerElement = document.createElement("h1");
    headerElement.classList.add("book-title");
    const authorElement = document.createElement("h2");
    authorElement.classList.add("book-author");
    headerElement.textContent = `${book.title}`;
    authorElement.textContent = `${book.author}`;
    bookElement.appendChild(headerElement);
    bookElement.appendChild(authorElement);

    output.appendChild(bookElement);
  });
}

myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const titleValue = document.querySelector("#title").value.trim();
  const authorValue = document.querySelector("#author").value.trim();

  if (titleValue && authorValue) {
    addBook(titleValue, authorValue);
    myForm.reset();
  }
});
