# Utopia Frontend

Expo-based mobile app for the Utopia gaming ecosystem.

## Tech Stack

- **Framework:** Expo 54 / React Native 0.81
- **Navigation:** Expo Router 6
- **State:** Zustand with AsyncStorage persistence
- **UI:** Custom components + Lucide icons

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npm run dev

# Run on Android
npm run android

# Run on iOS
npm run ios

# Type check
npm run typecheck
```

## Project Structure

```
frontend/
├── app/                 # Expo Router screens
│   ├── (tabs)/          # Tab navigation
│   ├── arena/           # Battle screens
│   └── auth/            # Login/Register
├── components/          # Reusable components
│   ├── game/            # Game-specific
│   └── ui/              # Common UI components
├── services/            # API + business logic
├── store/               # Zustand stores
└── __tests__/           # Jest tests
```

## Key Features

- 🎮 Arena battles with Boss Room integration
- 📍 Map-based creature catching
- 💰 Wallet and rewards system
- 🏆 Leaderboards and rankings
- 🔥 Daily streak system

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL |

## Testing

```bash
# Run tests (when configured)
npm test
```
