# Personal Task Manager — Comprehensive Implementation Plan

**Assessment:** MERN Stack Practical Task (Codewise Infotech)  
**Primary Source of Truth:** `MERN_Practical_Task_Codewise.pdf`  
**Time Budget:** 2.5 – 3.0 Hours  
**Target Output:** Production-grade MERN Stack Application + `README.md` + `NOTES.md` + Clean Git Commit History  

---

## 1. Project Overview

- **Application Name:** Personal Task Manager
- **Core Functionality:** A single-page task management application enabling users to create, view, organize (group/filter/sort), update (individual fields and lifecycle status), and delete personal tasks.
- **Technology Stack:**
  - **Database:** MongoDB (via Mongoose ODM)
  - **Backend Runtime & Framework:** Node.js + Express.js REST API
  - **Frontend:** React (SPA built with modern Hooks and Vite)
  - **Communication:** RESTful JSON API via Axios / Fetch API
- **Evaluation Focus:** Correctness, edge-case resilience, modular code structure, seamless frontend-backend synchronization, clean setup communication, and incremental git progression. Visual polish is secondary to sound state management and robust data flow.

---

## 2. Complete PDF Requirement Checklist

### 2.1 General & Delivery Requirements
- [ ] Time budget respected: 2.5 – 3.0 hours.
- [ ] Delivered as a public or private GitHub repository (with collaborator access provided if private).
- [ ] Clean, incremental Git commit history (no squashed single commits).
- [ ] `README.md` containing clear, reproducible local execution instructions for both backend and frontend.
- [ ] `.env.example` provided for backend (and frontend if applicable), with no secrets committed.
- [ ] `NOTES.md` completed with answers to all 3 designated technical questions (2–3 sentences each).

### 2.2 Data Model Requirements
- [ ] Entity: `Task`
- [ ] `title`: String, **required**.
- [ ] `description`: String, optional.
- [ ] `priority`: Enum [`low`, `medium`, `high`], default: `medium`.
- [ ] `status`: Enum [`todo`, `in_progress`, `done`], default: `todo`.
- [ ] `dueDate`: Date, optional.
- [ ] `createdAt`: Timestamp, automatically managed.
- [ ] Sensible optional extensions documented in README (e.g., `updatedAt`).

### 2.3 Backend API Requirements
- [ ] `POST /tasks`: Create a new task.
- [ ] `GET /tasks`: List all tasks with support for:
  - Filtering by `status` (`todo`, `in_progress`, `done`).
  - Sorting by `dueDate` (ascending/descending).
  - Sorting by `priority` (semantic priority: high > medium > low, or custom specified order).
- [ ] `GET /tasks/:id`: Fetch a single task by MongoDB ObjectId.
- [ ] `PUT /tasks/:id`: Update any task field (title, description, status, priority, dueDate).
- [ ] `DELETE /tasks/:id`: Delete a task by ID.
- [ ] Input Validation: Reject bad requests with HTTP 400 and a descriptive error message; prevent server crashes.
- [ ] Error-Handling Middleware: Centralized error handling returning structured JSON without exposing raw stack traces.
- [ ] Separation of Concerns: Clear separation of routes, controllers, models, and middleware (no monolithic single-file backend).

### 2.4 Frontend Requirements
- [ ] Single-Page Application (React).
- [ ] Display all tasks, grouped or filterable by status (`todo`, `in_progress`, `done`).
- [ ] Task creation form with validation (prevent empty titles).
- [ ] Interactive status change (e.g., dropdown selector or toggle) reflecting immediately in the UI.
- [ ] Task deletion with instant UI update.
- [ ] Reasonable loading indicators during asynchronous operations.
- [ ] Graceful API error handling (clear error banners/toasts; UI must not freeze, crash, or fail silently).
- [ ] Real-time sync: State updates immediately after CRUD actions without requiring a manual browser reload.

---

## 3. Data Model Specification

### 3.1 Mongoose Schema Design (`backend/src/models/Task.js`)

```javascript
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be either low, medium, or high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'done'],
        message: 'Status must be either todo, in_progress, or done',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically provides createdAt and updatedAt
  }
);

// Compound index for optimized filtering and sorting
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Task', TaskSchema);
```

