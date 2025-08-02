# QuickDesk Help Desk Solution

QuickDesk is a simple, offline-ready help desk application built with Node.js, Express, SQLite, and a responsive HTML/CSS/JS frontend. It features user authentication, ticket management, comments, and role-based views for end-users, support agents, and admins.

## Features
- User authentication (register/login, roles: end-user, support, admin)
- Ticket creation, dashboard, filtering, sorting
- Ticket status transitions (Open → In Progress → Resolved → Closed)
- Comment system per ticket
- Support/admin views for managing tickets and categories
- Simulated email notifications (console logs)
- Offline/local development (no external APIs)

## Project Structure
```
/frontend
  index.html
  styles.css
  script.js
/backend
  server.js
  database.js
/data
  sqlite.db
README.md
```

## Setup Instructions

1. **Install dependencies**
   ```
   npm install express sqlite3
   ```
2. **Start the server**
   ```
   node backend/server.js
   ```
3. **Open `frontend/index.html` in your browser**

- The database (`data/sqlite.db`) is auto-generated and seeded with demo users and a sample ticket on first run.
- All credentials and data are local and for demo/testing only.

## Default Users
- End User: `user1` / `password123`
- Support Agent: `agent1` / `password123`
- Admin: `admin1` / `password123`

---

**For development/demo only. Not for production use.**
