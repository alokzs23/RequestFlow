# RequestFlow

RequestFlow is an internal request management tool — think a lightweight version of Jira or a company helpdesk — where employees submit requests (IT, leave, purchases, access) and managers move them through a defined approval workflow. Every action is captured in an audit-trail-style activity timeline, and a dashboard surfaces request volume and status breakdowns using MongoDB's aggregation pipeline.

Built to demonstrate practical full-stack patterns: JWT-based role authentication, a server-enforced state machine (not just UI-level status toggles), embedded activity logs, and MongoDB text search — all wired together in a clean MERN stack.

## Features

- **Auth** — JWT-based signup/login, roles: `employee` and `manager`
- **CRUD** — create, view, delete requests
- **Workflow/status system** — fixed state machine: `pending → in-progress → approved/rejected → closed`, enforced server-side (managers only can transition)
- **Activity timeline** — every creation, status change, and comment is logged with who/when
- **Dashboard analytics** — total counts, by-status bar chart, by-category pie chart, 14-day trend line chart (MongoDB aggregation pipeline)
- **Search/filter** — text search (title/description) + status/category filters

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (use MongoDB Atlas free tier, or local MongoDB)
- **Auth:** JWT + bcrypt

## Project Structure

```
RequestFlow/
├── backend/
│   ├── config/db.js
│   ├── models/User.js
│   ├── models/Request.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/requests.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/ (Navbar, StatusBadge, ProtectedRoute)
    │   ├── pages/ (Login, Signup, Dashboard, RequestList, NewRequest, RequestDetail)
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (from MongoDB Atlas) and JWT_SECRET (any long random string)
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. MongoDB Atlas (free, fastest option)

1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user + password
3. Under Network Access, allow access from anywhere (`0.0.0.0/0`) for local dev
4. Copy the connection string into `backend/.env` as `MONGO_URI`

## Using the App

1. Go to `/signup`, create one account as `manager` and one as `employee` (use two browsers or incognito)
2. Log in as the employee, submit a few requests via "New Request"
3. Log in as the manager — you'll see all requests, and can move them through the workflow (pending → in-progress → approved/rejected → closed) from the request detail page
4. Both roles can add comments, which show up on the activity timeline
5. Check the Dashboard for charts, and use the search/filter bar on the Requests page

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Create account | Public |
| POST | `/api/auth/login` | Log in | Public |
| GET | `/api/auth/me` | Current user | Token |
| GET | `/api/requests` | List (supports `?status=&category=&q=`) | Token |
| GET | `/api/requests/stats` | Dashboard analytics | Token |
| GET | `/api/requests/:id` | Single request + timeline | Token |
| POST | `/api/requests` | Create request | Token |
| PATCH | `/api/requests/:id/status` | Change status (workflow) | Manager |
| POST | `/api/requests/:id/comment` | Add timeline comment | Token |
| DELETE | `/api/requests/:id` | Delete request | Owner/Manager |

## Deployment (fast path)

- **Backend:** Railway or Render — set the same env vars as `.env`
- **Frontend:** Vercel — set `VITE_API_URL` to your deployed backend URL, and update backend's `CLIENT_URL` to your deployed frontend URL (for CORS)

## Interview Talking Points

- **Workflow system:** modeled as a fixed transition map (`ALLOWED_TRANSITIONS`) rather than a free-text status field — prevents invalid state changes server-side, not just in the UI.
- **Activity timeline:** implemented as an embedded subdocument array on the `Request` model rather than a separate collection — simpler queries, since you always fetch a request's full history in one call.
- **Dashboard analytics:** built with MongoDB's aggregation pipeline (`$group`, `$match`, `$dateToString`) instead of pulling all documents and computing in JS — scales better and is a common interview question in itself.
- **Search:** uses a MongoDB text index (`$text` operator) on title/description rather than regex scanning.