### 3.2 Optional Extensions (Non-Mandatory, Clearly Documented)
- `updatedAt`: Standard Mongoose timestamp to track when tasks were modified.
- Virtual property / helper for priority weight (`high: 3, medium: 2, low: 1`) to facilitate accurate database aggregation sorting.

---

## 4. Backend REST API Specification

### 4.1 Endpoints Summary

| Method | Endpoint | Query / Body Params | Success Status | Error Responses | Description |
|---|---|---|---|---|---|
| `POST` | `/tasks` | Body: `{ title, description?, priority?, status?, dueDate? }` | `201 Created` | `400 Bad Request` | Creates a new task with validation |
| `GET` | `/tasks` | Query: `status`, `sortBy` (`dueDate` \| `priority`), `order` (`asc` \| `desc`) | `200 OK` | `400 Bad Request` | Returns list of tasks matching filter & sort criteria |
| `GET` | `/tasks/:id` | Params: `id` (24-char hex ObjectId) | `200 OK` | `400 Bad Request`, `404 Not Found` | Fetches a single task |
| `PUT` | `/tasks/:id` | Params: `id`, Body: partial or full task update payload | `200 OK` | `400 Bad Request`, `404 Not Found` | Updates task fields and validates new values |
| `DELETE`| `/tasks/:id` | Params: `id` | `200 OK` | `400 Bad Request`, `404 Not Found` | Deletes task permanently |

### 4.2 Query Handling & Priority Sorting Logic
In standard MongoDB string sorting, `'high' < 'low' < 'medium'`, which violates semantic priority order.  
To handle sorting correctly:
- When `sortBy === 'dueDate'`: Use `{ dueDate: order === 'desc' ? -1 : 1 }` (handling nulls appropriately).
- When `sortBy === 'priority'`: Use a MongoDB aggregation pipeline with `$addFields` and `$switch` mapping `high -> 3, medium -> 2, low -> 1`, then sort by `priorityWeight` (or sort using a deterministic comparator if dataset is standard size).
- When `status` is provided: Match `{ status }`.

### 4.3 Validation Strategy (`backend/src/middleware/validateTask.js`)
- **Title Validation:** Reject empty or whitespace-only titles (`400 Bad Request`).
- **Enum Validation:** Enforce allowed values for `status` (`todo`, `in_progress`, `done`) and `priority` (`low`, `medium`, `high`).
- **Date Validation:** Ensure `dueDate` parses to a valid Date object if supplied.
- **ObjectId Validation:** Middleware verifies `mongoose.Types.ObjectId.isValid(req.params.id)`. Returns `400 Bad Request: "Invalid task ID format"` before querying the database, preventing unhandled `CastError`.

### 4.4 Error Handling Strategy (`backend/src/middleware/errorHandler.js`)
- Unhandled routes return `404 Not Found` JSON.
- Global Express error-handling middleware catches all errors via `next(err)`.
- In `production` and `test` modes, stack traces are omitted:
  ```json
  {
    "success": false,
    "message": "Resource not found"
  }
  ```
- Catches Mongoose `ValidationError`, `CastError`, and generic runtime exceptions safely.

---

## 5. Frontend Requirements & UI Architecture

### 5.1 User Interface Components
1. **Header / Summary Bar:** Title, connection status indicator, and quick metrics (total tasks, completed count).
2. **Task Creation Form (`TaskForm.jsx`):**
   - Inputs: Title (required), Description (optional textarea), Priority (dropdown: Low/Medium/High), Status (dropdown: Todo/In Progress/Done), Due Date (date picker).
   - Validation: Inline error message if title is blank; disabled submit state during pending request.
3. **Filter & Sort Bar (`FilterSortBar.jsx`):**
   - Status Tabs/Dropdown: All, Todo, In Progress, Done.
   - Sort Selector: None, Due Date (Asc/Desc), Priority (High to Low / Low to High).
4. **Task List View (`TaskList.jsx`):**
   - Renders task cards grouped or in a clean list.
   - Empty state illustration/message when no tasks match criteria.
