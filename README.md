# Zool-AI API (Node.js + TypeScript Version) 🚀

Zool-AI API is a robust wrapper for Pollinations AI, optimized for handling text, image, video, and audio generation with session management and Sudanese Arabic personality.

## Features ✨
- **Text Generation:** GPT-4o, GPT-4 and more with built-in Sudanese Arabic prompt.
- **Session Persistence:** Remembers conversations for 5 minutes (via Redis).
- **Token Management:** Uses `tiktoken` to strictly enforce a 6500 token limit per session.
- **Image & Video Generation:** Easy-to-use endpoints for high-quality media.
- **Audio Processing:** Text-to-Speech (TTS) and Transcriptions (Whisper).
- **Admin Panel:** Complete control over API keys, limits, and usage tracking.
- **Developer Portal:** Public registration form with email notifications.

## Tech Stack 🛠️
- **Node.js + Express** (Backend)
- **TypeScript** (Type safety)
- **SQLite** (Persistent storage for keys & requests)
- **Redis** (High-speed temporary session storage)
- **EJS** (Server-side rendering for Admin & Docs)
- **Axios** (API requests to Pollinations)
- **Vercel** (Cloud deployment ready)

## Setup & Installation ⚙️
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file based on the requirements below.
4. Run `npm run dev` for local development.
5. Run `npm run build` for production.

### Environment Variables (`.env`)
```env
PORT=3000
POLLINATIONS_API_KEY=your_pollinations_key
ABSOLUTE_KEY=zoolai_sk_ABS0LUTEKEY
ADMIN_PASSWORD=your_admin_password
REDIS_URL=your_redis_url
SMTP_HOST=smtp.protonmail.ch
SMTP_PORT=587
SMTP_USER=zoolai_api@proton.me
SMTP_PASS=your_smtp_password
```

## Deployment on Vercel 📦
This project is configured for Vercel out-of-the-box.
- `vercel.json` defines the builds and routes.
- Use `npm run vercel-build` during the build step.
- Ensure all environment variables are set in the Vercel dashboard.

## API Usage Examples 📖
Refer to the `/docs` route of your deployed instance for full documentation in Arabic with cURL, Python, and JavaScript examples.

## Changelog 📝
### [1.0.0] - 2025-05-18
- Initial release of the Node.js TypeScript version.
- Implemented core AI endpoints.
- Added Redis-based session management.
- Integrated `tiktoken` for precise token counting.
- Built Admin Panel and Developer Portal.
- Added Vercel support.

---
Developed with ❤️ by KG
