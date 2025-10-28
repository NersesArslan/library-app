export class SearchView {
  constructor({ onAddBook = () => {} } = {}) {
    this.callbacks = { onAddBook };
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
        try {
          if (typeof this.callbacks.onAddBook === "function") {
            this.callbacks.onAddBook(bookData);
          } else {
            console.warn("SearchView: onAddBook callback not provided");
          }
        } catch (err) {
          console.error("Error in onAddBook callback:", err);
        }
      });

      searchResults.appendChild(resultElement);
      console.debug(
        `displaySearchResults: appended result for ${bookData.title}`
      );
    });
  }
}
