// server/server.js
import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import mysql from 'mysql2/promise';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PLAYER_TIMEOUT = 15000;
const CHAT_HISTORY_LIMIT = 50;

console.log('Booting server.js NODE_ENV=%s PORT=%s', process.env.NODE_ENV, process.env.PORT);

const app = express();
let pool;
let schemaReady = false;

// --- CORS + JSON ---
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.header('access-control-allow-origin', '*');
  res.header('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.header('access-control-allow-headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// --- Health endpoints ---
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', dbReady: Boolean(pool) });
});

app.get('/status', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/db-ping', async (_req, res) => {
  try {
    const p = await ensurePool();
    const [rows] = await p.query('SELECT 1 AS ok');
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

// --- API: state ---
app.get(['/state', '/chatlog.txt'], async (_req, res) => {
  try {
    const p = await ensureSchemaReady();
    const [players] = await p.execute(
      `SELECT p.id, p.name, p.emoji, c.x, c.y, c.zone, c.city, c.direction, c.lastUpdated
       FROM coordinates c
       INNER JOIN players p ON p.id = c.playerId
       WHERE c.lastUpdated > ?`,
      [Date.now() - PLAYER_TIMEOUT]
    );
    const [chatRows] = await p.execute(
      'SELECT * FROM chatlog ORDER BY timestamp DESC LIMIT ?',
      [CHAT_HISTORY_LIMIT]
    );

    res.status(200).json({
      updatedAt: Date.now(),
      players,
      chat: chatRows.reverse(),
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(503).json({ error: 'db_unavailable', message: error.message });
  }
});

// --- API: update coordinates ---
app.post('/update', async (req, res) => {
  try {
    const payload = req.body ?? {};
    if (typeof payload.id !== 'string') {
      res.status(400).json({ error: 'missing_id' });
      return;
    }

    const p = await ensureSchemaReady();
    const now = Date.now();
    const { id, emoji, zone, city, direction } = payload;
    const name = sanitiseName(payload.name);
    const x = clampNumber(payload.x, -5000, 5000, 0);
    const y = clampNumber(payload.y, -5000, 5000, 0);

    const playerSql = `
      INSERT INTO players (id, name, emoji)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        emoji = VALUES(emoji);
    `;

    const coordinatesSql = `
      INSERT INTO coordinates (playerId, x, y, zone, city, direction, lastUpdated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        x = VALUES(x),
        y = VALUES(y),
        zone = VALUES(zone),
        city = VALUES(city),
        direction = VALUES(direction),
        lastUpdated = VALUES(lastUpdated);
    `;

    await p.execute(playerSql, [id, name, emoji]);
    await p.execute(coordinatesSql, [id, x, y, zone, city, direction, now]);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error on /update:', error);
    res.status(503).json({ error: 'db_unavailable', message: error.message });
  }
});

// --- API: chat ---
app.post('/chat', async (req, res) => {
  try {
    const payload = req.body ?? {};
    const message = sanitiseMessage(payload.message);
    if (typeof payload.id !== 'string' || !message) {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }

    const p = await ensureSchemaReady();
    const { id: playerId, zone, city } = payload;
    const name = sanitiseName(payload.name);
    const timestamp = Date.now();
    const messageId = randomUUID();

    const chatSql = `
      INSERT INTO chatlog (id, playerId, name, message, zone, city, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    const coordinatesUpdateSql = `
      UPDATE coordinates
      SET lastUpdated = ?, zone = COALESCE(?, zone), city = COALESCE(?, city)
      WHERE playerId = ?;
    `;

    const coordinatesInsertSql = `
      INSERT INTO coordinates (playerId, x, y, zone, city, direction, lastUpdated)
      VALUES (?, 0, 0, ?, ?, 'right', ?)
      ON DUPLICATE KEY UPDATE
        zone = VALUES(zone),
        city = VALUES(city),
        lastUpdated = VALUES(lastUpdated);
    `;

    const zoneValue = typeof zone === 'string' ? zone : null;
    const cityValue = typeof city === 'string' ? city : null;

    await p.execute(chatSql, [messageId, playerId, name, message, zone, city, timestamp]);
    const [coordUpdateResult] = await p.execute(
      coordinatesUpdateSql, [timestamp, zoneValue, cityValue, playerId]
    );
    if (coordUpdateResult.affectedRows === 0) {
      await p.execute(coordinatesInsertSql, [playerId, zoneValue, cityValue, timestamp]);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error on /chat:', error);
    res.status(503).json({ error: 'db_unavailable', message: error.message });
  }
});

// --- Static files ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(indexHtmlPath, (error) => {
    if (error) res.status(500).send('Unable to render application shell.');
  });
});

// --- Start HTTP server FIRST (Cloud Run requirement) ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ listening on ${PORT}`);
  initDb().catch((error) => {
    console.error('DB init error (will keep retrying):', error);
  });
  setInterval(pruneStalePlayers, 5000);
});

// ================== DB helpers ==================
async function initDb() {
  if (pool) return pool;

  const socketPath = process.env.INSTANCE_CONNECTION_NAME
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    : process.env.DB_SOCKET_PATH;

  const config = {
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'travelgame',
    waitForConnections: true,
    connectionLimit: 5,
  };

  if (socketPath) {
    config.socketPath = socketPath;
  } else {
    config.host = process.env.DB_HOST || '127.0.0.1';
    config.port = Number.parseInt(process.env.DB_PORT ?? '3306', 10);
  }

  const candidatePool = mysql.createPool(config);

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      await candidatePool.query('SELECT 1');
      console.log('✅ DB connected via', socketPath ? socketPath : `${config.host}:${config.port}`);
      pool = candidatePool;
      return pool;
    } catch (error) {
      console.error(`DB attempt ${attempt} failed: ${error.code || error.message}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  console.warn('DB not ready yet — server will keep running; API calls will retry.');
  pool = candidatePool;
  return pool;
}

async function ensurePool() {
  if (!pool) await initDb();
  if (!pool) throw new Error('Database pool is not ready yet.');
  return pool;
}

async function ensureSchemaReady() {
  const poolInstance = await ensurePool();
  if (!schemaReady) {
    try {
      await initializeDatabase(poolInstance);
      schemaReady = true;
    } catch (error) {
      schemaReady = false;
      throw error;
    }
  }
  return poolInstance;
}

async function initializeDatabase(poolInstance) {
  console.log('🔄 Initializing database...');
  await poolInstance.execute(`
    CREATE TABLE IF NOT EXISTS players (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(24) NOT NULL,
      emoji VARCHAR(16)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await poolInstance.execute(`
    CREATE TABLE IF NOT EXISTS coordinates (
      playerId VARCHAR(36) PRIMARY KEY,
      x INT,
      y INT,
      zone VARCHAR(32),
      city VARCHAR(64),
      direction VARCHAR(32),
      lastUpdated BIGINT NOT NULL,
      CONSTRAINT fk_coordinates_player FOREIGN KEY (playerId)
        REFERENCES players(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await poolInstance.execute(`
    CREATE TABLE IF NOT EXISTS chatlog (
      id VARCHAR(36) PRIMARY KEY,
      playerId VARCHAR(36) NOT NULL,
      name VARCHAR(24) NOT NULL,
      message VARCHAR(280) NOT NULL,
      zone VARCHAR(32),
      city VARCHAR(64),
      timestamp BIGINT NOT NULL,
      INDEX(timestamp),
      CONSTRAINT fk_chatlog_player FOREIGN KEY (playerId)
        REFERENCES players(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Database tables are ready.');
}

async function pruneStalePlayers() {
  try {
    const poolInstance = await ensureSchemaReady();
    const threshold = Date.now() - PLAYER_TIMEOUT;

    const [coordResult] = await poolInstance.execute(
      'DELETE FROM coordinates WHERE lastUpdated < ?',
      [threshold]
    );
    if (coordResult.affectedRows > 0) {
      console.log(`Pruned ${coordResult.affectedRows} stale player coordinates.`);
    }

    await poolInstance.execute(`
      DELETE p FROM players p
      LEFT JOIN coordinates c ON p.id = c.playerId
      WHERE c.playerId IS NULL
    `);
  } catch (error) {
    console.error('Error pruning players:', error.message);
  }
}

// ============== utils ==============
function sanitiseName(name) {
  if (typeof name !== 'string') return 'Traveler';
  return name.trim().replace(/\s+/g, ' ').slice(0, 24) || 'Traveler';
}

function sanitiseMessage(message) {
  if (typeof message !== 'string') return '';
  return message.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 280);
}

function clampNumber(value, min, max, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}
