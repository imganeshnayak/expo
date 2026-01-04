# Utopia Backend

A Node.js/Express backend for the Utopia mobile gaming app.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose 9
- **Auth:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS whitelist, Rate Limiting

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `CORS_ORIGINS` | No | Allowed origins (comma-separated) |

## API Routes

| Route | Description |
|-------|-------------|
| `/api/auth` | Authentication (register, login, me) |
| `/api/wallet` | Wallet operations |
| `/api/game` | Game spawns, collection |
| `/api/deals` | Deals CRUD |
| `/api/friends` | Friend system |
| `/api/leaderboard` | Rankings |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Security Features

- ✅ Helmet security headers
- ✅ CORS whitelist (configurable)
- ✅ Rate limiting (1000/min general, 20/min auth)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Global error handler (no stack leaks in prod)
