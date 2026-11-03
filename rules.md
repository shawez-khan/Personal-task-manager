# rules.md — Project Rules (MERN Personal Task Manager)

> Is file ko build karte waqt har baar dhyan mein rakhna. Code likhne se pehle, commit karne se pehle, aur submit karne se pehle — ek baar scan kar lo.

---

## 0. Golden Rules

1. **Brief ko follow karo.** Har required endpoint, har UI requirement, NOTES.md, README.md, `.env.example` — sab hona chahiye.
2. **Backend pehle, frontend baad mein.** API Postman/curl se test karo, phir UI banao.
3. **Simple rakho.** Visual polish nahi chahiye; correctness + structure + data flow chahiye.
4. **Server kabhi crash na ho** — bad input = `400`, not found = `404`, baaki sab central error handler se.
5. **Koi bhi code jo samajh nahi aaya, commit mat karo** (especially AI-generated). Interview mein explain karna padega.
6. **Time-box:** 2.5–3 hours. Stretch goals sirf tab jab sab required cheezein ho chuki ho.

---

## 1. Code Structure Rules

- Backend layers: `routes → controllers → models`, plus `middleware`, `validators`, `utils`, `config`.
- **Routes** sirf URL ko controller se map karte hain — koi logic nahi.
- **Controllers** request handle karte hain: validated input lo, model call karo, response bhejo.
- **Models** sirf schema + DB-level rules.
- **Validation** alag middleware/validator mein — controller mein `if` ke jungle nahi.
- `app.js` (express setup) aur `server.js` (DB connect + listen) **alag** rakho.
- Ek file = ek responsibility. 200+ lines ho jaye toh split karo.
- Frontend: `api/` (HTTP calls), `hooks/` (state + logic), `components/` (UI). Component ke andar direct `fetch`/`axios` **nahi**.
- Koi dead code, commented-out blocks, ya `console.log` debugging commit mat karo.

## 2. Naming & Style Rules

- Files: backend `task.controller.js`, `task.routes.js`, model `Task.js`; React components `PascalCase.jsx`; hooks `useSomething.js`.
- Variables/functions: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Components: `PascalCase`.
- Enum values exactly as brief mein: `low | medium | high`, `todo | in_progress | done` (spelling/underscore match karo).
- API JSON keys: `camelCase` (`dueDate`, `createdAt`).
- Prettier + ESLint chalao; consistent formatting.
- Magic strings avoid karo — enums ko ek jagah constants mein define karo aur reuse karo (backend + frontend).

## 3. Backend Rules

- Har async controller `asyncHandler` se wrap ho (ya Express 5 ka native async support) — try/catch ka repetition nahi.
- Allowed fields **whitelist** karo (`title, description, priority, status, dueDate`). `_id`, `createdAt` update nahi hone chahiye.
- `PUT` partial update support kare; `runValidators: true` aur `new: true` use karo.
- Mongoose ObjectId validate karo (`mongoose.isValidObjectId`) → invalid ho toh `400`, missing ho toh `404`.
- `title` ko `trim()` karo; whitespace-only title reject karo.
- **Priority sorting alphabetical nahi hogi** — rank use karo: `high(3) > medium(2) > low(1)`.
- `dueDate` sort mein `null` wale tasks **last** mein aayein.
- Query params validate karo (`status`, `sortBy`, `order`) — invalid value pe `400`.
- Mongo indexes: `status`, `dueDate` (aur future ke liye compound).
- Environment values (`PORT`, `MONGO_URI`, `CLIENT_URL`) sirf `process.env` se — hardcode nahi.
- Server start hone se pehle DB connect ho; connection fail ho toh clear log + exit.

## 4. Validation & Error-Handling Rules

- **Standard success shape:** `{ "success": true, "data": ... }`
- **Standard error shape:** `{ "success": false, "error": { "message": "...", "details": [...] } }`
- Status codes:
  | Code | Kab |
  |---|---|
  | `200` | OK (GET/PUT/DELETE) |
  | `201` | Task created |
  | `400` | Validation error, invalid id, invalid query, bad JSON |
  | `404` | Task / route not found |
  | `500` | Unexpected server error (generic message) |
