# Travel Game

A multiplayer travel and exploration game with a persistent state managed by a MySQL database.

## Database Configuration

This project requires a MySQL database. The server connects to it using environment variables.

### For Google Cloud Run Deployment (Recommended)

When you deploy, set these variables in your **Cloud Run service's "Variables & Secrets" tab**. Do **not** commit a `.env` file.

-   `DB_SOCKET_PATH`: The instance connection name (e.g., `/cloudsql/your-project:region:instance-name`).
-   `DB_USER`: Your database user (e.g., `root`).
-   `DB_PASSWORD`: Your database password (add this as a "Secret" in Cloud Run).
-   `DB_DATABASE`: The name of your database (e.g., `travelgame`).

### For Local Development

To run the server on your own computer, you will connect to your Cloud SQL instance using its Public IP.

1.  **Copy the template**: In your terminal, make a copy of the example file.
    ```bash
    cp .env.example .env
    ```
2.  **Edit `.env`**: Open the new `.env` file and fill in the details for your database.
    -   `DB_HOST`: Your Cloud SQL instance's Public IP address.
    -   `DB_PASSWORD`: Your database password.
    -   *Ensure you have authorized your computer's IP address to connect to your Cloud SQL instance in the Google Cloud console.*

The server will automatically load these variables when you run `npm start`.

## Run Locally

**This project requires Node.js to run.**

### 1. Install Dependencies

First, open your terminal in the project's root directory and install the necessary packages. You only need to do this once.

```bash
npm install
```

### 2. Build the Game Client

Next, compile the game's TypeScript code into plain JavaScript that browsers can understand.

```bash
npm run build
```

You only need to run this command again if you make changes to the game's source code (`index.tsx`).

### 3. Start the Server

Before starting, ensure your `.env` file is created and configured as described above. Then, start the server.

```bash
npm start
```

You should see messages like `✅ Database tables are ready.` and `✅ Server listening on port 8080`.

### 4. Play the Game

Open your web browser and navigate to:

**http://localhost:8080**