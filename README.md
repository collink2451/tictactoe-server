# Tic-Tac-Toe Server

Node.js/Express backend for the Lewis Tic-Tac-Toe game. Handles GitHub OAuth authentication and a persistent leaderboard stored in MongoDB. Pairs with the [tictactoe-client](../tictactoe-client) frontend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth` | Redirect to GitHub OAuth login |
| `GET` | `/api/auth/callback` | GitHub OAuth callback |
| `POST` | `/api/scoreboard` | Increment the authenticated user's score (requires auth) |
| `GET` | `/api/scoreboard` | Get the full leaderboard |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Auth:** GitHub OAuth via Passport.js (session-based)
- **Database:** MongoDB (via Mongoose)

## Setup

### Requirements

- Node.js 18+
- MongoDB instance
- GitHub OAuth app ([GitHub Developer Settings](https://github.com/settings/developers))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000

# GitHub OAuth
OAUTH_CLIENT_ID=your_github_oauth_client_id
OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback

# Session
SECRET_KEY=your_random_session_secret
```

3. Start the server:

```bash
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
