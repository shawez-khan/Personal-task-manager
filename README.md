# Personal Task Manager (MERN Stack)

A clean, reliable, and production-grade Personal Task Manager built with the MERN stack (MongoDB, Express, React, Node.js). Designed for single-user productivity with full CRUD capabilities, semantic filtering and sorting, resilient validation, and responsive state synchronization.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Configuration](#environment-configuration)
6. [Quick Start & Local Setup](#quick-start--local-setup)
7. [API Specification](#api-specification)
8. [Data Model & Extensions](#data-model--extensions)
9. [Automated Verification & Testing](#automated-verification--testing)
10. [Design & Engineering Highlights](#design--engineering-highlights)

---

## Features

- **Full Task Lifecycle (CRUD):** Create tasks with title, description, priority, status, and due date; view details; modify any attribute; and delete tasks with confirmation.
- **Server-Side Filtering & Sorting:**
  - Status filter tabs: `All`, `Todo`, `In Progress`, `Done`.
  - Semantic priority sorting: `High (3) > Medium (2) > Low (1)` (not naive alphabetical string comparison).
  - Due date sorting: Tasks with due dates sorted accurately; tasks with no due date placed last.
  - Newest / oldest creation date sorting.
- **Immediate UI State Synchronization:**
  - Status dropdown updates local UI immediately with rollback protection on network failure.
  - Adding or deleting tasks updates the list instantly without requiring manual page reload.
- **Resilient Validation & Error Handling:**
  - Empty or whitespace-only titles rejected with HTTP `400`.
  - Invalid enums or malformed dates rejected with HTTP `400`.
  - Malformed MongoDB IDs handled cleanly with HTTP `400` (no unhandled `CastError` crashes).
  - Non-existent IDs return HTTP `404`.
  - Centralized error-handling middleware ensures zero stack trace leakage to clients.
- **Clean, Purposeful UI:**
  - Styled with neutral slate palettes and restrained borders/shadows.
  - Meaningful semantic color badges for priority and lifecycle state.
  - Non-blocking dismissible error banners and loading indicators.
  - Helpful empty state when no tasks match current filters.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite | Component-driven single-page application |
| **Backend** | Node.js, Express.js | REST API routing, controllers, validation middleware |
| **Database** | MongoDB, Mongoose 8 | Document persistence, schema enforcement, indexing |
| **Security & Utilities** | Helmet, CORS, Dotenv | HTTP header hardening, origin whitelisting, configuration |

---

## Project Structure

```
MERN stack/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection with failure handling
│   │   │   └── env.js             # Centralized environment variable loader
│   │   ├── controllers/
│   │   │   └── task.controller.js  # Controller methods for all 5 CRUD operations
│   │   ├── middleware/
│   │   │   ├── errorHandler.js    # Global error-handling middleware (no stack traces)
│   │   │   ├── notFound.js        # 404 handler for unknown routes
│   │   │   └── validate.js        # Express middleware validating inputs and IDs
│   │   ├── models/
│   │   │   └── Task.js            # Mongoose schema, enums, indexes, and hooks
│   │   ├── routes/
│   │   │   └── task.routes.js     # Express router mapping HTTP verbs to controllers
│   │   ├── utils/
│   │   │   ├── ApiError.js        # Custom operational error class
│   │   │   └── asyncHandler.js    # Async wrapper avoiding repetitive try/catch
│   │   ├── app.js                 # Express application configuration
│   │   └── server.js              # Server entry point (connects DB & listens)
│   ├── .env.example               # Environment variables template
│   ├── package.json
│   └── test-api.js                # Self-contained backend API test suite
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── tasksApi.js        # Centralized HTTP client for all task requests
│   │   ├── components/
│   │   │   ├── ErrorBanner.jsx    # Dismissible error notification banner
│   │   │   ├── FilterBar.jsx      # Status filter tabs and sort controls
│   │   │   ├── Loader.jsx         # Non-blocking loading indicator
│   │   │   ├── TaskForm.jsx       # Controlled task creation form with validation
│   │   │   ├── TaskItem.jsx       # Individual task card with status selector
│   │   │   └── TaskList.jsx       # Task list container & empty state renderer
│   │   ├── hooks/
│   │   │   └── useTasks.js        # Single source of truth for task state & mutations
│   │   ├── App.jsx                # Application root layout and state coordinator
│   │   ├── App.css                # Clean, minimal, accessible styling
│   │   ├── index.css              # Design tokens and resets
│   │   └── main.jsx               # React DOM entry point
│   ├── .env.example               # Frontend environment template
│   ├── index.html                 # HTML shell
│   ├── package.json
│   └── vite.config.js             # Vite configuration
├── NOTES.md                       # Required 3 architectural questions answered
├── PRD.md                         # Product requirements document
├── plan.md                        # Master implementation plan
├── rules.md                       # Coding constraints and standards
└── README.md                      # Complete setup and developer documentation
```

---

## Prerequisites

- **Node.js:** v18.0.0 or higher (tested on Node v24 LTS).
- **npm:** v9.0.0 or higher.
- **MongoDB:** A locally running MongoDB instance (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas connection string.

---

## Environment Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Default configuration values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_manager
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
Default configuration values:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Start & Local Setup

### 1. Start the Backend Server

```bash
# Navigate to the backend directory
cd server

# Install dependencies
npm install

# Start in development mode (with hot-reload via nodemon)
npm run dev

# Or start in production mode
npm start
```
The server will connect to MongoDB and start on `http://localhost:5000`.

### 2. Start the Frontend Client

Open a second terminal window:

```bash
# Navigate to the frontend directory
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## API Specification

**Base URL:** `http://localhost:5000/api` (also accessible at root `/tasks` for convenience)

### Endpoints

| Method | Endpoint | Query / Body Params | Success | Description |
|---|---|---|---|---|
| `POST` | `/tasks` | Body: `{ title, description?, priority?, status?, dueDate? }` | `201 Created` | Create a new task with validation |
| `GET` | `/tasks` | Query: `status`, `sortBy`, `order` | `200 OK` | Fetch tasks with filtering and sorting |
| `GET` | `/tasks/:id` | Route param: `:id` (24-hex ObjectId) | `200 OK` | Fetch a single task by ID |
| `PUT` | `/tasks/:id` | Route param: `:id`, Body: partial/full fields | `200 OK` | Update task fields with validation |
| `DELETE` | `/tasks/:id` | Route param: `:id` | `200 OK` | Permanently delete a task |

### Query Parameters for `GET /tasks`
- `status`: Filter by status (`todo`, `in_progress`, `done`). Omit to retrieve all.
- `sortBy`: Attribute to sort by (`createdAt`, `dueDate`, `priority`). Default: `createdAt`.
- `order`: Direction (`asc` or `desc`). Default: `desc` for `createdAt`, `asc` otherwise.

### Standard Error Response Shape
All error responses return structured, clean JSON without exposing internal stack traces:
```json
{
  "success": false,
  "error": {
    "message": "Title is required and cannot be empty",
    "details": [
      {
        "field": "title",
        "message": "Title is required and cannot be empty"
      }
    ]
  }
}
```

---

## Data Model & Extensions

### Task Schema Fields
- `title` (String, required): Trimmed, 1–100 characters. Whitespace-only strings are rejected.
- `description` (String, optional): Trimmed, max 500 characters. Default: `""`.
- `priority` (String, enum): `low`, `medium`, `high`. Default: `medium`.
- `status` (String, enum): `todo`, `in_progress`, `done`. Default: `todo`.
- `dueDate` (Date, optional): Valid date or `null`. Default: `null`.
- `createdAt` (Date, timestamp): Automatically set on creation.

### Documented Extensions
- `updatedAt` (Date, timestamp): Automatically managed by Mongoose `{ timestamps: true }` to track task modifications.
- `priorityRank` (Number, internal helper): Managed via a Mongoose pre-save hook (`high: 3, medium: 2, low: 1`) to enable high-performance database indexing and reliable semantic sorting.

---

## Automated Verification & Testing

The backend includes a self-contained, automated test suite covering all 5 endpoints and edge cases:

```bash
# From the project root or server directory:
node server/test-api.js
```

### Verified Test Cases (19/19 Passing):
1. Health check returns HTTP `200`
2. Whitespace-only title rejected with HTTP `400`
3. Invalid priority value (`"extreme"`) rejected with HTTP `400`
4. Invalid status value (`"finished"`) rejected with HTTP `400`
5. Task creation with valid payload returns HTTP `201`
6. Task creation with minimal payload (title only) assigns correct defaults
7. Task list retrieves array with HTTP `200`
8. Status filtering (`?status=in_progress`) accurately filters collection
9. Priority sorting (`?sortBy=priority&order=desc`) correctly ranks High > Medium > Low
10. Due date sorting (`?sortBy=dueDate`) accurately places null dates last
11. Single task retrieval returns requested document
12. Malformed ObjectId (`/tasks/123-invalid`) returns HTTP `400` with clean message
13. Non-existent valid ObjectId returns HTTP `404`
14. Partial update via `PUT` preserves untouched fields
15. Empty body on `PUT` returns HTTP `400`
16. Task deletion returns HTTP `200`
17. Deleting already-deleted task returns HTTP `404` (idempotency check)
18. Unknown route returns HTTP `404`
19. Error responses contain zero stack traces

---

## Design & Engineering Highlights

1. **Semantic Priority Sorting:** Standard database string sorting orders alphabetically (`high` < `low` < `medium`), which is logically inverted. This project solves that by mapping priorities to numerical weights (`3, 2, 1`) in MongoDB aggregation.
2. **Null Due-Date Handling:** When sorting by due date, tasks without a due date are intelligently placed at the end of the list rather than crowding the top.
3. **Optimistic UI with Automatic Rollback:** When a user updates task status, the UI reflects the change immediately. If the network or server fails, the previous state is restored and an error alert is presented.
4. **No UI Bloat or AI Slop:** Built with purposeful, semantic CSS, clear visual hierarchy, accessible form labels, and zero unnecessary visual gimmicks or heavy third-party framework dependencies.
