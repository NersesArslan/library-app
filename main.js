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

const output = document.getElementById("output");

function displayLibrary(array) {
  output.innerHTML = "";
  array.forEach((book) => {
    const newBookElemenmt = document.createElement("div");
    newBookElemenmt.classList.add("book");
    newBookElemenmt.textContent = `${book.title} by ${book.author}`;

    output.appendChild(newBookElemenmt);
  });
}

const showFormButton = document.getElementById("showFormButton");
const myForm = document.getElementById("myForm");

myForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(myForm);
  const data = Object.fromEntries(formData.entries());

  addBookToLibrary(data.title, data.author);
  displayLibrary(myLibrary);
});

showFormButton.addEventListener("click", () => {
  if (myForm.style.display === "none") {
    myForm.style.display = "block";
    showFormButton.innerHTML = "Close Form";
  } else {
    myForm.style.display = "none";
    showFormButton.innerHTML = "Show Form";
  }
});

displayLibrary(myLibrary);
