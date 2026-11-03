# PRD — Personal Task Manager (MERN Stack)

| Field | Details |
|---|---|
| **Project** | Personal Task Manager |
| **Type** | Full-stack practical assessment (Codewise Infotech) |
| **Stack** | MongoDB, Express, React, Node.js |
| **Time budget** | 2.5 – 3 hours |
| **Status** | Draft v1.0 |
| **Submission** | GitHub repo link (public, or private with Codewise added as collaborator) |

---

## 1. Overview

A simple single-user web application where a person can **create, organize, and track personal tasks**. The app has a REST API (Node.js + Express + MongoDB) and a single-page React frontend that stays in sync with the server without manual refresh.

The goal of this project is **not** visual polish. The goal is to demonstrate correct data flow, clean code structure, sensible validation/error handling, and clear communication (README + NOTES).

## 2. Problem Statement

People lose track of what they need to do, what is in progress, and what is urgent. They need a lightweight tool to:

- capture tasks quickly,
- tag them with priority and due date,
- move them through a simple workflow (`todo → in_progress → done`),
- filter and sort to focus on what matters now.

## 3. Goals & Non-Goals

### Goals
- Complete CRUD for tasks via a REST API.
- Server-side filtering (by status) and sorting (by dueDate / priority).
- Robust validation: bad input returns `400` with a clear message, never a crash.
- Central error-handling middleware; no raw stack traces sent to the client.
- React UI to list, create, update status, and delete tasks with loading + error states.
- UI reflects changes immediately and stays consistent with the server.
- Clean separation of concerns (routes / controllers / models / middleware).
- Clear README, NOTES.md, `.env.example`, and incremental git history.

### Non-Goals (out of scope for this task)
- User authentication / multi-user support (only discussed in NOTES.md).
- Drag-and-drop Kanban (optional stretch only).
- Pagination (discussed in NOTES.md; optional stretch).
- Visual design polish, animations, theming.
- Deployment / CI-CD (optional stretch).
- Notifications, reminders, recurring tasks, sub-tasks, tags.

## 4. Target User

**Persona — "Solo planner"**: an individual who wants a simple private to-do list with priorities and due dates. Single browser, single user, no login.

## 5. User Stories

| ID | As a user, I want to… | So that… |
|---|---|---|
| US-1 | create a task with title, description, priority, status, due date | I can capture what I need to do |
| US-2 | see all my tasks | I know what is on my plate |
| US-3 | filter tasks by status | I can focus on todo / in-progress / done |
| US-4 | sort tasks by due date or priority | I can see what is urgent first |
| US-5 | change a task's status quickly | I can track progress, and see it update instantly |
| US-6 | edit any field of a task | I can fix mistakes or change plans |
| US-7 | delete a task | I can remove things I no longer need |
| US-8 | see a loading indicator and clear error messages | the app never feels stuck or broken silently |

## 6. Functional Requirements

### 6.1 Data Model — `Task`

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | String | **Yes** | trimmed, 1–100 chars, whitespace-only rejected |
| `description` | String | No | trimmed, max 500 chars, default `""` |
| `priority` | Enum | No | `low` \| `medium` \| `high`, default `medium` |
| `status` | Enum | No | `todo` \| `in_progress` \| `done`, default `todo` |
| `dueDate` | Date | No | valid ISO-8601 date, or `null` |
| `createdAt` | Timestamp | Auto | set by Mongoose `timestamps: true` |
| `updatedAt` | Timestamp | Auto | *(extension)* set by Mongoose — documented in README |

> **Extensions to document in README:** `updatedAt` (from `timestamps: true`). Add any others here if introduced.

### 6.2 REST API

**Base URL:** `http://localhost:5000/api` *(configurable via env)*

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| `POST` | `/tasks` | Create a new task | `201` | `400` |
| `GET` | `/tasks` | List tasks (filter + sort) | `200` | `400` |
| `GET` | `/tasks/:id` | Get a single task | `200` | `400`, `404` |
| `PUT` | `/tasks/:id` | Update a task (any field, partial allowed) | `200` | `400`, `404` |
| `DELETE` | `/tasks/:id` | Delete a task | `200` (or `204`) | `400`, `404` |

#### `GET /tasks` query parameters

| Param | Values | Default | Notes |
|---|---|---|---|
| `status` | `todo` \| `in_progress` \| `done` | *(all)* | invalid value → `400` |
| `sortBy` | `dueDate` \| `priority` \| `createdAt` | `createdAt` | invalid value → `400` |
| `order` | `asc` \| `desc` | `desc` for `createdAt`, `asc` otherwise | invalid value → `400` |

