import 'dotenv/config';
import http from 'http';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import mysql from 'mysql2/promise';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PLAYER_TIMEOUT = 15000;
const CHAT_HISTORY_LIMIT = 50;
const MAX_BODY_SIZE = 1_000_000; // ~1MB

let pool;
let schemaReady = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

const server = http.createServer(async (req, res) => {
  setCors(res);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', 'http://localhost');
  const pathname = url.pathname;

  try {
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (method === 'GET' && pathname === '/healthz') {
      sendJson(res, 200, { status: 'ok', dbReady: Boolean(pool) });
      return;
    }

    if (method === 'GET' && pathname === '/status') {
      sendJson(res, 200, { status: 'ok', uptime: process.uptime() });
      return;
    }

    if (method === 'GET' && pathname === '/db-ping') {
      try {
        const dbPool = await ensurePool();
        const [rows] = await dbPool.query('SELECT 1 AS ok');
        sendJson(res, 200, rows[0]);
      } catch (error) {
        sendJson(res, 503, { error: error.message });
      }
      return;
    }

    if (method === 'GET' && (pathname === '/state' || pathname === '/chatlog.txt')) {
      await handleState(res);
      return;
    }

    if (method === 'POST' && pathname === '/update') {
      await handleUpdate(req, res);
      return;
    }

    if (method === 'POST' && pathname === '/chat') {
      await handleChat(req, res);
      return;
    }

    if (method === 'GET') {
      await serveStatic(pathname, res);
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
  } catch (error) {
    console.error(`Error handling ${method} ${pathname}:`, error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'internal_error' });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ listening on ${PORT}`);
  initDb().catch((error) => {
    console.error('DB init error (will keep retrying):', error);
  });
  setInterval(pruneStalePlayers, 5000);
});

async function handleState(res) {
  try {
    const dbPool = await ensureSchemaReady();
    const [players] = await dbPool.execute(
      `SELECT p.id, p.name, p.emoji, c.x, c.y, c.zone, c.city, c.direction, c.lastUpdated
       FROM coordinates c
       INNER JOIN players p ON p.id = c.playerId
       WHERE c.lastUpdated > ?`,
      [Date.now() - PLAYER_TIMEOUT]
    );
    const [chatRows] = await dbPool.execute(
      'SELECT * FROM chatlog ORDER BY timestamp DESC LIMIT ?',
      [CHAT_HISTORY_LIMIT]
    );

    sendJson(res, 200, {
      updatedAt: Date.now(),
      players,
      chat: chatRows.reverse(),
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    sendJson(res, 503, { error: 'db_unavailable', message: error.message });
  }
}

async function handleUpdate(req, res) {
  try {
    const payload = await readJsonBody(req);
    if (typeof payload.id !== 'string') {
      sendJson(res, 400, { error: 'missing_id' });
      return;
    }

    const dbPool = await ensureSchemaReady();
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

    await dbPool.execute(playerSql, [id, name, emoji]);
    await dbPool.execute(coordinatesSql, [id, x, y, zone, city, direction, now]);

    sendJson(res, 200, { status: 'ok' });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      sendJson(res, 413, { error: 'payload_too_large' });
      return;
    }
    if (error instanceof InvalidJsonError) {
      sendJson(res, 400, { error: 'invalid_json' });
      return;
    }
    console.error('Error on /update:', error);
    sendJson(res, 503, { error: 'db_unavailable', message: error.message });
  }
}

async function handleChat(req, res) {
  try {
    const payload = await readJsonBody(req);
    const message = sanitiseMessage(payload.message);
    if (typeof payload.id !== 'string' || !message) {
      sendJson(res, 400, { error: 'invalid_payload' });
      return;
    }

    const dbPool = await ensureSchemaReady();
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

    await dbPool.execute(chatSql, [messageId, playerId, name, message, zone, city, timestamp]);
    const [coordUpdateResult] = await dbPool.execute(
      coordinatesUpdateSql,
      [timestamp, zoneValue, cityValue, playerId]
    );

    if (coordUpdateResult.affectedRows === 0) {
      await dbPool.execute(coordinatesInsertSql, [playerId, zoneValue, cityValue, timestamp]);
    }

    sendJson(res, 200, { status: 'ok' });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      sendJson(res, 413, { error: 'payload_too_large' });
      return;
    }
    if (error instanceof InvalidJsonError) {
      sendJson(res, 400, { error: 'invalid_json' });
      return;
    }
    console.error('Error on /chat:', error);
    sendJson(res, 503, { error: 'db_unavailable', message: error.message });
  }
}

async function serveStatic(pathname, res) {
  try {
    let relative = pathname;
    if (!relative || relative === '/') {
      relative = '/index.html';
    }

    const normalised = path.normalize(relative).replace(/^\.\/+/, '');
    const filePath = path.join(distPath, normalised);
    if (!filePath.startsWith(distPath)) {
      sendJson(res, 403, { error: 'forbidden' });
      return;
    }

    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': getMimeType(filePath),
      'Cache-Control': 'public, max-age=60',
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        const indexHtml = await fs.readFile(indexHtmlPath);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
        });
        res.end(indexHtml);
      } catch (indexError) {
        console.error('Unable to serve index.html:', indexError);
        sendJson(res, 500, { error: 'static_not_available' });
      }
    } else {
      throw error;
    }
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload ?? {});
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

class PayloadTooLargeError extends Error {}
class InvalidJsonError extends Error {}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;

  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_SIZE) {
        reject(new PayloadTooLargeError('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const parsed = raw ? JSON.parse(raw) : {};
        resolve(parsed);
      } catch (error) {
        reject(new InvalidJsonError('Invalid JSON'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}

async function initDb() {
  if (pool) {
    return pool;
  }

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
      console.log(
        '✅ DB connected via',
        socketPath ? socketPath : `${config.host}:${config.port}`
      );
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
  if (!pool) {
    await initDb();
  }

  if (!pool) {
    throw new Error('Database pool is not ready yet.');
  }

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

export default server;
