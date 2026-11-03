# Social Events Platform (SEP) — Backend API

RESTful API backend for the **Social Events Platform (SEP)** built with **Node.js**, **Express.js**, and **MongoDB Atlas**.

---

## 🚀 Live API Deployment

- **Live Base URL:** [https://assignment-8-backend-sep.onrender.com/api](https://assignment-8-backend-sep.onrender.com/api) *(or `http://localhost:5000/api` locally)*
- **Health Check Endpoint:** `GET /api/health`

---

## 🛠️ Tech Stack & Architecture

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4
- **Database:** MongoDB Atlas (Mongoose 8)
- **Authentication:** JWT (JSON Web Tokens) with Bearer token header authorization
- **Security & Utilities:** `bcryptjs`, `cors`, `dotenv`

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user (password validation: min 6 chars, upper & lower) | Public |
| POST | `/api/auth/login` | Login with email and password | Public |
| POST | `/api/auth/google` | Social authentication (Google) | Public |
| POST | `/api/auth/github` | Social authentication (GitHub) | Public |
| GET | `/api/auth/me` | Retrieve current authenticated user profile | Private (Bearer JWT) |
| PUT | `/api/auth/profile` | Update user name and avatar photo URL | Private (Bearer JWT) |

### 📅 Events (`/api/events`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/events/recent` | Get 6 most upcoming events (sorted by date, limit 6) | Public |
| GET | `/api/events` | Filtered list of upcoming events (search, category, location) | Public |
| GET | `/api/events/:id` | Single event details with live participant count | Public |
| POST | `/api/events` | Create new event (Rule 5: future dates only) | Private (Bearer JWT) |
| PUT | `/api/events/:id` | Update event details (Organizer only & future dates) | Private (Bearer JWT) |
| DELETE | `/api/events/:id` | Delete event and cascade remove registrations (Organizer only) | Private (Bearer JWT) |
| POST | `/api/events/:id/join` | Join event as volunteer (duplicate prevention) | Private (Bearer JWT) |

### 👤 User Dashboard (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/users/events` | Get all events organized by the logged-in user | Private (Bearer JWT) |
| GET | `/api/users/joined-events` | Get all events joined by the user in chronological order | Private (Bearer JWT) |
| GET | `/api/users/joined-ids` | Get array of event IDs the user has joined | Private (Bearer JWT) |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

---

## 🏃 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Seed initial sample data (optional)
npm run seed

# 3. Start development server with nodemon
npm run dev
```

Server will run on `http://localhost:5000`.

