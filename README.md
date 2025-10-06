# Blog App Microservices Monorepo

## Overview

This repository contains a full-stack blogging platform implemented as a microservices-based architecture. It includes three TypeScript/Node.js backend services and a Next.js frontend that together provide Google OAuth authentication, blog authoring with AI-assisted tooling, social interactions, and cached content delivery. The services communicate over HTTP, share PostgreSQL and MongoDB data stores, and coordinate cache invalidation through RabbitMQ and Redis.

## Repository structure

```
.
├── client/           # Next.js 15 frontend for readers and authors
├── services/
│   ├── author/       # Blog authoring APIs and AI helpers
│   ├── blog/         # Public blog APIs, caching, and interactions
│   └── user/         # Authentication, profiles, and Google OAuth
├── package.json      # Workspace-level dependency references
└── README.md         # Project documentation (this file)
```

## Architecture

- **Frontend (Next.js 15 / React 19)** — Provides the web UI, handles Google login, and calls the backend services through the URLs defined in the shared app context. Readers can browse, filter, and save posts while authors can compose blogs with AI-powered editing tools.【F:client/src/context/AppContext.tsx†L1-L138】【F:client/src/app/blog/new/page.tsx†L1-L125】
- **Author service** — Manages blog creation, updates, deletion, and AI endpoints for grammar and content refinement. Persists blogs, comments, and saved-post metadata in PostgreSQL (Neon). Publishes cache-invalidation messages to RabbitMQ after mutations.【F:services/author/src/server.ts†L1-L63】【F:services/author/src/controllers/blog.ts†L1-L199】【F:services/author/src/utils/rabbitmq.ts†L1-L40】
- **Blog service** — Serves blog listings and detail pages, including author lookups, comments, and saved-post toggling. Uses Redis for query caching, consumes RabbitMQ invalidation jobs, and rebuilds cache when necessary.【F:services/blog/src/server.ts†L1-L30】【F:services/blog/src/controllers/blog.ts†L1-L112】【F:services/blog/src/utils/consumer.ts†L1-L60】
- **User service** — Handles Google OAuth login, JWT issuance, profile management, and avatar uploads. Stores users in MongoDB and signs tokens that the other services trust for authorization.【F:services/user/src/controllers/user.ts†L1-L104】【F:services/user/src/server.ts†L1-L26】

### Data flow & integration

1. The frontend authenticates users via the user service. A JWT stored in cookies is sent on subsequent author/blog service requests.【F:client/src/context/AppContext.tsx†L1-L138】【F:services/blog/src/middleware/isAuth.ts†L1-L48】
2. The author service writes blog data to PostgreSQL and publishes cache invalidation events to RabbitMQ. The blog service consumes those messages, clears matching keys from Redis, and warms the cache with the latest blog list.【F:services/author/src/controllers/blog.ts†L33-L115】【F:services/author/src/utils/rabbitmq.ts†L1-L40】【F:services/blog/src/utils/consumer.ts†L23-L55】
3. Blog detail queries enrich responses with author profiles by calling the user service over HTTP.【F:services/blog/src/controllers/blog.ts†L60-L82】
4. AI-assisted endpoints use Google Gemini models for title, description, and HTML grammar correction to help authors polish their posts.【F:services/author/src/controllers/blog.ts†L118-L198】

## Backend services

### Author service (`services/author`)

- **Tech stack:** Express 5, PostgreSQL (Neon), Cloudinary for media, RabbitMQ, Google Gemini APIs.
- **Key endpoints:**
  - `POST /api/v1/blog/new` — Create a blog post with image upload.【F:services/author/src/routes/blog.ts†L13-L19】【F:services/author/src/controllers/blog.ts†L1-L55】
  - `POST /api/v1/blog/:id` — Update an existing blog, including optional image replacement.【F:services/author/src/controllers/blog.ts†L57-L115】
  - `DELETE /api/v1/blog/:id` — Remove a blog and associated comments/saved entries.【F:services/author/src/controllers/blog.ts†L117-L166】
  - `POST /api/v1/ai/*` — Gemini-powered helpers for titles, descriptions, and HTML grammar cleanup.【F:services/author/src/controllers/blog.ts†L168-L198】