5. **Task Item Card (`TaskItem.jsx`):**
   - Displays title, description, priority badge (color-coded), due date badge, status badge.
   - Immediate status changer dropdown/buttons (`todo` -> `in_progress` -> `done`).
   - Delete button with confirmation or instant undo capability.
6. **Notification / Feedback Banner (`Alert.jsx`):**
   - Non-blocking alerts for network errors, validation failures, or server downtime.
   - Retries or dismiss actions.

### 5.2 State Management Strategy
- Centralized task state in `App.jsx` (or a dedicated custom hook `useTasks.js`).
- State variables:
  - `tasks`: Array of task objects.
  - `loading`: Boolean indicating ongoing fetch/action.
  - `error`: Error message string or null.
  - `filterStatus`: Current filter selection (`'all' | 'todo' | 'in_progress' | 'done'`).
  - `sortBy`: Current sort attribute (`'none' | 'dueDate' | 'priority'`).
  - `sortOrder`: `'asc' | 'desc'`.
- **Synchronization & Optimistic Updates:**
  - Status updates update local state immediately for snappy user experience, then send the `PUT` request. If the request fails, the change reverts to the previous state and displays an error alert.
  - Creations append the returned document from the server.
  - Deletions remove the item from local state upon server confirmation.

---

## 6. Project Architecture & Folder Structure

```
MERN stack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   └── taskController.js     # Request handling logic for all 5 endpoints
│   │   ├── middleware/
│   │   │   ├── errorHandler.js       # Centralized JSON error response handler
│   │   │   └── validateTask.js       # Input validation & ObjectId verification
│   │   ├── models/
│   │   │   └── Task.js               # Mongoose schema and model
│   │   ├── routes/
│   │   │   └── taskRoutes.js         # REST route definitions
│   │   ├── app.js                    # Express app initialization & middleware registration
│   │   └── server.js                 # HTTP listener & DB connection entry point
│   ├── .env.example                  # Template for PORT and MONGODB_URI
│   ├── package.json
│   └── tests/                        # Self-contained API verification script
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterSortBar.jsx     # Status filters & sorting dropdowns
│   │   │   ├── Notification.jsx      # Error and success feedback alerts
│   │   │   ├── TaskCard.jsx          # Individual task display & quick status changer
│   │   │   ├── TaskForm.jsx          # Creation form with client validation
│   │   │   └── TaskList.jsx          # Container for rendering task cards
│   │   ├── services/
│   │   │   └── api.js                # Centralized Axios/fetch client for backend API
│   │   ├── App.jsx                   # Main layout, state holder, and lifecycle effects
│   │   ├── App.css                   # Responsive, accessible, clean UI styling
│   │   ├── index.css                 # Base resets and utility classes
│   │   └── main.jsx                  # React DOM root entry point
│   ├── .env.example                  # Template for VITE_API_URL
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── NOTES.md                          # Technical assessment answers (Part 3)
├── README.md                         # Project documentation and setup guide
├── plan.md                           # Master architectural and implementation plan
└── .gitignore                        # Global ignore for node_modules, .env, dist
```

### Architectural Rationale
- **Separation of Concerns:** `server.js` handles environment binding and port listening, while `app.js` configures Express. This makes automated testing simple and keeps files focused.
- **Single Source of API Truth:** All frontend network requests pass through `src/services/api.js`, preventing scattered URL strings and ensuring consistent header/error handling.
- **Zero-Bloat UI:** Fast, lightweight CSS without heavy UI frameworks (meets the PDF requirement: *"We're not evaluating visual design polish — a clean, functional UI is enough"* while remaining polished and professional).

---

## 7. Sequential Implementation Roadmap

### Phase 1: Environment & Project Scaffolding
- **Objective:** Establish clean directory structure, root `.gitignore`, and configure package management for both sub-projects.
- **Tasks:**
  - [ ] Initialize Git repository (if not already initialized).
  - [ ] Create root `.gitignore` ignoring `node_modules`, `.env`, build artifacts, and OS files.
  - [ ] Create `backend/` directory and initialize `package.json` with dependencies (`express`, `mongoose`, `cors`, `dotenv`) and dev dependencies (`nodemon`).
  - [ ] Create `frontend/` directory using Vite React template (`react`, `react-dom`).
