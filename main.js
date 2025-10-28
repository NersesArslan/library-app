import { LibraryManager } from "./managers/libraryManager.js";

// Create an instance of LibraryManager
window.addEventListener("DOMContentLoaded", () => {
  // instantiate after DOM is ready to avoid timing issues when this file is
  // loaded as a module (and to ensure elements like #output exist)
  const library = new LibraryManager();
  // expose for debugging
  window.library = library;
});