- **Environment variables:**
  - `PORT` — HTTP port.
  - `DB_URL` — PostgreSQL connection string.【F:services/author/src/utils/db.ts†L1-L7】
  - `JWT_SEC` — Shared JWT secret for auth middleware.【F:services/author/src/middlewares/isAuth.ts†L28-L47】
  - `Cloud_Name`, `Cloud_Api_Key`, `Cloud_Api_Secret` — Cloudinary credentials.【F:services/author/src/server.ts†L1-L21】
  - `Rabbimq_Host`, `Rabbimq_Username`, `Rabbimq_Password` — RabbitMQ access.【F:services/author/src/utils/rabbitmq.ts†L1-L40】
  - `Gemini_Api_Key` — Google Gemini API key.【F:services/author/src/controllers/blog.ts†L90-L198】

### Blog service (`services/blog`)

- **Tech stack:** Express 5, PostgreSQL (Neon), Redis, RabbitMQ consumer.
- **Key endpoints:**
  - `GET /api/v1/blog/all` — Filterable blog listing with Redis caching.【F:services/blog/src/routes/blog.ts†L13-L21】【F:services/blog/src/controllers/blog.ts†L1-L41】
  - `GET /api/v1/blog/:id` — Single blog with cached response and author enrichment.【F:services/blog/src/controllers/blog.ts†L43-L87】
  - `POST /api/v1/comment/:id` / `DELETE /api/v1/comment/:commentid` — Comment management (auth required).【F:services/blog/src/controllers/blog.ts†L89-L121】
  - `POST /api/v1/save/:blogid` — Toggle saved blogs; `GET /api/v1/blog/saved/all` — list saved posts.【F:services/blog/src/controllers/blog.ts†L123-L160】
- **Environment variables:**
  - `PORT`, `DB_URL`, `JWT_SEC` — service basics.【F:services/blog/src/server.ts†L1-L30】【F:services/blog/src/utils/db.ts†L1-L7】【F:services/blog/src/middleware/isAuth.ts†L25-L47】
  - `REDIS_URL` — Redis connection string.【F:services/blog/src/server.ts†L17-L24】
  - `USER_SERVICE` — Base URL for user service lookups.【F:services/blog/src/controllers/blog.ts†L60-L82】
  - RabbitMQ credentials (`Rabbimq_*`) matching the author service publisher.【F:services/blog/src/utils/consumer.ts†L9-L56】

### User service (`services/user`)

- **Tech stack:** Express 5, MongoDB (Mongoose), Google OAuth, Cloudinary.
- **Key endpoints:**
  - `POST /api/v1/login` — Google OAuth 2.0 code exchange, JWT issuance.【F:services/user/src/routes/user.ts†L13-L18】【F:services/user/src/controllers/user.ts†L1-L56】
  - `GET /api/v1/me` / `POST /api/v1/user/update` — Authenticated profile retrieval and edits.【F:services/user/src/controllers/user.ts†L58-L87】
  - `POST /api/v1/user/update/pic` — Avatar upload to Cloudinary.【F:services/user/src/controllers/user.ts†L89-L104】
  - `GET /api/v1/user/:id` — Public profile lookup for blog pages.【F:services/user/src/controllers/user.ts†L44-L55】
- **Environment variables:**
  - `PORT`, `JWT_SEC` — service basics.【F:services/user/src/server.ts†L1-L26】【F:services/user/src/controllers/user.ts†L32-L41】
  - `MONGO_URI` — MongoDB connection string.【F:services/user/src/utils/db.ts†L1-L15】
  - `Cloud_Name`, `Cloud_Api_Key`, `Cloud_Api_Secret` — Cloudinary credentials.【F:services/user/src/server.ts†L1-L21】
  - `Google_Client_id`, `Google_client_secret` — OAuth client credentials.【F:services/user/src/utils/GoogleConfig.ts†L1-L12】

## Frontend (`client`)