**Sorting notes (important):**
- `priority` is a string enum, so alphabetical sort is **wrong** (`high < low < medium`). Sort by rank: `high=3, medium=2, low=1` (e.g., Mongo aggregation with `$addFields` + `$switch`, or a stored numeric `priorityRank`).
- For `dueDate` sorting, tasks **without** a due date should always appear **last**, regardless of asc/desc.

#### Example — Create task

**Request** `POST /api/tasks`
```json
{
  "title": "Finish MERN assignment",
  "description": "Backend + frontend + notes",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-11-10"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "6650f1c2a1b2c3d4e5f60789",
    "title": "Finish MERN assignment",
    "description": "Backend + frontend + notes",
    "priority": "high",
    "status": "todo",
    "dueDate": "2026-11-10T00:00:00.000Z",
    "createdAt": "2026-11-03T10:00:00.000Z",
    "updatedAt": "2026-11-03T10:00:00.000Z"
  }
}
```

#### Standard error response (all errors use this shape)

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

### 6.3 Validation Rules

| Case | Expected behavior |
|---|---|
| Missing / empty / whitespace-only `title` | `400` — "Title is required" |
| `title` > 100 chars | `400` |
| `priority` not in enum | `400` — lists allowed values |
| `status` not in enum | `400` — lists allowed values |
| `dueDate` not a valid date | `400` |
| Malformed ObjectId in `:id` | `400` — "Invalid task id" |
| Valid ObjectId but task doesn't exist | `404` — "Task not found" |
| `PUT` with empty body | `400` — "No fields to update" |
| `PUT` trying to change `_id` / `createdAt` | Ignored (whitelist allowed fields) |
| Unknown route | `404` — "Route not found" |
| Malformed JSON body | `400` — "Invalid JSON" |
| Unexpected server error | `500` — generic message, **no stack trace** (log server-side only) |

### 6.4 Frontend (React SPA)

| # | Requirement |
|---|---|
| F-1 | Display all tasks, **filterable by status** (All / Todo / In Progress / Done) |
| F-2 | **Create form**: title (required), description, priority, status, due date; inline validation message for empty title |
| F-3 | **Update status** per task via dropdown; UI updates **immediately** (optimistic update with rollback on failure) |
| F-4 | **Delete** a task (with confirm); removed from UI after success |
| F-5 | **Sort controls**: by due date / priority, asc/desc |
| F-6 | **Loading state** on initial fetch and during mutations (disable buttons / spinner) |
| F-7 | **Error handling**: failed requests show a dismissible error message; UI never stays stuck on "loading" |
| F-8 | **Empty state**: friendly message when there are no tasks |
| F-9 | UI stays in sync with server after every action — **no manual refresh needed** |

**Edge case:** if a status filter is active (e.g., "Todo") and the user changes a task to "Done", that task should leave the filtered list immediately.

**State management approach:** React hooks (`useState` / `useReducer`) with a custom `useTasks` hook that owns fetching, mutations, loading, and error state. API calls live in a separate `api/` module — components never call `fetch`/`axios` directly.

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Reliability** | No unhandled promise rejections; no server crash on bad input |
| **Security** | No secrets committed; `.env.example` provided; CORS restricted to frontend origin; `helmet` enabled; request body size limited |
| **Maintainability** | Layered structure; small focused files; consistent naming |
| **Performance** | Index on `status` and `dueDate`; lean queries; (scaling thoughts in NOTES.md) |
| **Usability** | Functional, clean UI; clear error + loading feedback |
| **Portability** | Runs locally with `npm install` + `npm run dev` in both apps |

## 8. Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js (LTS) |
| Backend framework | Express |
| Database | MongoDB (local or Atlas) + Mongoose |
| Validation | Zod (or express-validator / Joi) + Mongoose schema validation |
| Frontend | React (Vite) |
| HTTP client | `fetch` or Axios (single wrapper module) |
| Dev tooling | nodemon, ESLint, Prettier |

## 9. Proposed Project Structure

```
task-manager/
├── server/
│   ├── src/
│   │   ├── config/          # db.js, env.js
│   │   ├── models/          # Task.js
│   │   ├── controllers/     # task.controller.js
│   │   ├── routes/          # task.routes.js
│   │   ├── middleware/      # validate.js, errorHandler.js, notFound.js
│   │   ├── validators/      # task.schema.js
│   │   ├── utils/           # ApiError.js, asyncHandler.js
│   │   ├── app.js           # express app setup
│   │   └── server.js        # entry point (DB connect + listen)
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/             # tasksApi.js
│   │   ├── hooks/           # useTasks.js
│   │   ├── components/      # TaskForm, TaskList, TaskItem, FilterBar, ErrorBanner, Loader
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── PRD.md
├── rules.md
├── README.md
├── NOTES.md
└── .gitignore
```

## 10. Acceptance Criteria

