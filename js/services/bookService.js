export class BookService {
  /**
   * Searches for books using Google Books API
   * @param {string} query - The search query
   * @returns {Promise<Array>} Array of formatted book data
   */
  async searchBooks(query) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    return data.items ? data.items.map(this.formatBookData) : [];
  }

  /**
   * Formats raw Google Books API data into our app's book format
   * @param {Object} bookData - Raw book data from API
   * @returns {Object} Formatted book data
   */
  formatBookData(bookData) {
    const volumeInfo = bookData.volumeInfo;
    return {
      title: volumeInfo.title,
      author: volumeInfo.authors
        ? volumeInfo.authors.join(", ")
        : "Unknown Author",
      thumbnail: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
      description: volumeInfo.description,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories,
      isbn: volumeInfo.industryIdentifiers
        ? volumeInfo.industryIdentifiers.find((id) => id.type === "ISBN_13")
            ?.identifier
        : null,
    };
  }
}
