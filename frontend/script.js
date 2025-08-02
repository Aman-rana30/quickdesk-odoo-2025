// script.js
// QuickDesk SPA logic (authentication, navigation, ticket management, API calls)

/**
 * Constants for ticket statuses and roles
 */
const STATUS_OPEN = "Open";
const STATUS_IN_PROGRESS = "In Progress";
const STATUS_RESOLVED = "Resolved";
const STATUS_CLOSED = "Closed";
const ROLE_END_USER = "end-user";
const ROLE_SUPPORT = "support";
const ROLE_ADMIN = "admin";

/**
 * Main app state
 */
let state = {
  user: null, // { id, username, role }
  tickets: [],
  categories: [],
  filter: "Open",
  sort: "recent"
};

/**
 * Utility: Fetch wrapper with JSON
 * @param {string} url
 * @param {object} options
 * @returns {Promise<any>}
 */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API Error");
  return data;
}

/**
 * Render navigation bar based on user role
 */
function renderNav() {
  const navLinks = document.getElementById("nav-links");
  if (!state.user) {
    navLinks.innerHTML = `<a href="#login" id="nav-login">Login</a> <a href="#register" id="nav-register">Register</a>`;
    return;
  }
  let html = `<a href="#dashboard" id="nav-dashboard">Dashboard</a>`;
  if (state.user.role === ROLE_END_USER) {
    html += `<a href="#create" id="nav-create">New Ticket</a>`;
  }
  if (state.user.role === ROLE_SUPPORT) {
    html += `<a href="#all-tickets" id="nav-all-tickets">All Tickets</a>`;
  }
  if (state.user.role === ROLE_ADMIN) {
    html += `<a href="#categories" id="nav-categories">Categories</a>`;
  }
  html += `<button id="nav-logout">Logout</button>`;
  navLinks.innerHTML = html;
  document.getElementById("nav-logout").onclick = logout;
}

/**
 * SPA router
 */
window.addEventListener("hashchange", renderApp);
document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderApp();
});

/**
 * Render main app view
 */
function renderApp() {
  const app = document.getElementById("app");
  if (!state.user) {
    if (location.hash === "#register") return renderRegister();
    return renderLogin();
  }
  switch (location.hash) {
    case "#create":
      if (state.user.role === ROLE_END_USER) return renderCreateTicket();
      break;
    case "#all-tickets":
      if (state.user.role === ROLE_SUPPORT) return renderAllTickets();
      break;
    case "#categories":
      if (state.user.role === ROLE_ADMIN) return renderCategories();
      break;
    case "#ticket":
      return renderTicketDetail();
    default:
      return renderDashboard();
  }
}

/**
 * Render login form
 */
function renderLogin() {
  const app = document.getElementById("app");
  app.innerHTML = `<h2>Login</h2>
    <form id="login-form">
      <input type="text" id="login-username" placeholder="Username" required />
      <input type="password" id="login-password" placeholder="Password" required />
      <button type="submit">Login</button>
      <div id="login-error" class="error"></div>
    </form>`;
  document.getElementById("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    try {
      const data = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      state.user = data.user;
      renderNav();
      location.hash = "#dashboard";
    } catch (err) {
      document.getElementById("login-error").textContent = err.message;
    }
  };
}

/**
 * Render register form
 */
function renderRegister() {
  const app = document.getElementById("app");
  app.innerHTML = `<h2>Register</h2>
    <form id="register-form">
      <input type="text" id="register-username" placeholder="Username" required />
      <input type="password" id="register-password" placeholder="Password" required />
      <button type="submit">Register</button>
      <div id="register-error" class="error"></div>
    </form>`;
  document.getElementById("register-form").onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;
    try {
      const data = await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      state.user = data.user;
      renderNav();
      location.hash = "#dashboard";
    } catch (err) {
      document.getElementById("register-error").textContent = err.message;
    }
  };
}

/**
 * Logout user
 */
function logout() {
  state.user = null;
  renderNav();
  location.hash = "#login";
}

// ...
// Further SPA logic (dashboard, ticket creation, ticket detail, support/admin views)
// Will be implemented in subsequent steps to keep code under the limit
