diff --git a//dev/null b/README.md
index 0000000000000000000000000000000000000000..f2d4db0fbd3a93aa5630a80764787b9902a61c55 100644
--- a//dev/null
+++ b/README.md
@@ -0,0 +1,164 @@
+# The Reading Retreat

- +The Reading Retreat is a full-stack blog platform built as a microservice monorepo. It combines a Next.js client with three TypeScript/Express services to handle user identities, blog authoring workflows, and high-performance blog delivery. Redis caching, RabbitMQ-based cache invalidation, and AI-assisted authoring tools power the experience end to end.
- +## Repository layout
- +| Path | Description |
  +| --- | --- |
  +| `client/` | Next.js 15 application that provides the web UI, Google OAuth login, blog creation tools, and blog browsing experiences. |
  +| `services/author/` | Express service backed by Neon/PostgreSQL that creates, updates, and deletes blogs, stores assets in Cloudinary, and exposes Gemini AI helpers for titles, descriptions, and grammar fixes. |
  +| `services/blog/` | Express service backed by Neon/PostgreSQL that serves blog listings and detail views with Redis caching and cache invalidation messages consumed from RabbitMQ. |
  +| `services/user/` | Express service backed by MongoDB that manages Google OAuth logins, user profiles, and avatar uploads. |
- +## Service overview
- +### Author service (`services/author`)
  +- Boots an Express API with Cloudinary configured from environment variables and ensures blog, comment, and saved-blog tables exist on startup.【F:services/author/src/server.ts†L6-L60】
  +- Accepts authenticated multipart blog submissions, uploads cover images to Cloudinary, and stores metadata/content in Postgres.【F:services/author/src/controllers/blog.ts†L8-L35】
  +- Supports secure blog updates and deletions with ownership checks and automatic asset replacement when a new image is supplied.【F:services/author/src/controllers/blog.ts†L37-L86】
  +- Provides Gemini-powered helpers to polish titles, descriptions, and rich-text HTML content used by the Next.js editor.【F:services/author/src/controllers/blog.ts†L88-L216】
  +- Connects to RabbitMQ (default `amqp://admin:admin@localhost:5672/app`) so cache invalidation jobs can be published to downstream services when content changes.【F:services/author/src/utils/rabbitmq.ts†L1-L53】
- +### Blog service (`services/blog`)
  +- Exposes public blog listing and detail routes, persisting blog data in the same Postgres instance used by the author service.【F:services/blog/src/routes/blog.ts†L1-L9】【F:services/blog/src/utils/db.ts†L1-L7】
  +- Wraps database results in Redis-backed caches with search + category aware keys and serves cached responses when possible.【F:services/blog/src/controllers/blog.ts†L1-L51】
  +- Hydrates blog detail views with author profiles fetched from the user service and caches those responses as well.【F:services/blog/src/controllers/blog.ts†L53-L78】
  +- Listens to the `cache-invalidation` RabbitMQ queue and purges matching keys before optionally rebuilding the default blog listing cache.【F:services/blog/src/utils/consumer.ts†L1-L44】
- +### User service (`services/user`)
  +- Connects to MongoDB, configures Cloudinary, and mounts `/api/v1` routes for Google OAuth login and profile management.【F:services/user/src/server.ts†L1-L24】
  +- Exchanges Google authorization codes for profile data, stores/updates user records, and issues JWTs consumed by the other services.【F:services/user/src/controllers/user.ts†L10-L45】
  +- Exposes profile retrieval, account updates, and avatar uploads (stored in Cloudinary) guarded by JWT middleware.【F:services/user/src/controllers/user.ts†L47-L121】【F:services/user/src/middleware/isAuth.ts†L1-L32】
- +### Next.js client (`client`)
  +- Provides Google OAuth login, blog creation with rich-text editing, AI-powered copy improvements, and blog browsing/saving flows backed by the three APIs.【F:client/src/app/login/page.tsx†L1-L60】【F:client/src/app/blog/new/page.tsx†L1-L205】【F:client/src/context/AppContext.tsx†L16-L189】
  +- Uses a global React context to coordinate authenticated state, fetch blog listings with search/category filters, and keep saved blogs in sync.【F:client/src/context/AppContext.tsx†L56-L189】