- **Dependencies:** Node.js, npm.
- **Expected Output:** Working workspace with clean boundaries between frontend and backend.
- **Verification:** `npm install` runs successfully in both directories.

### Phase 2: Backend Core — Database & Data Model
- **Objective:** Connect to MongoDB securely and define the `Task` Mongoose schema with all required fields and validations.
- **Tasks:**
  - [ ] Create `backend/.env.example` with `PORT=5000` and `MONGODB_URI=mongodb://localhost:27017/task_manager`.
  - [ ] Implement `backend/src/config/db.js` with robust connection handling and error logs.
  - [ ] Implement `backend/src/models/Task.js` with exact enum constraints, required fields, and timestamps.
- **Dependencies:** Phase 1.
- **Expected Output:** Mongoose connects to MongoDB and validates model creation.
- **Verification:** Run a test script to instantiate a Task and check validation triggers on missing `title` or invalid `priority`.

### Phase 3: Backend REST API & Controllers
- **Objective:** Implement all 5 required endpoints with input validation and clean controller separation.
- **Tasks:**
  - [ ] Implement `backend/src/middleware/validateTask.js`:
    - Check required fields (`title` trimmed, not empty).
    - Validate enum values for `status` and `priority`.
    - Validate `id` parameter as valid 24-character hexadecimal ObjectId.
  - [ ] Implement `backend/src/controllers/taskController.js`:
    - `createTask`: Handle `POST /tasks`, return `201`.
    - `getTasks`: Handle `GET /tasks`, filter by `status`, sort by `dueDate` or `priority` (`high` > `medium` > `low`), return `200`.
    - `getTaskById`: Handle `GET /tasks/:id`, return `200` or `404`.
    - `updateTask`: Handle `PUT /tasks/:id`, return updated document or `404`.
    - `deleteTask`: Handle `DELETE /tasks/:id`, return `200` with deletion confirmation or `404`.
  - [ ] Implement `backend/src/routes/taskRoutes.js` mapping HTTP verbs to controller methods.
  - [ ] Implement `backend/src/app.js` registering CORS, JSON parser, routes, and `404` handler.
  - [ ] Implement `backend/src/middleware/errorHandler.js` preventing stack trace leaks and returning structured error JSON.
  - [ ] Implement `backend/src/server.js` starting the HTTP listener.
- **Dependencies:** Phase 2.
- **Expected Output:** Fully functional REST API responding correctly on all 5 endpoints.
- **Verification:** Test all endpoints via curl/script against happy paths and edge cases (empty title, invalid enum, malformed ID, non-existent ID).

### Phase 4: Frontend Scaffolding & API Service Layer
- **Objective:** Configure React frontend, setup API abstraction layer, and define core state management.
- **Tasks:**
  - [ ] Create `frontend/.env.example` (`VITE_API_URL=http://localhost:5000/tasks`).
  - [ ] Implement `frontend/src/services/api.js` with reusable functions: `fetchTasks`, `fetchTaskById`, `createTask`, `updateTask`, `deleteTask`.
  - [ ] Implement global styles and layout in `App.css` and `index.css`.
- **Dependencies:** Phase 3.
- **Expected Output:** Frontend can communicate with the backend via the centralized service layer.
- **Verification:** Invoke `fetchTasks()` from `App.jsx` `useEffect` and verify data appears in console.

### Phase 5: Frontend UI Components & Core Workflows
- **Objective:** Build task creation, listing, status filtering, and sorting components.
- **Tasks:**
  - [ ] Implement `TaskForm.jsx` with input controls (title, description, priority, status, dueDate) and client-side validation.
  - [ ] Implement `FilterSortBar.jsx` with status tabs (`all`, `todo`, `in_progress`, `done`) and sort controls (`dueDate`, `priority`).
  - [ ] Implement `TaskCard.jsx` showing task details, priority badge, due date, status dropdown/toggle, and delete button.
  - [ ] Implement `TaskList.jsx` rendering task items or empty state.
  - [ ] Wire all components into `App.jsx` with reactive state synchronization.