- **Kabhi bhi stack trace client ko mat bhejo.** Stack sirf server logs mein (aur sirf development mein).
- Custom `ApiError` class use karo (message + statusCode) — central `errorHandler` usse handle kare.
- Mongoose `ValidationError`, `CastError`, aur JSON parse errors ko handle karke `400` mein convert karo.
- Error messages **clear aur human-readable** hon: "Title is required", not "ValidationError: ...".
- `notFound` middleware sabse last se pehle, `errorHandler` sabse last mein.

## 5. Frontend Rules

- **Single source of truth:** tasks ka state `useTasks` hook mein. Components props se lein.
- Mutation ke baad UI **server response** se sync ho (ya optimistic update + rollback).
- Status change = **optimistic update**; API fail ho toh previous state restore karo + error dikhao.
- Har async action ke liye **loading state** (initial load + mutations) — buttons disable karo double-submit rokne ke liye.
- Har API call `try/catch/finally` mein — `finally` mein loading `false` zaroor ho, taaki UI kabhi stuck na rahe.
- Error user ko dikhao (dismissible banner/toast) — silent fail **nahi**.
- Create form: title empty ho toh client-side message dikhao (server validation phir bhi final authority hai).
- Delete se pehle `confirm`.
- Filter active ho aur task ka status badle → task filtered list se turant hat jaye (ya list refetch ho).
- Empty state dikhao ("No tasks yet").
- List items ko stable `key={task._id}` do (index nahi).
- `useEffect` dependencies sahi rakho; unnecessary re-fetch loops nahi.
- API base URL env se: `VITE_API_URL`.

## 6. API Design Rules

- Base path `/api` (e.g., `/api/tasks`) — consistently.
- RESTful: nouns in URL, verbs via HTTP method.
- Idempotent behaviour: `PUT`/`DELETE` repeat karne pe predictable response (second DELETE → `404`).
- CORS sirf frontend origin ke liye allow karo (`CLIENT_URL`).
- JSON body size limit lagao (e.g., `express.json({ limit: "10kb" })`).
- `helmet` use karo.

## 7. Security & Secrets Rules

- `.env` **kabhi commit nahi** — `.gitignore` mein ho.
- `.env.example` commit karo (placeholder values ke saath, real URI/password nahi).
- MongoDB Atlas ka real connection string README/NOTES/code mein paste mat karo.
- User input pe trust nahi — validate + sanitize.
- Dependencies minimal rakho; unused packages hatao.

## 8. Git Rules

- **Incremental commits** — single squashed commit = ❌.
- Small, focused commits; har milestone ke baad commit.
- Commit message format (Conventional Commits):
  - `feat:` new feature · `fix:` bug fix · `docs:` documentation · `refactor:` · `chore:` · `test:`
  - Example: `feat(server): add task CRUD endpoints with validation`
- Suggested commit sequence:
  1. `chore: initialize project structure`
  2. `feat(server): setup express and mongodb connection`
  3. `feat(server): add Task model and validators`
  4. `feat(server): add task CRUD controllers and routes`
  5. `feat(server): add error handling middleware`
  6. `feat(server): add status filter and sorting`
  7. `feat(client): scaffold app and api module`
  8. `feat(client): add task list, filter and sort`
  9. `feat(client): add create form and delete`
  10. `feat(client): add status update with optimistic UI`
  11. `feat(client): add loading and error states`
  12. `docs: add README and NOTES`
- `node_modules`, `.env`, build folders, OS files — sab `.gitignore` mein.
- Private repo ho toh Codewise ko **collaborator** add karna mat bhoolna.

## 9. Documentation Rules