- +## Prerequisites
- +Before running the stack locally you will need:
- +- **Node.js 20+** and **npm** for the Next.js client and TypeScript services.
  +- **PostgreSQL** (the code is tuned for [Neon](https://neon.tech/) serverless, but any Postgres instance works) for blog data.【F:services/author/src/utils/db.ts†L1-L7】
  +- **MongoDB** for user accounts.【F:services/user/src/utils/db.ts†L1-L13】
  +- **Redis** for blog caching.【F:services/blog/src/server.ts†L1-L28】
  +- **RabbitMQ** (with the management user `admin:admin` on `localhost:5672/app` by default) for cache invalidation fan-out.【F:services/blog/src/utils/consumer.ts†L10-L43】
  +- **Cloudinary** account credentials to store uploaded images.【F:services/author/src/server.ts†L11-L15】【F:services/user/src/server.ts†L9-L13】
  +- **Google OAuth credentials** and a Gemini API key for AI-assisted authoring.【F:services/user/src/utils/GoogleConfig.ts†L1-L13】【F:services/author/src/controllers/blog.ts†L118-L216】
- +Optional but recommended tooling includes Docker (to run Redis/RabbitMQ locally) and `concurrently`/`nodemon` (already listed in the service `package.json` files for development).
- +## Environment variables
- +Create a `.env` file inside each service directory. The example values below assume local development ports that match the hard-coded defaults in the client context.
- +### `services/author/.env` +`
+PORT=5000
+DB_URL=postgres://<user>:<password>@localhost:5432/blog
+JWT_SEC=super-secret-key
+Cloud_Name=<cloudinary-cloud>
+Cloud_Api_Key=<cloudinary-key>
+Cloud_Api_Secret=<cloudinary-secret>
+Gemini_Api_Key=<google-gemini-api-key>
+`
- +### `services/blog/.env` +`
+PORT=5002
+DB_URL=postgres://<user>:<password>@localhost:5432/blog
+JWT_SEC=super-secret-key
+REDIS_URL=redis://localhost:6379
+USER_SERVICE=http://localhost:8080
+`
- +### `services/user/.env` +`
+PORT=8080
+MONGO_URI=mongodb://localhost:27017
+JWT_SEC=super-secret-key
+Cloud_Name=<cloudinary-cloud>
+Cloud_Api_Key=<cloudinary-key>
+Cloud_Api_Secret=<cloudinary-secret>
+Google_Client_id=<google-oauth-client-id>
+Google_client_secret=<google-oauth-client-secret>
+`
- +The Next.js client reads service URLs from `src/context/AppContext.tsx`. Update `user_service`, `author_service`, and `blog_service` constants if you run the APIs on different hosts or ports.【F:client/src/context/AppContext.tsx†L16-L20】
- +## Running locally
- +1. **Install dependencies**
- ```bash

  ```
- # install frontend dependencies
- cd client
- npm install
-
- # install each service's dependencies
- cd ../services/author && npm install
- cd ../blog && npm install
- cd ../user && npm install
- ```

  ```
- +2. **Start infrastructure** (examples using Docker):
- ```bash

  ```
- docker run -d --name reading-retreat-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
- docker run -d --name reading-retreat-mongo -p 27017:27017 mongo:7
- docker run -d --name reading-retreat-redis -p 6379:6379 redis:7
- docker run -d --hostname rabbit --name reading-retreat-rabbit -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin rabbitmq:3-management
- ```

  ```
- +3. **Compile the TypeScript services** (generates `dist/` output consumed by `npm start`):
- ```bash

  ```
- cd services/author && npm run build
- cd ../blog && npm run build
- cd ../user && npm run build
- ```

  ```
- +4. **Run the services** in separate terminals:
- ```bash

  ```
- # Author service
- cd services/author
- npm run dev # watches TypeScript and restarts on changes
-
- # Blog service
- cd services/blog
- npm run dev
-
- # User service
- cd services/user
- npm run dev
- ```

  ```
- Use `npm run start` instead if you prefer to run the compiled JavaScript from `dist/`.
- +5. **Start the Next.js client**:
- ```bash

  ```
- cd client
- npm run dev
- ```

  ```
- The app becomes available at [http://localhost:3000](http://localhost:3000/). The login page triggers the Google OAuth flow, then the dashboard allows you to browse blogs, create new posts with AI assistance, and manage saved content.
- +## Messaging & cache invalidation
- +- The blog service spins up a Redis client on boot and subscribes to the `cache-invalidation` queue so it can delete cached listing/detail responses whenever new messages arrive.【F:services/blog/src/server.ts†L1-L28】【F:services/blog/src/utils/consumer.ts†L10-L43】
  +- The author service exposes helpers (`invalidateCacheJob`) that publish invalidation requests containing glob patterns for cache keys when content changes. Calling this helper after `createBlog`, `updateBlog`, or `deleteBlog` keeps read models fresh across services.【F:services/author/src/utils/rabbitmq.ts†L24-L53】
- +## Useful scripts
- +| Location | Script | Purpose |
  +| --- | --- | --- |
  +| `client` | `npm run dev` | Start the Next.js dev server with hot reloading. |
  +| `client` | `npm run build` / `npm run start` | Produce and serve a production build. |
  +| `services/*` | `npm run build` | Install dependencies (author/user) and compile TypeScript to `dist/`. |
  +| `services/*` | `npm run dev` | Run `tsc -w` and `nodemon dist/server.js` concurrently for live reload development. |
  +| `services/*` | `npm run start` | Launch the compiled service from `dist/server.js`. |
- +## Troubleshooting
- +- **Auth errors** usually mean the `JWT_SEC` value is inconsistent across services. Use the same secret in every `.env` file.【F:services/author/src/middlewares/isAuth.ts†L16-L27】【F:services/blog/src/middleware/isAuth.ts†L22-L44】【F:services/user/src/middleware/isAuth.ts†L12-L31】
  +- **Google login failures** indicate a mismatch between your OAuth client configuration and the `Google_Client_id`/`Google_client_secret` values. Ensure the OAuth consent screen allows `http://localhost:3000` as an origin and redirect URI.
  +- **RabbitMQ connection retries** will appear until the broker is reachable at `amqp://admin:admin@localhost:5672/app`. Update the connection string in `services/author/src/utils/rabbitmq.ts` and `services/blog/src/utils/consumer.ts` if you host RabbitMQ elsewhere.【F:services/author/src/utils/rabbitmq.ts†L6-L12】【F:services/blog/src/utils/consumer.ts†L11-L14】
  +- **Redis cache misses** are expected on first load or after invalidation. Verify `REDIS_URL` is reachable and that the blog service logs “Connected to redis” during startup.【F:services/blog/src/server.ts†L1-L28】
- +With these pieces configured, you can iterate on the Next.js UI, extend the Express APIs, or plug in additional services knowing how the microservice components fit together.