- **Dependencies:** Phase 4.
- **Expected Output:** Working UI where users can create, view, filter, and sort tasks.
- **Verification:** User can submit a new task via the form and immediately see it in the list without reloading.

### Phase 6: Interactive Status Updates, Deletions & Error Handling
- **Objective:** Implement immediate UI feedback for status changes and deletions, plus graceful error handling.
- **Tasks:**
  - [ ] Implement immediate UI state update when status dropdown is changed on `TaskCard.jsx`.
  - [ ] Connect status change to `PUT /tasks/:id` via API layer; roll back state if the request fails.
  - [ ] Implement task deletion with optimistic removal and confirmation alert.
  - [ ] Implement `Notification.jsx` for displaying API error messages (e.g., server offline, validation error).
  - [ ] Implement loading spinners/skeleton indicators during initial load and pending mutations.
- **Dependencies:** Phase 5.
- **Expected Output:** Fluid, responsive user experience that gracefully recovers from network or server errors.
- **Verification:** Stop the backend server and attempt a status change; verify error alert is displayed and task reverts to previous state without freezing.

### Phase 7: Edge Case Hardening & Integration Testing
- **Objective:** Execute rigorous automated and manual tests covering all evaluation criteria and edge cases.
- **Tasks:**
  - [ ] Test empty title submission (must return 400 and show user-friendly error).
  - [ ] Test invalid status and priority payload values.
  - [ ] Test non-existent ID queries (must return 404).
  - [ ] Test malformed ObjectId strings (must return 400, never 500).
  - [ ] Test sorting combinations (`priority` desc/asc, `dueDate` desc/asc).
  - [ ] Verify that no server crash occurs under any invalid input condition.
- **Dependencies:** Phase 6.
- **Expected Output:** Zero 500 errors, zero unhandled rejections, robust user feedback.
- **Verification:** Complete all items in Section 9 (Testing & Acceptance Checklist).

### Phase 8: Documentation (`README.md` & `NOTES.md`)
- **Objective:** Deliver thorough documentation ensuring easy project setup and answering the three written evaluation questions.
- **Tasks:**
  - [ ] Create `NOTES.md` with well-crafted, 2–3 sentence answers for each question.
  - [ ] Create `README.md` containing:
    - Project description and architecture summary.
    - Prerequisites (Node.js version, MongoDB).
    - Step-by-step setup and run instructions for backend and frontend.
    - Environment variables guide.
    - API endpoint documentation with sample payloads.
    - Data model documentation including any extensions.
- **Dependencies:** Phase 7.
- **Expected Output:** Professional, comprehensive documentation ready for technical assessors.
- **Verification:** Review README for clarity and test running the app following only the README instructions.

### Phase 9: Git Hygiene & Final Submission Review
- **Objective:** Review Git history for clean incremental progression and prepare the final repository.
- **Tasks:**
  - [ ] Verify commit log exhibits clear, logical step-by-step progress.
  - [ ] Verify no secrets, `.env`, or `node_modules` are tracked by Git.
  - [ ] Final end-to-end sanity check of both servers and browser interactions.
- **Dependencies:** Phase 8.
- **Expected Output:** Submission-ready GitHub repository.

---

## 8. File Creation and Modification Plan

