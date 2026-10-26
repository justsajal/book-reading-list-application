const STORAGE_KEY = "my-reading-list-v1";
let books = loadBooks();
let activeStatus = "All";

const form = document.getElementById("bookForm");
const titleInput = document.getElementById("titleInput");
const authorInput = document.getElementById("authorInput");
const statusInput = document.getElementById("statusInput");
const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("bookList");
const emptyState = document.getElementById("emptyState");

function loadBooks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function updateStats() {
  document.getElementById("totalCount").textContent = books.length;
  document.getElementById("readingCount").textContent = books.filter(b => b.status === "Reading").length;
  document.getElementById("finishedCount").textContent = books.filter(b => b.status === "Finished").length;
}
function renderBooks() {
  const term = searchInput.value.trim().toLowerCase();
  const visibleBooks = books.filter(book => {
    const matchesStatus = activeStatus === "All" || book.status === activeStatus;
    const matchesSearch = `${book.title} ${book.author}`.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  bookList.innerHTML = visibleBooks.map(book => {
    const statusClass = book.status === "Finished" ? "finished" : book.status === "Reading" ? "reading" : "";
    return `<article class="book-item">
      <div class="book-icon" aria-hidden="true">▤</div>
      <div class="book-info"><strong>${escapeHTML(book.title)}</strong><small>${escapeHTML(book.author || "Author not specified")}</small></div>
      <span class="book-status ${statusClass}">${escapeHTML(book.status)}</span>
      <button class="delete-btn" data-delete="${book.id}" aria-label="Delete ${escapeHTML(book.title)}" title="Delete book">×</button>
    </article>`;
  }).join("");

  emptyState.hidden = visibleBooks.length > 0;
  emptyState.textContent = books.length === 0
    ? "Your list is empty for now. Add a book above to get started."
    : "No books match this search or filter.";
  document.getElementById("listSummary").textContent =
    `${books.length} ${books.length === 1 ? "book" : "books"} in your reading list`;
  updateStats();
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  if (!title) return;

  books.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title,
    author,
    status: statusInput.value
  });
  saveBooks();
  form.reset();
  titleInput.focus();
  renderBooks();
});
bookList.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  books = books.filter(book => book.id !== button.dataset.delete);
  saveBooks();
  renderBooks();
});
searchInput.addEventListener("input", renderBooks);
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activeStatus = button.dataset.status;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderBooks();
}));
renderBooks();
