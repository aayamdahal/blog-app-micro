# 📰 Blog App Microservices Monorepo

## Overview

This repository hosts a **modern full-stack blogging platform** built with a **microservices-based architecture**.  
It includes three independent **TypeScript/Node.js backend services** and a **Next.js 15 frontend**, which together provide:

- ✨ Google OAuth authentication
- 🧠 AI-assisted blog authoring (Gemini integration)
- 💬 Commenting and saved-post features
- ⚡ High-performance cached content delivery

The services communicate via HTTP, share PostgreSQL and MongoDB data stores, and coordinate cache invalidation using **RabbitMQ** and **Redis**.

---

## 🗂 Repository Structure

```
.
├── client/           # Next.js 15 frontend for readers and authors
├── services/
│   ├── author/       # Blog authoring APIs + AI endpoints
│   ├── blog/         # Public blog APIs, caching, and social interactions
│   └── user/         # Google OAuth, user profiles, and JWT authentication
├── package.json      # Workspace dependency references
└── README.md         # This file
```

---

## 🧩 Architecture

### Frontend (Next.js 15 / React 19)

- Provides the web UI for both readers and authors.
- Handles Google OAuth and interacts with backend APIs.
- Authors can compose, edit, and publish blogs using AI grammar correction tools.
- Readers can browse, search, and save posts.

### Author Service

- Manages blog CRUD operations and AI endpoints.
- Uses **PostgreSQL (Neon)** for persistence.
- Publishes cache-invalidation messages to **RabbitMQ**.

### Blog Service

- Handles public blog delivery, comments, and saved-post toggles.
- Uses **Redis** for caching and consumes RabbitMQ messages for invalidation.

### User Service

- Manages Google OAuth login, JWT creation, and user profiles (stored in **MongoDB**).
- Other services validate tokens issued here for authentication.

### Data Flow Summary

1. User logs in → User service issues JWT → Frontend stores it in cookies.
2. Author service publishes cache invalidation messages after any data change.
3. Blog service listens via RabbitMQ, clears outdated Redis keys, and rebuilds cache.
4. Blog queries fetch author data from the user service and return enriched responses.
5. AI endpoints (Gemini) refine titles, descriptions, and HTML content.

---

## 🛠 Backend Services

### Author Service (`services/author`)

**Stack:** Express 5, PostgreSQL, Cloudinary, RabbitMQ, Google Gemini

**Endpoints:**

- `POST /api/v1/blog/new` — Create a new blog post with image upload
- `POST /api/v1/blog/:id` — Update an existing blog
- `DELETE /api/v1/blog/:id` — Delete a blog and related data
- `POST /api/v1/ai/*` — AI-powered title, description, and grammar cleanup

**Environment Variables**

```ini
PORT=4001
DB_URL=postgres://...
JWT_SEC=supersecret
Cloud_Name=...
Cloud_Api_Key=...
Cloud_Api_Secret=...
Rabbimq_Host=localhost
Rabbimq_Username=guest
Rabbimq_Password=guest
Gemini_Api_Key=...
```

---

### Blog Service (`services/blog`)

**Stack:** Express 5, PostgreSQL, Redis, RabbitMQ

**Endpoints:**

- `GET /api/v1/blog/all` — Cached, filterable blog listing
- `GET /api/v1/blog/:id` — Single blog (cached with author details)
- `POST /api/v1/comment/:id` — Add comment
- `DELETE /api/v1/comment/:commentid` — Delete comment
- `POST /api/v1/save/:blogid` — Toggle saved blogs
- `GET /api/v1/blog/saved/all` — Fetch saved blogs

**Environment Variables**

```ini
PORT=4002
DB_URL=postgres://...
JWT_SEC=supersecret
REDIS_URL=redis://localhost:6379
USER_SERVICE=http://localhost:4003
Rabbimq_Host=localhost
Rabbimq_Username=guest
Rabbimq_Password=guest
```

---

### User Service (`services/user`)

**Stack:** Express 5, MongoDB (Mongoose), Google OAuth, Cloudinary

**Endpoints:**

- `POST /api/v1/login` — Google OAuth login and JWT issue
- `GET /api/v1/me` — Get authenticated user
- `POST /api/v1/user/update` — Update profile info
- `POST /api/v1/user/update/pic` — Upload avatar to Cloudinary
- `GET /api/v1/user/:id` — Fetch author info for blog display

**Environment Variables**

```ini
PORT=4003
JWT_SEC=supersecret
MONGO_URI=mongodb://localhost:27017
Cloud_Name=...
Cloud_Api_Key=...
Cloud_Api_Secret=...
Google_Client_id=...
Google_client_secret=...
```

---

## 🎨 Frontend (`client`)

**Stack:** Next.js App Router, Tailwind CSS v4, Radix UI, Jodit Editor, React Hot Toast, Google OAuth

**Features**

- Global AppContext for session, filters, and saved posts
- AI-assisted blog composer (title, description, grammar)
- Profile dashboard and saved blogs view
- Dynamic blog listings with search & category filters

**Environment Example (`.env.local`)**

```ini
NEXT_PUBLIC_USER_SERVICE=http://localhost:4003
NEXT_PUBLIC_AUTHOR_SERVICE=http://localhost:4001
NEXT_PUBLIC_BLOG_SERVICE=http://localhost:4002
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (Neon compatible)
- MongoDB
- Redis
- RabbitMQ
- Cloudinary account
- Google Cloud OAuth + Gemini API key

### Setup

```bash
# Install dependencies
cd services/author && npm install
cd ../blog && npm install
cd ../user && npm install
cd ../../client && npm install

# Optional: Build TypeScript
npm run build
```

### Running Locally

Open separate terminals for each:

```bash
# Author
cd services/author && npm run dev

# Blog
cd services/blog && npm run dev

# User
cd services/user && npm run dev

# Frontend
cd client && npm run dev
```

Then visit **http://localhost:3000**  
Login via Google → Compose → Publish → View cached blog feed 🎉

---

## 🧠 Tips & Notes

- Use the **same `JWT_SEC`** across all services for token verification.
- Redis caching boosts performance — monitor hit rates and invalidation logs.
- Gemini endpoints are optional but recommended for high-quality AI grammar correction.
- Update frontend service URLs when deploying independently or using Docker.