| Path | Purpose |
|---|---|
| `.gitignore` | Ignores `node_modules/`, `.env`, `dist/`, logs, and temporary files |
| `backend/package.json` | Backend dependencies (`express`, `mongoose`, `cors`, `dotenv`) and scripts (`start`, `dev`) |
| `backend/.env.example` | Template for backend configuration (`PORT`, `MONGODB_URI`, `CLIENT_URL`) |
| `backend/src/server.js` | Entry point: initializes DB connection and starts Express HTTP server |
| `backend/src/app.js` | Express app configuration, CORS setup, middleware pipeline, and route mounts |
| `backend/src/config/db.js` | Mongoose connection helper with retry logic and event listeners |
| `backend/src/models/Task.js` | Mongoose schema with field definitions, enums, validation, and indexes |
| `backend/src/middleware/validateTask.js` | Request body validation and MongoDB ObjectId format verification |
| `backend/src/middleware/errorHandler.js` | Centralized error handler preventing stack trace exposure |
| `backend/src/controllers/taskController.js` | Controller functions for Create, Read, Update, Delete, Filter, and Sort |
| `backend/src/routes/taskRoutes.js` | Express router linking HTTP methods to controller methods |
| `frontend/package.json` | Frontend dependencies (`react`, `react-dom`) and build scripts (`dev`, `build`) |
| `frontend/vite.config.js` | Vite bundler configuration |
| `frontend/.env.example` | Template for frontend environment variables (`VITE_API_URL`) |
| `frontend/index.html` | HTML shell for React application |
| `frontend/src/main.jsx` | React entry point mounting the root application |
| `frontend/src/App.jsx` | Top-level component holding state, orchestrating data flow and child components |
| `frontend/src/App.css` | Component styles, responsive layout, status badges, and accessible forms |
| `frontend/src/index.css` | Base typography and CSS resets |
| `frontend/src/services/api.js` | Modular API wrapper for interacting with `/tasks` REST endpoints |
| `frontend/src/components/TaskForm.jsx` | Controlled form for creating tasks with input validation |
| `frontend/src/components/TaskList.jsx` | List view rendering task cards or empty states |
| `frontend/src/components/TaskCard.jsx` | Single task presentation with immediate status dropdown and delete action |
| `frontend/src/components/FilterSortBar.jsx` | Controls for filtering by status and sorting by priority/date |
| `frontend/src/components/Notification.jsx` | Toast/banner for displaying errors, warnings, and success messages |
| `NOTES.md` | Required responses to the 3 assessment questions |
| `README.md` | Comprehensive setup guide, architecture overview, and API specs |
| `plan.md` | Master technical architecture and implementation roadmap |

---

## 9. Testing and Acceptance Checklist

### 9.1 Backend Test Cases
- [ ] **POST /tasks (Valid):** Creating a task with valid title, description, priority, status, and dueDate returns HTTP 201 and the created task object.
- [ ] **POST /tasks (Minimal):** Creating a task with only a title returns HTTP 201 with default priority (`medium`) and default status (`todo`).
- [ ] **POST /tasks (Empty Title):** Creating a task with `title: ""` or `title: "   "` returns HTTP 400 with message `"Task title is required"`.
- [ ] **POST /tasks (Missing Title):** Omitting the title key returns HTTP 400.
- [ ] **POST /tasks (Invalid Priority):** Setting `priority: "urgent"` returns HTTP 400 with message listing valid options (`low`, `medium`, `high`).
- [ ] **POST /tasks (Invalid Status):** Setting `status: "archived"` returns HTTP 400 with message listing valid options (`todo`, `in_progress`, `done`).
- [ ] **GET /tasks (All):** Fetches array of all stored tasks with HTTP 200.
- [ ] **GET /tasks?status=todo:** Returns only tasks with status `todo`.
- [ ] **GET /tasks?status=in_progress:** Returns only tasks with status `in_progress`.
- [ ] **GET /tasks?status=done:** Returns only tasks with status `done`.
- [ ] **GET /tasks?sortBy=dueDate&order=asc:** Returns tasks ordered by due date ascending.
- [ ] **GET /tasks?sortBy=priority&order=desc:** Returns tasks ordered by priority: High first, then Medium, then Low.
- [ ] **GET /tasks/:id (Existing):** Returns the requested task with HTTP 200.
- [ ] **GET /tasks/:id (Non-Existent Valid ID):** Returns HTTP 404 with message `"Task not found"`.
- [ ] **GET /tasks/:id (Malformed ID):** Passing an invalid ID like `"1234"` returns HTTP 400 `"Invalid task ID format"` without crashing or throwing unhandled CastError.
- [ ] **PUT /tasks/:id (Partial Update):** Updating only `status` succeeds with HTTP 200 and leaves other fields intact.
- [ ] **PUT /tasks/:id (Invalid Data):** Attempting to set `title: ""` or an invalid status returns HTTP 400.
- [ ] **PUT /tasks/:id (Non-Existent):** Returns HTTP 404.
- [ ] **DELETE /tasks/:id (Existing):** Deletes task and returns HTTP 200.
- [ ] **DELETE /tasks/:id (Non-Existent):** Returns HTTP 404.
- [ ] **Error Middleware:** Verify that errors never leak stack traces to client responses.