**Backend**
- [ ] All 5 endpoints work as specified with correct status codes.
- [ ] `GET /tasks?status=done` returns only done tasks.
- [ ] `GET /tasks?sortBy=priority&order=desc` returns high → medium → low.
- [ ] `GET /tasks?sortBy=dueDate` puts tasks without due date last.
- [ ] Empty title, invalid status/priority, bad date → `400` with clear message.
- [ ] Invalid ObjectId → `400`; non-existent ID → `404`.
- [ ] Server never crashes on bad input; no stack traces in responses.

**Frontend**
- [ ] Tasks load on page open with a loading indicator.
- [ ] Creating a task adds it to the list without refresh.
- [ ] Changing status updates UI instantly; rolls back with an error if API fails.
- [ ] Deleting a task removes it from the list.
- [ ] Filter by status works; sort works.
- [ ] API down / failed request → visible error message, UI not stuck.

**Deliverables**
- [ ] README.md with setup + run instructions (backend + frontend), API summary, extensions documented.
- [ ] `.env.example` for server (and client if used).
- [ ] NOTES.md answering all 3 questions.
- [ ] Incremental git history (no single squashed commit).

## 11. Testing Plan (Manual + Optional Automated)

**Manual API checks** (Postman / Thunder Client / curl):

| # | Test | Expected |
|---|---|---|
| 1 | POST valid task | 201 |
| 2 | POST with empty title | 400 |
| 3 | POST with `status: "finished"` | 400 |
| 4 | GET all | 200 + array |
| 5 | GET `?status=in_progress` | only in-progress tasks |
| 6 | GET `?sortBy=priority&order=desc` | high first |
| 7 | GET `/tasks/abc` | 400 |
| 8 | GET `/tasks/<valid-but-missing-id>` | 404 |
| 9 | PUT partial update (`{status:"done"}`) | 200, only status changed |
| 10 | PUT empty body | 400 |
| 11 | DELETE existing | 200/204 |
| 12 | DELETE same again | 404 |

**Manual UI checks:** create, change status, filter, sort, delete, stop the server and try an action (error shown), slow network (loader shown).

**Optional stretch:** Jest + Supertest for API (use `mongodb-memory-server`).

## 12. Milestones (2.5–3 hr plan)

| Time | Milestone | Suggested commit |
|---|---|---|
| 0:00 – 0:15 | Repo init, folder structure, `.gitignore`, `.env.example` | `chore: initialize project structure` |
| 0:15 – 0:30 | Express app, DB connection, health route | `feat(server): setup express and mongodb connection` |
| 0:30 – 1:15 | Task model, validators, controllers, routes, error middleware | `feat(server): add task CRUD with validation` |
| 1:15 – 1:30 | Filtering + sorting, API testing | `feat(server): add status filter and sorting` |
| 1:30 – 2:30 | React: API module, `useTasks`, list, form, status change, delete, loading/error | `feat(client): ...` (several commits) |
| 2:30 – 2:50 | README.md + NOTES.md | `docs: add README and NOTES` |
| 2:50 – 3:00 | Final test pass, cleanup | `chore: final cleanup` |

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Running out of time | Build backend first; keep UI minimal; skip stretch goals |
| Wrong priority sorting (alphabetical) | Use rank-based sort (see 6.2) |
| UI out of sync after mutation | Single source of truth in `useTasks`; update state from server response |
| Optimistic update leaves wrong state on failure | Keep previous state snapshot; rollback in `catch` |
| Secrets leak into git | `.gitignore` for `.env`; commit only `.env.example` |
| Single squashed commit | Commit after each milestone |

## 14. Future Scope (for NOTES.md discussion)

- **Multi-user:** add `User` model; `Task.owner` (ref to User, indexed); auth via JWT; scope every query by `owner`; ownership checks on `:id` routes; compound index `{ owner: 1, status: 1, dueDate: 1 }`.
- **Scale (thousands of tasks):** server-side pagination (cursor-based preferred), proper compound indexes matching filter + sort, return only needed fields, debounce / virtualize list on the client.
- Search, tags, subtasks, recurring tasks, drag-and-drop Kanban, deployment.

## 15. Evaluation Mapping (what reviewers look for)

| Reviewer criterion | How this PRD addresses it |
|---|---|
| Correctness & edge cases | Section 6.3 validation table + Section 11 tests |
| Code structure | Section 9 structure + `rules.md` |
| Frontend/backend integration | F-3, F-9, `useTasks` hook, optimistic update |
| Communication | README, NOTES, `.env.example`, clean commits |

## 16. Open Questions / Assumptions

- Past due dates are **allowed** (user may log overdue tasks). *(assumption)*
- Delete is a **hard delete** (no soft delete / undo). *(assumption)*
- Single user, no auth. *(per brief)*
- `DELETE` returns `200` with a success message (or `204` with no body) — pick one and keep it consistent. *(decide while coding)*