**README.md** mein hona chahiye:
- Project description + tech stack
- Prerequisites (Node version, MongoDB local/Atlas)
- Setup steps (clone → install → env → run) — **backend aur frontend dono**
- Environment variables ki table
- API endpoints summary (+ query params)
- Data model + **extensions** (e.g., `updatedAt`) clearly documented
- Folder structure (short)
- Assumptions / known limitations

**NOTES.md** — 3 sawaal, har ek **2–3 sentences**:
1. Multi-user support ke liye data model/API kaise badlega? *(User model, `owner` ref, auth/JWT, scoped queries, ownership check, compound index)*
2. Thousands of tasks → pehla performance concern? *(pagination + indexes + only needed fields; client-side virtualization)*
3. AI tools use kiye? Ek instance batao jahan suggestion **change/reject** kiya aur **kyun**. *(Honest raho — real example likho)*

## 10. AI Tool Usage Rules

- AI use kar sakte ho, par **har line samajh ke** commit karo.
- Ek real example **note karte jao** jahan AI ka suggestion tumne badla/reject kiya (NOTES.md Q3 ke liye). Examples jo genuinely ho sakte hain:
  - AI ne priority ko alphabetical sort kiya → tumne rank-based sort lagaya.
  - AI ne `res.status(500).json({ error: err.stack })` diya → tumne central handler + generic message rakha.
  - AI ne component mein direct `fetch` likha → tumne `api/` module + hook mein shift kiya.
- Jo example likho woh **sach** ho — made-up example mat likho.
- AI-generated code mein hardcoded secrets, unused deps, ya over-engineering check karo.

## 11. Edge-Case Checklist (test karne ke liye)

- [ ] Empty title → `400`
- [ ] Whitespace-only title → `400`
- [ ] Title bahut lamba (>100) → `400`
- [ ] Invalid `status` / `priority` → `400`
- [ ] Invalid `dueDate` ("hello") → `400`
- [ ] `GET /tasks/abc` (bad id) → `400`
- [ ] `GET /tasks/<valid-but-nonexistent>` → `404`
- [ ] `PUT` empty body → `400`
- [ ] `PUT` partial (`{ "status": "done" }`) → sirf status badle
- [ ] `DELETE` twice → pehli `200/204`, doosri `404`
- [ ] Malformed JSON body → `400`
- [ ] Unknown route → `404`
- [ ] `?status=wrong` → `400`
- [ ] `?sortBy=priority&order=desc` → high → medium → low
- [ ] `?sortBy=dueDate` → no-due-date tasks last
- [ ] UI: server band karke action karo → error dikhe, UI stuck na ho
- [ ] UI: status change fail ho → rollback ho
- [ ] UI: refresh ke bina create/update/delete reflect ho

## 12. Don'ts (Common Galtiyan)

- ❌ Saara code ek `index.js` mein
- ❌ `err.stack` ya raw Mongoose error client ko bhejna
- ❌ Priority ko string sort karna
- ❌ `.env` ya real DB URI commit karna
- ❌ Ek hi giant squashed commit
- ❌ Component ke andar direct API calls + scattered state
- ❌ `finally` ke bina loading flag (UI stuck ho jata hai)
- ❌ README mein setup steps chhod dena
- ❌ NOTES.md mein generic/copy-paste answers
- ❌ Brief mein nahi maange features (auth, Redux, etc.) mein time waste karna

## 13. Final Pre-Submission Checklist

- [ ] Fresh clone karke README ke steps se backend + frontend dono chal rahe hain
- [ ] Saare 5 endpoints test ho chuke hain
- [ ] Filter + sort kaam kar rahe hain
- [ ] Edge cases (Section 11) pass hain
- [ ] `.env.example` hai, `.env` commit **nahi** hui
- [ ] README.md complete (setup, env, API, extensions)
- [ ] NOTES.md mein 3 jawab (har ek 2–3 sentences)
- [ ] Git history incremental hai (multiple meaningful commits)
- [ ] `console.log` / dead code / unused packages hata diye
- [ ] Repo link share karne se pehle private/public access check kiya (collaborator added)
- [ ] Brief dobara padha — kuch miss toh nahi hua?
