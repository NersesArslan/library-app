// Simple router for handling page navigation

export class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;

    // Handle hash changes
    window.addEventListener("hashchange", () => {
      this.handleRoute(window.location.hash);
    });
  }
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  handleRoute(hash) {
    if (hash.startsWith("#book-")) {
      const bookId = hash.replace("#book-", "");
      this.routes["#book"](bookId);
    } else {
      const handler = this.routes[hash] || this.routes["#library"];
      handler();
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}
