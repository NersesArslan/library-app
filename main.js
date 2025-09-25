const myLibrary = [];

function Book(title, author) {
  this.title = title;
  this.author = author;
  this.id = crypto.randomUUID();
}

function addBookToLibrary(title, author) {
  const book = new Book(title, author);
  return myLibrary.push(book);
}

addBookToLibrary("Madame Bovary", "Gustave Flaubert");
addBookToLibrary("Ulysses", "James Joyce");
addBookToLibrary("The Autobiography of Malcom X", "Alex Hailey");

let Library = [
  "To Kill a Mockingbirdm",
  "The Devil Wears Prada",
  "Harry Potter and the Flight",
];

const output = document.getElementById("output");

function displayLibrary(array) {
  output.innerHTML = "";
  array.forEach((book) => {
    const newBookElemenmt = document.createElement("div");
    newBookElemenmt.textContent = book.title;
    output.appendChild(newBookElemenmt);
  });
}

displayLibrary(myLibrary);