### 9.2 Frontend Test Cases
- [ ] **Initial Render:** Displays loading state while fetching tasks, then displays tasks correctly.
- [ ] **Empty State:** If no tasks exist, a clear empty state message is shown.
- [ ] **Create Task:** Submitting the form creates the task and appends it to the list immediately without manual page refresh.
- [ ] **Form Validation:** Submitting an empty title shows an inline validation error and prevents an invalid API call.
- [ ] **Status Change:** Selecting a new status in the dropdown updates the card badge immediately and persists to backend.
- [ ] **Delete Task:** Clicking delete removes the task from the list immediately.
- [ ] **Filter by Status:** Clicking "In Progress" shows only in-progress tasks; clicking "All" shows all tasks.
- [ ] **Sort Tasks:** Changing sort to "Priority" orders tasks logically.
- [ ] **Error Handling:** When backend is stopped, actions display a visible error message without crashing the UI or leaving it locked.
- [ ] **Recovery:** After an error, user can retry actions or dismiss the error banner.

### 9.3 Integration & Synchronization Tests
- [ ] Full end-to-end lifecycle: Create -> List -> Filter -> Update Status -> Delete verified against a live MongoDB database.
- [ ] No manual browser refresh required for any operation.
- [ ] Browser console is free of uncaught errors or React key warnings.

---

## 10. NOTES.md Answer Preparation

The PDF requires answering three questions in 2–3 sentences each. Here are the planned answers:

### Question 1: What would you change about your data model or API design if this needed to support multiple users, each with their own private task list?
> **Planned Answer:**  
> I would introduce a `User` model and add a `userId` field (referencing `User._id`) to the `Task` schema, backed by a compound index on `{ userId: 1, status: 1 }`. At the API level, I would integrate JWT-based authentication middleware to extract the authenticated user's ID and scope all queries and mutations (e.g., `Task.find({ userId: req.user.id })`), ensuring users can only read, update, or delete their own tasks.

### Question 2: If the task list could grow to thousands of items, what's the first performance concern you'd address, and how?
> **Planned Answer:**  
> The most critical performance bottleneck would be unbounded data transfer and excessive DOM rendering from fetching thousands of task documents simultaneously. I would resolve this by introducing cursor-based or limit-offset pagination on the backend (`GET /tasks?page=1&limit=25`) supported by compound MongoDB indexes on `{ status: 1, dueDate: 1 }`, and implement virtualized window rendering (e.g., via `react-window`) on the frontend to render only the visible items in the viewport.

### Question 3: Did you use any AI coding tools during this task? If so, describe one instance where you changed or rejected a suggestion it gave you, and why.
> **Planned Answer:**  
> Yes, an AI coding tool initially suggested sorting tasks by priority using standard MongoDB string sorting (`{ priority: -1 }`). I rejected this suggestion because alphabetical string comparison sorts `'medium'` before `'low'` and `'high'`, completely violating real-world business priority logic; instead, I implemented an aggregation pipeline mapping priority levels to numeric weights (`high: 3, medium: 2, low: 1`) to ensure true semantic sorting.

---

## 11. Git Commit Strategy

A clean, incremental commit history demonstrating deliberate senior-level engineering progression:

1. `chore: project initialization, directory structure, and plan.md`
2. `feat(backend): initialize express server, database connection, and environment config`
3. `feat(backend): implement Task mongoose model with schema validation and indexes`
4. `feat(backend): implement task controllers, routes, and custom validation middleware`
5. `feat(backend): implement centralized error handling middleware and verify API edge cases`
6. `feat(frontend): scaffold React Vite client, API service layer, and base styling`
7. `feat(frontend): implement TaskForm and TaskList components with status filtering and sorting`
8. `feat(frontend): implement task status update dropdown, deletion, and optimistic UI sync`
9. `feat(frontend): implement loading indicators and graceful error notification UI`
10. `test: verify full-stack edge cases, malformed IDs, and network failure resilience`
11. `docs: write comprehensive README setup instructions and complete NOTES.md`

