# RequestFlow

![MERN](https://img.shields.io/badge/stack-MERN-3b6dff)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

RequestFlow is an internal request management tool — think a lightweight version of Jira or a company helpdesk — where employees submit requests (IT, leave, purchases, access) and managers move them through a defined approval workflow. Every action is captured in an audit-trail-style activity timeline, and a dashboard surfaces request volume and status breakdowns using MongoDB's aggregation pipeline.

Built to demonstrate practical full-stack patterns: JWT-based role authentication, a server-enforced state machine (not just UI-level status toggles), embedded activity logs, and MongoDB text search — all wired together in a clean MERN stack.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Workflow Diagram](#workflow-diagram)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Using the App](#using-the-app)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap / Stretch Ideas](#roadmap--stretch-ideas)
- [Interview Talking Points](#interview-talking-points)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| **Auth** | JWT-based signup/login with two roles: `employee` and `manager`. Passwords hashed with bcrypt. |
| **CRUD** | Create, view, and delete requests. Employees only see their own; managers see everything. |
| **Workflow/status system** | Fixed state machine (`pending → in-progress → approved/rejected → closed`), transitions enforced **server-side**, restricted to managers. |
| **Activity timeline** | Every creation, status change, and comment is logged with who did it and when — an audit trail, not just a status label. |
| **Dashboard analytics** | Total request count, by-status bar chart, by-category pie chart, and a 14-day trend line chart, all computed via MongoDB's aggregation pipeline. |
| **Search/filter** | Full-text search across title/description (MongoDB text index) plus status and category filters. |

## Tech Stack

**Frontend**
- React 18 (Vite)
- React Router v6
- Tailwind CSS
- Recharts (dashboard charts)
- Axios (API client with auth interceptor)

**Backend**
- Node.js + Express
- Mongoose (MongoDB ODM)
- JWT (`jsonwebtoken`) + bcrypt for auth

**Database**
- MongoDB (MongoDB Atlas free tier, or local MongoDB)

## Workflow Diagram

```
                ┌─────────────┐
   created ───▶ │   pending   │
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌─────────────┐ ┌──────────┐ ┌──────────┐
   │ in-progress │ │ approved │ │ rejected │
   └──────┬──────┘ └────┬─────┘ └────┬─────┘
          │             │            │
          ├────▶ approved            │
          ├────▶ rejected            │
          │             ▼            ▼
          │         ┌─────────────────┐
          └────────▶│     closed      │
                     └─────────────────┘
```

Transitions are validated against `ALLOWED_TRANSITIONS` in `backend/models/Request.js` — an invalid transition (e.g. `closed → pending`) is rejected by the API with a 400, regardless of what the frontend sends.

## Project Structure

```
RequestFlow/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   ├── User.js               # user schema, password hashing
│   │   └── Request.js            # request schema, workflow rules, activity log
│   ├── middleware/
│   │   └── auth.js               # JWT verification, role gating
│   ├── routes/
│   │   ├── auth.js               # signup / login / me
│   │   └── requests.js           # CRUD, stats, status transitions, comments
│   ├── server.js                 # Express app entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js          # axios instance + token interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx     # charts + stats
    │   │   ├── RequestList.jsx   # search/filter table
    │   │   ├── NewRequest.jsx    # submission form
    │   │   └── RequestDetail.jsx # workflow buttons + timeline + comments
    │   ├── App.jsx                # route definitions
    │   └── main.jsx                # React root, providers
    └── .env.example
```

## Setup

### Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (Atlas free tier is easiest — see below)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET
npm run dev
```
Runs on `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Runs on `http://localhost:5173`.

### 3. MongoDB Atlas (free, fastest option)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user (username + password)
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for local dev
4. Copy the connection string into `backend/.env` as `MONGO_URI`, replacing `<user>`/`<password>` with your credentials

## Using the App

1. Go to `/signup` and create **two accounts** — one with role `manager`, one with role `employee` (use separate browser profiles or incognito to stay logged in as both).
2. As the **employee**: click **New Request**, fill in a title, category, and description, submit.
3. As the **manager**: open the request from the Requests list — you'll see buttons for the allowed next statuses (e.g. move `pending` → `in-progress`). Only valid transitions are shown.
4. Either role can add a comment on a request — it appears in the activity timeline immediately.
5. Visit the **Dashboard** to see totals and charts update live as you create/move requests.
6. Use the search box and status/category dropdowns on the **Requests** page to filter.

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Create account | Public |
| POST | `/api/auth/login` | Log in | Public |
| GET | `/api/auth/me` | Current user | Token |
| GET | `/api/requests` | List requests (`?status=&category=&q=`) | Token |
| GET | `/api/requests/stats` | Dashboard analytics | Token |
| GET | `/api/requests/:id` | Single request + full timeline | Token |
| POST | `/api/requests` | Create a request | Token |
| PATCH | `/api/requests/:id/status` | Transition status (workflow) | Manager only |
| POST | `/api/requests/:id/comment` | Add a timeline comment | Token |
| DELETE | `/api/requests/:id` | Delete a request | Owner or Manager |

All authenticated routes expect `Authorization: Bearer <token>`.

## Data Models

**User**
```js
{ name, email, password (hashed), role: 'employee' | 'manager', createdAt, updatedAt }
```

**Request**
```js
{
  title, description, category,
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'closed',
  createdBy, assignedTo,
  activityLog: [{ action, by, note, fromStatus, toStatus, createdAt }],
  createdAt, updatedAt
}
```

The activity log is stored as an **embedded subdocument array** rather than a separate collection — a single query returns a request and its full history together, since that's the only access pattern this app needs.

## Deployment

**Backend** (Railway or Render):
- Set env vars: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL` (your deployed frontend URL, for CORS)

**Frontend** (Vercel):
- Set env var: `VITE_API_URL` → your deployed backend URL + `/api`

After deploying both, update `CLIENT_URL` on the backend to match your live frontend URL, or CORS will block requests.

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| `MongoServerError: bad auth` | Wrong username/password in `MONGO_URI`, or the user wasn't created in Atlas → Database Access |
| Backend can't connect, hangs | Atlas Network Access doesn't allow your IP — add `0.0.0.0/0` for dev |
| CORS error in browser console | `CLIENT_URL` in backend `.env` doesn't match your frontend's actual URL |
| 401 on every request after login | Token not attached — check `localStorage.getItem('token')` isn't null, and `.env`'s `VITE_API_URL` is correct |
| Charts show no data | You haven't created any requests yet, or you're logged in as a fresh employee with none of their own |

## Roadmap / Stretch Ideas

- [ ] Assign requests to specific managers (`assignedTo` field already exists in the schema)
- [ ] Email notifications on status change
- [ ] Pagination on the requests list for large datasets
- [ ] File attachments on requests
- [ ] Configurable workflows (per-category status flows) instead of one fixed flow
- [ ] Role-based dashboard views (manager sees team-wide stats, employee sees only their own — partially implemented already)

## Interview Talking Points

- **Workflow system** — modeled as a fixed transition map (`ALLOWED_TRANSITIONS`) rather than a free-text status field, so invalid state changes are rejected server-side, not just hidden in the UI.
- **Activity timeline** — implemented as an embedded subdocument array on the `Request` model rather than a separate collection, since the only access pattern is "fetch a request with its full history" — no need for a join.
- **Dashboard analytics** — built with MongoDB's aggregation pipeline (`$group`, `$match`, `$dateToString`) instead of pulling every document into JS and computing there — scales as data grows, and it's a pipeline pattern interviewers often ask about directly.
- **Search** — uses a MongoDB text index (`$text` operator) rather than a regex scan across every document.
- **Auth** — role checks happen in middleware (`requireManager`) at the route level, not scattered through business logic.

## License

MIT — free to use, modify, and learn from.
