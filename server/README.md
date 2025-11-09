# Multiplayer Server

This directory contains the lightweight Node.js polling server that keeps the
travel game in sync across players. The server uses a MySQL database to persist
all player locations and chat history.

## Running locally

```bash
npm install
npm start
```

The server listens on the port in the `PORT` environment variable (defaults to
`8080`). When deploying to services such as Google Cloud Run or App Engine, the
provided `npm start` script satisfies their expectations for a startup command.

## HTTP endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | `GET` | Summary with current lobby counts and available endpoints. |
| `/healthz` | `GET` | Liveness probe that reports the number of tracked players. |
| `/state` | `GET` | Returns a JSON payload with the current players and chat log from the database. |
| `/update` | `POST` | Accepts the player's latest position, city, emoji, etc., and updates the database. |
| `/chat` | `POST` | Adds a chat entry to the database for the sender's current city. |

All responses include permissive CORS headers, and the server will also reply to
`OPTIONS` requests for observability tooling.

## State persistence

The server is stateless and relies entirely on a MySQL database with three main tables: `players`, `coordinates`, and `chatlog`.

- Player identity, display name, and emoji are stored in the `players` table.
- The latest in-world position, zone, city, facing direction, and heartbeat timestamp live in the `coordinates` table.
- Chat message ID, author, timestamp, city, and the sanitised text are stored in the `chatlog` table.

Stale players that stop checking in are automatically removed from the `coordinates` table and their `players` entry is cleaned up after 15 seconds of inactivity.

## Polling workflow

Clients follow a simple loop:

1. POST `/update` with their latest position, emoji, and city information.
2. Fetch `/state` to receive the complete snapshot of players and chat for their city.
3. POST `/chat` whenever the user submits a new message.

This approach keeps deployment friction low while supporting a persistent, shared
multiplayer experience.
