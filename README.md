# be-wordle

A REST API backend for a Wordle-style word-guessing game. It manages the word library, daily challenges, player authentication, game statistics, and leaderboards.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript 5 |
| Framework | Express 5 |
| Database | MongoDB (Mongoose 9) |
| Cache | Redis (ioredis) |
| Auth | JWT Bearer tokens |
| Email | Brevo transactional API |
| Validation | Joi |
| Logging | Winston + Morgan |
| Container | Docker (multi-stage build) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance
- Redis instance
- Brevo account (for transactional emails)
- Yarn 4

### Installation

```bash
git clone https://github.com/your-username/be-wordle.git
cd be-wordle
yarn install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` / `production` (default: `development`) |
| `PORT` | No | HTTP port (default: `8000`) |
| `MONGODB_URI` | **Yes** | Full MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default: `7d`) |
| `DAILY_RESET_KEY` | **Yes** | Secret key for the `/daily/reset` endpoint |
| `CLIENT_URL` | No | Frontend base URL for password reset links |
| `BREVO_API_KEY` | **Yes** | Brevo transactional email API key (`xkeysib-...`) |
| `EMAIL_FROM_ADDRESS` | **Yes** | Verified sender email address in Brevo |
| `EMAIL_FROM_NAME` | No | Display name in the From field (default: `Wordle App`) |
| `REDIS_URL` | **Yes** | Redis connection URL |

### Running

```bash
# Development (hot-reload)
yarn dev

# Production build
yarn build
yarn start
```

---

## Docker

```bash
# Build the image
docker build -t be-wordle .

# Run the container
docker run -p 8000:8000 --env-file .env be-wordle
```

The Dockerfile uses a multi-stage build — TypeScript is compiled in the builder stage, and the production image contains only the compiled output and runtime dependencies. The app runs as a non-root user (`nodejs`, UID 1001).

---

## API Reference

All endpoints are prefixed with `/api/v1`.

A health check endpoint is available at `GET /health` (returns `{ "status": "ok" }`).

### Authentication — `/api/v1/auth`

> All auth routes are rate-limited to 10 requests per 15 minutes.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | — | Login with email + password; returns a JWT |
| `POST` | `/clerk` | — | Authenticate via Clerk (OAuth/SSO) |
| `POST` | `/forgot-password` | — | Send a password reset link |
| `POST` | `/reset-password` | — | Reset password using a token |
| `POST` | `/is-user-name-taken` | — | Check if a username is available |
| `POST` | `/is-user-email-taken` | — | Check if an email is registered |
| `GET` | `/me` | 🔒 JWT | Get the authenticated user's profile |

### Registration (OTP) — `/api/v1/otp`

> User registration uses an OTP email flow. All OTP routes are rate-limited to 10 requests per 15 minutes.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/send-otp` | — | Send a one-time password to an email |
| `POST` | `/verify-otp` | — | Verify OTP and complete registration |
| `POST` | `/resend-otp` | — | Resend the OTP |

### Word Library — `/api/v1/wordle`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Get all words |
| `GET` | `/random` | — | Get a random word |
| `GET` | `/daily` | — | Get today's daily word |
| `GET` | `/difficulty/:difficulty` | — | Get words filtered by difficulty |
| `GET` | `/category/:category` | — | Get words filtered by category |
| `GET` | `/:id` | — | Get a word by ID |
| `POST` | `/` | 🔒 JWT | Add a new word |
| `PATCH` | `/:id` | 🔒 JWT | Update a word |
| `PATCH` | `/toggle/:id` | 🔒 JWT | Toggle a word's active/inactive status |
| `PATCH` | `/played/:id` | 🔒 JWT | Increment a word's play count |
| `PATCH` | `/stats/:id` | 🔒 JWT | Update per-word stats |
| `DELETE` | `/:id` | 🔒 JWT | Delete a word |

### Daily Challenge — `/api/v1/daily`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Optional JWT | Get today's daily word. Authenticated users also receive an `alreadyPlayed` flag |
| `POST` | `/played` | 🔒 JWT | Mark today's daily as played. Returns `409` if already played |
| `POST` | `/create` | — | Assign a word to a specific date (`{ wordId, date }`) |
| `POST` | `/reset` | — | Reset `dailyPlayedToday` for all users (requires `DAILY_RESET_KEY` in body) |

### Stats — `/api/v1/stats`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/update` | 🔒 JWT | Update stats after a game session |
| `POST` | `/infinite/session` | 🔒 JWT | Update stats for an infinite-mode session |
| `POST` | `/batch-update` | 🔒 JWT | Batch-update stats for multiple sessions |
| `GET` | `/` | 🔒 JWT | Get all stats for the authenticated user |
| `GET` | `/:gameMode` | 🔒 JWT | Get stats for a specific game mode |
| `DELETE` | `/:gameMode` | 🔒 JWT | Reset stats for a specific game mode |
| `GET` | `/user/:userId` | — | Get public stats for any user |

### Leaderboard — `/api/v1/leaderboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Get the leaderboard (supports query params for filtering) |
| `POST` | `/snapshot` | — | Trigger a leaderboard snapshot |

### App Version — `/api/v1/app-version`

| Method | Path | Description |
|---|---|---|
| `GET` | `/required` | Returns the minimum required app version |

---

## Project Structure

```
src/
├── app.ts                        # Express app setup
├── server.ts                     # HTTP server entry point
├── config/
│   ├── env.ts                    # Centralised env config
│   ├── db.ts                     # MongoDB connection
│   └── redis.ts                  # Redis client (singleton)
├── middlewares/
│   ├── auth.middleware.ts        # JWT Bearer verification
│   ├── error.middleware.ts       # Global error handler
│   ├── rateLimiter.middleware.ts # Rate limiting (global + auth)
│   ├── validate.middleware.ts    # Joi body validation wrapper
│   └── appVersion.middlewate.ts  # App version gate
├── modules/                      # Feature modules
│   ├── auth/
│   ├── otp/
│   ├── wordles/
│   ├── daily/
│   ├── stats/
│   ├── leaderboard/
│   └── appVersion/
└── routes/v1/                    # Route definitions
```

Each module follows a consistent structure: `model → service → controller → validation → route → index (barrel export)`.

---

## Scripts

| Script | Description |
|---|---|
| `yarn dev` | Start dev server with hot-reload |
| `yarn build` | Compile TypeScript to `dist/` |
| `yarn start` | Run the compiled production build |
| `yarn lint` | Lint all TypeScript source files |
| `yarn lint:fix` | Auto-fix lint issues |
| `yarn format` | Format source files with Prettier |
| `yarn module:create` | Scaffold a new feature module |

---

## Security

- **Helmet** sets security-related HTTP headers.
- **Rate limiting** — global cap of 100 req/15 min per IP; auth and OTP routes capped at 10 req/15 min.
- **HPP** prevents HTTP parameter pollution.
- **JWT** tokens are verified on every protected route via `Authorization: Bearer <token>`.
- **Joi** validates all request bodies and query parameters before they reach controllers.
- **Docker** runs the app as a non-root user.

---

## License

ISC
