// services/apiService.js
// Add this new service to your frontend to communicate with the backend

export class ApiService {
  constructor() {
    // Update this URL based on your deployment
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // ============== BOOK METHODS ==============

  async getAllBooks() {
    return this.request("/books");
  }

  async getBook(id) {
    return this.request(`/books/${id}`);
  }

  async addBook(bookData) {
    return this.request("/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id, title, author) {
    return this.request(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, author }),
    });
  }

  async deleteBook(id) {
    return this.request(`/books/${id}`, {
      method: "DELETE",
    });
  }

  // ============== COMMENT METHODS ==============

  async getComments(bookId) {
    return this.request(`/books/${bookId}/comments`);
  }

  async addComment(bookId, commentData) {
    return this.request(`/books/${bookId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(id, text, page) {
    return this.request(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ text, page }),
    });
  }

  async deleteComment(id) {
    return this.request(`/comments/${id}`, {
      method: "DELETE",
    });
  }
}
