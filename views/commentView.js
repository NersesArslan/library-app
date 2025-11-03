export class CommentView {
  constructor({ onNavigate = () => {}, onRenderBook = () => {} } = {}) {
    this.callbacks = { onNavigate, onRenderBook };
  }

  createCommentForm() {
    const form = document.createElement("form");
    form.classList.add("comment-form");

    const textArea = document.createElement("textarea");
    textArea.placeholder = "Add a quote";
    textArea.classList.add("comment-input");

    const pageInput = document.createElement("input");
    pageInput.type = "text";
    pageInput.placeholder = "Page number (optional)";
    pageInput.classList.add("page-input");

    const typeSelect = document.createElement("select");
    typeSelect.classList.add("comment-type");
    ["quote"].forEach((type) => {
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
      this.showDeleteModal(async () => {
        try {
          await book.deleteComment(comment.id);
          this.callbacks.onRenderBook(book.id);
        } catch (error) {
          console.error("Error deleting comment:", error);
          alert("Failed to delete comment. Please try again.");
        }
      });
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
    commentsHeader.textContent = "";
    commentsHeader.classList.add("comments-header");

    // Add comment form
    const { form, textArea, pageInput, typeSelect } = this.createCommentForm();
    form.addEventListener("submit", async (e) => {
      // ADDED: async
      e.preventDefault();
      if (textArea.value.trim()) {
        try {
          await book.addComment(
            // ADDED: await
            textArea.value.trim(),
            pageInput.value.trim(),
            typeSelect.value
          );
          this.callbacks.onRenderBook(book.id);
        } catch (error) {
          console.error("Error adding comment:", error);
          alert("Failed to add comment. Please try again.");
        }
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
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const { form, textArea, pageInput } = this.createCommentForm();
    textArea.value = comment.text;
    pageInput.value = comment.page || "";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.remove();
    });

    form.appendChild(cancelBtn);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await book.editComment(comment.id, textArea.value, pageInput.value);
        modal.remove(); // Close modal
        this.callbacks.onRenderBook(book.id);
      } catch (error) {
        console.error("Error editing comment:", error);
        alert("Failed to edit comment. Please try again.");
      }
    });
  }

  showDeleteModal(onConfirm) {
    // Create modal overlay
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content", "delete-modal");

    const message = document.createElement("p");
    message.textContent = "Are you sure you want to delete this comment?";
    message.style.marginBottom = "1.5rem";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "1rem";
    buttonContainer.style.justifyContent = "center";

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Delete";
    confirmBtn.classList.add("delete-btn");
    confirmBtn.addEventListener("click", () => {
      modal.remove();
      onConfirm();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.addEventListener("click", () => {
      modal.remove();
    });

    buttonContainer.append(cancelBtn, confirmBtn);
    modalContent.append(message, buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}
