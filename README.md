# InkFlow

A full-stack blog platform built as a microservice monorepo, combining a Next.js client with three TypeScript/Express services to handle user identities, blog authoring workflows, and high-performance blog delivery. Features Redis caching, RabbitMQ-based cache invalidation, and AI-assisted authoring tools.

**🌐 Live Demo**: [https://blog-app-client-lime-beta.vercel.app/blogs](https://blog-app-client-lime-beta.vercel.app/blogs)

## 🏗️ Architecture

This project demonstrates a modern microservices architecture with:

- **Client**: Next.js 15 application with Google OAuth, rich-text editing, and AI-powered content assistance
- **Author Service**: Blog creation, updates, and AI-powered content enhancement
- **Blog Service**: High-performance blog delivery with Redis caching
- **User Service**: Authentication and user profile management
- **Message Queue**: RabbitMQ for distributed cache invalidation
- **Caching Layer**: Redis for optimal read performance

## 📁 Repository Layout

| Path               | Description                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `client/`          | Next.js 15 application providing web UI, Google OAuth login, blog creation tools, and browsing experiences     |
| `services/author/` | Express service for creating, updating, and deleting blogs with Cloudinary asset storage and Gemini AI helpers |
| `services/blog/`   | Express service for serving blog listings and detail views with Redis caching and RabbitMQ cache invalidation  |
| `services/user/`   | Express service managing Google OAuth logins, user profiles, and avatar uploads                                |

## 🛠️ Tech Stack

### Frontend

- Next.js 15
- React with Context API
- Rich-text editor
- Google OAuth integration

### Backend Services

- Node.js & TypeScript
- Express.js
- PostgreSQL (Neon Serverless)
- MongoDB
- Redis (caching layer)
- RabbitMQ (message broker)

### External Services

- **Cloudinary** - Image storage and CDN
- **Google Gemini AI** - Content assistance (title generation, description polishing, grammar fixes)
- **Google OAuth** - Authentication
- **Neon** - Serverless Postgres database

## 🚀 Features

### Author Service (`services/author/`)

- **Blog Management**
  - Create, update, and delete blog posts
  - Upload and manage cover images via Cloudinary
  - Ownership-based access control
  - Automatic cache invalidation on content changes
- **AI-Powered Content Assistance** (Google Gemini)
  - Smart title generation
  - Description generation and polishing
  - Grammar and content improvements for rich-text HTML
- **Database Tables**
  - Blogs table with metadata and content
  - Comments table for blog discussions
  - Saved blogs table for user bookmarks

### Blog Service (`services/blog/`)

- **Public API**
  - Blog listing with pagination
  - Blog detail views with author profiles
  - Search functionality
  - Category-based filtering
- **Performance Optimization**
  - Redis-backed caching with search and category-aware keys
  - Cached responses for frequently accessed content
  - Author profile hydration and caching
- **Real-time Updates**
  - RabbitMQ consumer listening to `cache-invalidation` queue
  - Automatic cache purging on content changes
  - Optional cache rebuilding for default listings

### User Service (`services/user/`)

- **Authentication**
  - Google OAuth 2.0 integration
  - JWT-based session management
  - Secure token generation and validation
- **Profile Management**
  - User profile CRUD operations
  - Avatar upload and storage (Cloudinary)
  - Profile retrieval API for other services

### Next.js Client (`client/`)

- **User Interface**
  - Modern, responsive design
  - Google OAuth login flow
  - Rich-text blog editor with formatting tools
- **Content Features**
  - Browse blogs with search and category filters
  - Save/bookmark favorite blogs
  - View blog details with author information
  - AI-powered content suggestions while writing
- **State Management**
  - Global React Context for authenticated state
  - Synchronized saved blogs across the app
  - Real-time updates for blog listings

## 🔄 Microservices Communication

### Cache Invalidation Flow

1. User updates/creates/deletes content in **Author Service**
2. Author Service publishes message to `cache-invalidation` queue in **RabbitMQ**
3. **Blog Service** consumer receives message with glob patterns
4. Blog Service purges matching cache keys from **Redis**
5. Next request rebuilds cache with fresh data

### Service Integration

- **Blog Service** ↔ **User Service**: Fetches author profiles for blog hydration
- **Client** ↔ All Services: RESTful API calls with JWT authentication
- **Author Service** ↔ **RabbitMQ**: Publishes cache invalidation jobs
- **Blog Service** ↔ **Redis**: Stores and retrieves cached responses

## 📋 Prerequisites

Before running the stack locally, ensure you have:

- **Node.js** 20+ and npm
- **PostgreSQL** (Neon-compatible or any Postgres instance)
- **MongoDB**
- **Redis**
- **RabbitMQ** (with management user `admin:admin` on `localhost:5672/app`)
- **Cloudinary account** credentials
- **Google OAuth** credentials
- **Google Gemini API** key

### Optional Tools

- **Docker** (recommended for running infrastructure locally)
- `concurrently` and `nodemon` (already in service package.json files)

## ⚙️ Environment Variables

### `services/author/.env`

```env
PORT=5000
DB_URL=postgres://<user>:<password>@<host>:5432/blog
JWT_SEC=your-super-secret-key
Cloud_Name=<cloudinary-cloud-name>
Cloud_Api_Key=<cloudinary-api-key>
Cloud_Api_Secret=<cloudinary-api-secret>
Gemini_Api_Key=<google-gemini-api-key>
```

### `services/blog/.env`

```env
PORT=5002
DB_URL=postgres://<user>:<password>@<host>:5432/blog
JWT_SEC=your-super-secret-key
REDIS_URL=redis://localhost:6379
USER_SERVICE=http://localhost:8080
```

### `services/user/.env`

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/inkflow
JWT_SEC=your-super-secret-key
Cloud_Name=<cloudinary-cloud-name>
Cloud_Api_Key=<cloudinary-api-key>
Cloud_Api_Secret=<cloudinary-api-secret>
Google_Client_id=<google-oauth-client-id>
Google_client_secret=<google-oauth-client-secret>
```

**Important Notes:**

- Ensure `JWT_SEC` is **identical across all services**
- Update service URLs in `client/src/context/AppContext.tsx` if running on different hosts/ports
- For production deployment (like Vercel), use environment-specific database URLs (e.g., Neon for Postgres)

## 🏃 Running Locally

### 1. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install service dependencies
cd ../services/author
npm install

cd ../blog
npm install

cd ../user
npm install
```

### 2. Start Infrastructure (Docker)

```bash
# PostgreSQL
docker run -d --name inkflow-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16

# MongoDB
docker run -d --name inkflow-mongo \
  -p 27017:27017 \
  mongo:7

# Redis
docker run -d --name inkflow-redis \
  -p 6379:6379 \
  redis:7

# RabbitMQ with Management Console
docker run -d --hostname rabbit \
  --name inkflow-rabbit \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  rabbitmq:3-management
```

**RabbitMQ Management Console**: Access at `http://localhost:15672` (admin/admin)

### 3. Build Services

```bash
# Build TypeScript services
cd services/author && npm run build
cd ../blog && npm run build
cd ../user && npm run build
```

### 4. Run Services (in separate terminals)

```bash
# Terminal 1 - Author Service
cd services/author
npm run dev

# Terminal 2 - Blog Service
cd services/blog
npm run dev

# Terminal 3 - User Service
cd services/user
npm run dev
```

**Alternative**: Use `npm run start` to run compiled JavaScript from `dist/` instead of watch mode.

### 5. Start Next.js Client

```bash
cd client
npm run dev
```

**Access the application**: [http://localhost:3000](http://localhost:3000)

## 📜 Useful Scripts

| Location     | Script          | Purpose                                           |
| ------------ | --------------- | ------------------------------------------------- |
| `client`     | `npm run dev`   | Start Next.js dev server with hot reloading       |
| `client`     | `npm run build` | Create production build                           |
| `client`     | `npm run start` | Serve production build                            |
| `services/*` | `npm run build` | Compile TypeScript to `dist/`                     |
| `services/*` | `npm run dev`   | Run with live reload (TypeScript watch + nodemon) |
| `services/*` | `npm run start` | Launch compiled service from `dist/server.js`     |

## 🗄️ Database Schema

### PostgreSQL (Blogs & Comments)

- **blogs**: id, title, description, content (HTML), cover_image_url, category, author_id, created_at, updated_at
- **comments**: id, blog_id, user_id, content, created_at
- **saved_blogs**: id, user_id, blog_id, saved_at

### MongoDB (Users)

- **users**: \_id, google_id, email, name, avatar_url, created_at, updated_at

## 🔒 Security Features

- **JWT Authentication**: Token-based auth across all services
- **Ownership Validation**: Users can only modify their own content
- **Secure OAuth Flow**: Google OAuth 2.0 implementation
- **Environment Variables**: Sensitive credentials stored securely
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🐛 Troubleshooting

### Authentication Errors

- **Symptom**: 401 Unauthorized responses
- **Solution**: Ensure `JWT_SEC` is identical across all service `.env` files
- **Check**: Token is being passed correctly in Authorization headers

### Google Login Failures

- **Symptom**: OAuth redirect errors or invalid credentials
- **Solution**:
  - Verify OAuth client configuration matches your credentials
  - Ensure OAuth consent screen allows `http://localhost:3000` as authorized redirect URI
  - Check `Google_Client_id` and `Google_client_secret` values are correct
  - For production, add your Vercel domain to authorized origins

### RabbitMQ Connection Issues

- **Symptom**: "ECONNREFUSED" or connection retry logs
- **Solution**:
  - Verify RabbitMQ is running at `amqp://admin:admin@localhost:5672/app`
  - Update connection strings in `services/author/src/utils/rabbitmq.ts` and `services/blog/src/utils/consumer.ts` if hosting elsewhere
  - Check RabbitMQ management console at `http://localhost:15672`

### Redis Cache Issues

- **Symptom**: Slow response times or stale data
- **Solution**:
  - Verify `REDIS_URL` is reachable
  - Check for "Connected to redis" log message on blog service startup
  - Cache misses on first load are expected
  - Monitor RabbitMQ messages to ensure cache invalidation is working

### Database Connection Issues

- **Symptom**: "Connection refused" or "Cannot connect to database"
- **Solution**:
  - Ensure PostgreSQL and MongoDB are running and accessible
  - Verify database URLs in environment variables (check host, port, credentials)
  - For Neon, ensure you're using the correct connection string format
  - Check that database schemas/tables are created on first run

### Cloudinary Upload Errors

- **Symptom**: Images not uploading or 401 errors
- **Solution**:
  - Verify `Cloud_Name`, `Cloud_Api_Key`, and `Cloud_Api_Secret` are correct
  - Check Cloudinary dashboard for upload permissions
  - Ensure folder structure exists in Cloudinary

### Gemini AI Not Working

- **Symptom**: AI suggestions failing or timing out
- **Solution**:
  - Verify `Gemini_Api_Key` is valid
  - Check Google Cloud Console for API quota and billing
  - Ensure Gemini API is enabled in your Google Cloud project

## 🚀 Deployment

### Client (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Services

- Deploy to platforms like Railway, Render, or AWS
- Ensure all environment variables are set
- Configure persistent storage for PostgreSQL, MongoDB, and Redis
- Set up RabbitMQ instance (CloudAMQP recommended)

## 🎯 API Endpoints

### Author Service (Port 5000)

- `POST /api/v1/blogs` - Create blog
- `PUT /api/v1/blogs/:id` - Update blog
- `DELETE /api/v1/blogs/:id` - Delete blog
- `POST /api/v1/blogs/ai/title` - Generate title
- `POST /api/v1/blogs/ai/description` - Generate description
- `POST /api/v1/blogs/ai/polish` - Polish content

### Blog Service (Port 5002)

- `GET /api/v1/blogs` - List blogs (with search & category filters)
- `GET /api/v1/blogs/:id` - Get blog details

### User Service (Port 8080)

- `POST /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/avatar` - Upload avatar

## 📝 License

MIT

## 👤 Author

**Aayam Dahal**

- GitHub: [@aayamdahal](https://github.com/aayamdahal)
- Live Demo: [InkFlow](https://blog-app-client-lime-beta.vercel.app/blogs)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/aayamdahal/blog-app-micro/issues).

## ⭐ Show your support

Give a ⭐️ if you like this project!

---

**Built with ❤️ using modern microservices architecture**

_Powered by Next.js, Express.js, PostgreSQL, MongoDB, Redis, RabbitMQ, and Google Gemini AI_