- **Tech stack:** Next.js App Router, Tailwind CSS v4, Radix UI primitives, React Hot Toast, Jodit rich text editor, Google OAuth provider.【F:client/package.json†L1-L39】
- **Features:**
  - Global context (`AppContext`) keeps user session, blog filters, saved posts, and service base URLs.【F:client/src/context/AppContext.tsx†L1-L152】
  - Blog listing with search/category filtering and sidebar controls.【F:client/src/app/blogs/page.tsx†L1-L46】
  - Blog composer featuring AI-assisted title, description, and HTML grammar corrections plus Cloudinary image uploads.【F:client/src/app/blog/new/page.tsx†L1-L125】
  - Saved blog dashboard, profile management, and Google-based login (see `/app/profile` and `/app/login`).
- **Environment variables:** Create a `.env.local` to override the default hosted service URLs or Google OAuth client if self-hosting. Update `client/src/context/AppContext.tsx` when pointing to local backends.【F:client/src/context/AppContext.tsx†L15-L38】

## Getting started

### Prerequisites

- Node.js 18+ and npm (or pnpm/yarn) for all projects.
- PostgreSQL database (Neon-compatible connection string) for author/blog services.
- MongoDB instance for the user service.
- Redis instance for caching.
- RabbitMQ broker for cache invalidation fan-out.
- Cloudinary account for media uploads.
- Google Cloud project with OAuth client and Gemini API key.

### Setup steps

1. **Install dependencies** (run inside each package):
   ```bash
   cd services/author && npm install
   cd ../blog && npm install
   cd ../user && npm install
   cd ../../client && npm install
   ```
2. **Create environment files** for each service using the variables listed above. Example `.env` snippets:
   ```ini
   # services/author/.env
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
   ```ini
   # services/blog/.env
   PORT=4002
   DB_URL=postgres://...
   JWT_SEC=supersecret
   REDIS_URL=redis://localhost:6379
   USER_SERVICE=http://localhost:4003
   Rabbimq_Host=localhost
   Rabbimq_Username=guest
   Rabbimq_Password=guest
   ```
   ```ini
   # services/user/.env
   PORT=4003
   JWT_SEC=supersecret
   MONGO_URI=mongodb://localhost:27017
   Cloud_Name=...
   Cloud_Api_Key=...
   Cloud_Api_Secret=...
   Google_Client_id=...
   Google_client_secret=...
   ```
   For the frontend, create `client/.env.local` if you need to override OAuth or service URLs.
3. **Build TypeScript** (optional for production):
   ```bash
   npm run build
   ```
   Each service compiles to `dist/` via `tsc` before running in production.【F:services/author/package.json†L7-L12】【F:services/blog/package.json†L7-L12】【F:services/user/package.json†L7-L12】

### Running locally

Open separate terminals for each process:

```bash
# Author service
cd services/author
npm run dev

# Blog service
cd services/blog
npm run dev

# User service
cd services/user
npm run dev

# Frontend
cd client
npm run dev
```

The dev scripts run `tsc -w` alongside `nodemon dist/server.js` for hot reload in the backend services, and `next dev` for the frontend.【F:services/author/package.json†L7-L12】【F:services/blog/package.json†L7-L12】【F:services/user/package.json†L7-L12】【F:client/package.json†L5-L12】

Once all services are running, visit `http://localhost:3000` to access the application, sign in with Google, compose posts, and explore the blog feed.

## Additional notes

- Ensure the JWT secret (`JWT_SEC`) matches across all services so that tokens issued by the user service are accepted elsewhere.【F:services/user/src/controllers/user.ts†L32-L41】【F:services/author/src/middlewares/isAuth.ts†L28-L47】【F:services/blog/src/middleware/isAuth.ts†L25-L47】
- If you deploy services separately, update the frontend context base URLs or externalize them through environment variables.【F:client/src/context/AppContext.tsx†L15-L38】
- Redis caching dramatically reduces database load for high-traffic feeds. Monitor cache hit rates and RabbitMQ logs to ensure invalidation events are processed.【F:services/blog/src/controllers/blog.ts†L1-L41】【F:services/blog/src/utils/consumer.ts†L33-L55】
- Gemini endpoints are optional but provide high-quality grammar correction. Handle API quotas and latency accordingly.【F:services/author/src/controllers/blog.ts†L118-L198】