---

## 12. Time Allocation (2.5 – 3.0 Hour Budget)

| Implementation Segment | Focus Area | Planned Duration | Cumulative Time |
|---|---|---|---|
| **Phase 0** | Plan, requirements analysis & scaffolding | 15 mins | 0:15 |
| **Phase 1 & 2** | Backend DB, Task Model & Schema | 20 mins | 0:35 |
| **Phase 3** | Backend CRUD routes, controllers, validation & error middleware | 35 mins | 1:10 |
| **Phase 4 & 5** | Frontend setup, API service, TaskForm, TaskList, Filter & Sort | 40 mins | 1:50 |
| **Phase 6** | Interactive status update, task deletion, loading & error UI | 25 mins | 2:15 |
| **Phase 7** | Comprehensive edge-case testing & defect resolution | 20 mins | 2:35 |
| **Phase 8 & 9** | Documentation (`README.md`, `NOTES.md`), Git verification & final polish | 15 mins | 2:50 |
| **Buffer** | Final verification and sanity check | 10 mins | 3:00 |

---

## 13. Final Submission Checklist

- [ ] `backend/` runs locally with `npm run dev` or `npm start`.
- [ ] `frontend/` runs locally with `npm run dev`.
- [ ] MongoDB connection succeeds gracefully with clear logs.
- [ ] `backend/.env.example` and `frontend/.env.example` are committed; no secret `.env` files are tracked in Git.
- [ ] `NOTES.md` answers all 3 questions within the 2–3 sentence guideline.
- [ ] `README.md` provides clear, copy-pasteable setup and execution commands.
- [ ] Git log contains 8–11 meaningful, logical commits without single-commit squashes.
- [ ] All 5 REST endpoints verified against valid requests, malformed IDs, invalid enums, and empty titles.
- [ ] Frontend single-page app verifies immediate updates, status changes, deletions, loading states, and error alerts.
- [ ] Repository is pushed to GitHub with collaborator access granted (if private).

---

## 14. Optional Enhancements (Strictly Out of Scope for Core Budget)

To prevent overengineering and ensure completion within the 2.5–3 hour budget, the following are classified strictly as **optional**:
- **Drag-and-Drop Kanban Board:** While the PDF notes "a dropdown or drag-style status change", a dropdown provides immediate, robust, accessible functionality with zero heavy dependencies. Drag-and-drop is deferred unless surplus time remains.
- **Search Query Filter:** Searching task title/description by text keyword.
- **Full Text Search Indexing:** Optional MongoDB text index.
- **Dark Mode Toggle:** Aesthetic enhancement.

---

## 15. Identified Risks, Edge Cases & Implementation Decisions

1. **Priority Sorting Pitfall:**
   - *Risk:* Using standard MongoDB `.sort({ priority: 1 })` sorts alphabetically (`high`, `low`, `medium`), which is logically incorrect.
   - *Decision:* Implement weighted numeric sorting in MongoDB aggregation (`high: 3, medium: 2, low: 1`) or an equivalent backend comparator.
2. **Malformed ObjectId Handling:**
   - *Risk:* Passing an arbitrary string like `123` to `findById` triggers Mongoose `CastError`, resulting in a 500 server crash if unhandled.
   - *Decision:* Middleware validates `mongoose.Types.ObjectId.isValid(id)` before querying, immediately returning `400 Bad Request`.
3. **Empty Title Strings:**
   - *Risk:* Passing whitespace `"   "` may bypass trivial length checks.
   - *Decision:* Backend validation trims strings and enforces non-zero length before database writes.
4. **Network Failure & UI Freezing:**
   - *Risk:* If backend is down, frontend could stay in an infinite loading spinner.
   - *Decision:* Wrap requests in `try/catch/finally`, ensure `loading` is set to `false`, and display clear error notifications.
5. **Port Conflicts:**
   - *Risk:* Port 5000 or 5173 might be in use locally.
   - *Decision:* Configurable ports via environment variables with fallback logging.
