# Technical Write-Up: Personal Task Manager

### 1. What would you change about your data model or API design if this needed to support multiple users, each with their own private task list?

I would introduce a `User` collection and add an indexed `userId` reference to the `Task` schema, backed by a compound index on `{ userId: 1, status: 1 }`. At the API level, I would implement JWT authentication middleware that attaches the verified user's ID to `req.user` and strictly scopes all database operations (e.g., `Task.find({ userId: req.user.id })`). Additionally, all route handlers for `:id` would enforce ownership checks before applying updates or deletions to guarantee multi-tenant data isolation.

### 2. If the task list could grow to thousands of items, what's the first performance concern you'd address, and how?

The primary performance concern would be unbounded data transfer and browser DOM bloat caused by fetching and rendering thousands of documents simultaneously. I would resolve this on the backend by implementing cursor-based or limit-offset pagination (`GET /api/tasks?page=1&limit=25`) supported by compound indexes on `{ status: 1, dueDate: 1 }`. On the frontend, I would incorporate a virtualized list container (such as `react-window`) to render only the items visible in the active viewport, preventing memory and re-render bottlenecks.

### 3. Did you use any AI coding tools during this task? If so, describe one instance where you changed or rejected a suggestion it gave you, and why.

When implementing task sorting, an AI tool suggested sorting directly on the string `priority` field using `{ priority: -1 }`. I rejected this approach because standard string comparison sorts alphabetically (`"high" < "low" < "medium"`), which violates the actual business logic of task urgency. Instead, I designed a dedicated numeric rank mapping (`high: 3, medium: 2, low: 1`) in the schema and aggregation pipeline to guarantee genuine semantic priority sorting.
