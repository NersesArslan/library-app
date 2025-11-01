// models/book.js - Updated with backend integration
import { ApiService } from "../services/apiService.js";

// Generate a UUID using WebCrypto API
function generateUUID() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);

  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;

  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

export class Book {
  constructor(bookData) {
    this.title = bookData.title;
    this.author = bookData.author;
    this.id = bookData.id || generateUUID();
    this.comments = bookData.comments || [];
    this.thumbnail = bookData.thumbnail || null;
    this.description = bookData.description || "";
    this.publishedDate =
      bookData.publishedDate || bookData.published_date || "";
    this.pageCount = bookData.pageCount || bookData.page_count || null;
    this.categories = bookData.categories || [];
    this.isbn = bookData.isbn || null;

    // Create API service instance for backend calls
    this.apiService = new ApiService();
  }

  // UPDATED: Save comment to backend
  async addComment(text, page = "", type = "note") {
    const comment = {
      id: generateUUID(),
      text,
      page,
      type,
      timestamp: new Date().toISOString(),
    };

    try {
      // Save to backend
      const savedComment = await this.apiService.addComment(this.id, comment);

      // Update local state
      this.comments.push(savedComment);
      return savedComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // UPDATED: Delete comment from backend
  async deleteComment(commentId) {
    try {
      await this.apiService.deleteComment(commentId);
      this.comments = this.comments.filter(
        (comment) => comment.id !== commentId
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  // UPDATED: Update comment in backend
  async editComment(commentId, newText, newPage) {
    try {
      await this.apiService.updateComment(commentId, newText, newPage);

      const comment = this.comments.find((c) => c.id === commentId);
      if (comment) {
        comment.text = newText;
        if (newPage !== undefined) comment.page = newPage;
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      throw error;
    }
  }
}
