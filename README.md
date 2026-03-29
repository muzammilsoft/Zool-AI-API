# Zool-AI API - Node.js TypeScript Version

Zool-AI API is a multi-modal wrapper for Pollinations AI, supporting chat, image, video, and audio generation with context-aware session management.

## Features
- **Chat API**: Context-aware chat (5-minute TTL, 6500 token limit) with a default Sudanese personality.
- **Image/Video Generation**: Easy-to-use endpoints for generating visuals.
- **Audio Processing**: Text-to-speech and transcriptions support.
- **Admin Dashboard**: Secure management of API keys and developer requests.
- **Developer Portal**: Easy registration for API keys.
- **Arabic Documentation**: Fully documented in Arabic.

## Deployment Notes (Vercel)

### Persistence Warning (SQLite)
Since this project uses **SQLite** for storing API keys and developer requests, please be aware that **Vercel's serverless functions have an ephemeral filesystem**. Files written to `/tmp` (where the database is stored in production) are not persistent across cold starts or redeployments.

For production use with persistence, it is recommended to:
1. Connect to an external SQL database (PostgreSQL, MySQL).
2. Use a persistent SQLite solution if available on your hosting.
3. Use the `ABSOLUTE_KEY` environment variable as a reliable fallback for authorized access.

### Redis
Session history is stored in **Redis**. For production, use a managed Redis service like **Upstash**.

## Environment Variables
Copy `.env.example` to `.env` and fill in the values.
- `POLLINATIONS_API_KEY`: Your Pollinations API key.
- `REDIS_URL`: Your Redis connection string.
- `SESSION_SECRET`: A secure secret for admin sessions.
- `ABSOLUTE_KEY`: A "master" API key that always works.
- `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Default credentials for the first login.
- `MAIL_*`: Configuration for the developer registration email notifications.

## Getting Started
1. `npm install`
2. `npm run dev` (starts on port 3000)
3. Visit `http://localhost:3000` for the landing page and `http://localhost:3000/docs` for the API documentation.
