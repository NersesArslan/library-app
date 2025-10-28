export class CommentView {
  constructor({ onNavigate = () => {}, onRenderBook = () => {} } = {}) {
    this.callbacks = { onNavigate, onRenderBook };
  }

  createCommentForm() {
    const form = document.createElement("form");
    form.classList.add("comment-form");

    const textArea = document.createElement("textarea");
    textArea.placeholder = "Add a passage, quote, or note...";
    textArea.classList.add("comment-input");

    const pageInput = document.createElement("input");
    pageInput.type = "text";
    pageInput.placeholder = "Page number (optional)";
    pageInput.classList.add("page-input");

    const typeSelect = document.createElement("select");
    typeSelect.classList.add("comment-type");
    ["quote", "note", "insight"].forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      typeSelect.appendChild(option);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Save";
    submitButton.classList.add("save-btn");

    form.append(textArea, pageInput, typeSelect, submitButton);
    return { form, textArea, pageInput, typeSelect };
  }

  createCommentElement(comment, book) {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment", comment.type);

    const header = document.createElement("div");
    header.classList.add("comment-header");

    const typeLabel = document.createElement("span");
    typeLabel.classList.add("comment-type-label");
    typeLabel.textContent =
      comment.type.charAt(0).toUpperCase() + comment.type.slice(1);

    const pageLabel = document.createElement("span");
    pageLabel.classList.add("comment-page");
    pageLabel.textContent = comment.page ? `Page ${comment.page}` : "";

    const date = new Date(comment.timestamp).toLocaleDateString();
    const timeLabel = document.createElement("span");
    timeLabel.classList.add("comment-time");
    timeLabel.textContent = date;

    header.append(typeLabel, pageLabel, timeLabel);

    const content = document.createElement("div");
    content.classList.add("comment-content");
    content.textContent = comment.text;

    const actions = document.createElement("div");
    actions.classList.add("comment-actions");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () =>
      this.editComment(comment, commentElement, book)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this comment?")) {
        book.deleteComment(comment.id);
        this.callbacks.onRenderBook(book.id);
      }
    });

    actions.append(editBtn, deleteBtn);
    commentElement.append(header, content, actions);
    return commentElement;
  }
  createDetailView(book) {
    const detailElement = document.createElement("div");
    detailElement.classList.add("book-detail");

    const backButton = document.createElement("button");
    backButton.textContent = "← Back to Library";
    backButton.classList.add("back-btn");
    backButton.addEventListener("click", () => {
      this.callbacks.onNavigate("#library");
    });

    // Create a centered container for title and author
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("book-detail-content");

    const titleElement = document.createElement("h1");
    titleElement.classList.add("book-title");
    titleElement.textContent = book.title;

    const authorElement = document.createElement("h2");
    authorElement.classList.add("book-author");
    authorElement.textContent = book.author;

    contentContainer.appendChild(titleElement);
    contentContainer.appendChild(authorElement);

    // Add comments section
    const commentsSection = document.createElement("div");
    commentsSection.classList.add("comments-section");

    const commentsHeader = document.createElement("h3");
    commentsHeader.textContent = "Passages & Notes";
    commentsHeader.classList.add("comments-header");

    // Add comment form
    const { form, textArea, pageInput, typeSelect } = this.createCommentForm();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (textArea.value.trim()) {
        book.addComment(
          textArea.value.trim(),
          pageInput.value.trim(),
          typeSelect.value
        );
        this.callbacks.onRenderBook(book.id);
      }
    });

    // Add existing comments
    const commentsList = document.createElement("div");
    commentsList.classList.add("comments-list");
    book.comments.forEach((comment) => {
      commentsList.appendChild(this.createCommentElement(comment, book));
    });

    commentsSection.append(commentsHeader, form, commentsList);

    detailElement.appendChild(backButton);
    detailElement.appendChild(contentContainer);
    detailElement.appendChild(commentsSection);

    return detailElement;
  }

  editComment(comment, commentElement, book) {
    const { form, textArea, pageInput } = this.createCommentForm();
    textArea.value = comment.text;
    pageInput.value = comment.page || "";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.callbacks.onRenderBook(book.id);
    });

    form.appendChild(cancelBtn);
    commentElement.replaceWith(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      book.editComment(comment.id, textArea.value, pageInput.value);
      this.callbacks.onRenderBook(book.id);
    });
  }
}
