// Generate a UUID using WebCrypto API
function generateUUID() {
  // Create a typed array of 16 bytes
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);

  // Set version to v4
  array[6] = (array[6] & 0x0f) | 0x40;
  // Set variant to standard
  array[8] = (array[8] & 0x3f) | 0x80;

  // Convert to hex string with proper formatting
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

export class Book {
  constructor(bookData) {
    this.title = bookData.title;
    this.author = bookData.author;
    this.id = generateUUID();
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
      id: generateUUID(),
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
