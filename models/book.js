export class Book {
  constructor(bookData) {
    this.title = bookData.title;
    this.author = bookData.author;
    this.id = crypto.randomUUID();
    this.comments = []; // Array to store comments/passages
    this.thumbnail = bookData.thumbnail || null;
    this.description = bookData.description || "";
    this.publishedDate = bookData.publishedDate || "";
    this.pageCount = bookData.pageCount || null;
    this.categories = bookData.categories || [];
    this.isbn = bookData.isbn || null;
  }

  addComment(text, page = "", type = "note") {
    const comment = {
      id: crypto.randomUUID(),
      text,
      page,
      type, // can be 'quote', 'note', 'insight', etc.
      timestamp: new Date().toISOString(),
    };
    this.comments.push(comment);
    return comment;
  }

  deleteComment(commentId) {
    this.comments = this.comments.filter((comment) => comment.id !== commentId);
  }

  editComment(commentId, newText, newPage) {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) {
      comment.text = newText;
      if (newPage !== undefined) comment.page = newPage;
    }
  }
}
