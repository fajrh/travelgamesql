import 'dotenv/config'; // Load .env file
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PLAYER_TIMEOUT = 15000; // 15 seconds
const CHAT_HISTORY_LIMIT = 50;

// --- Database Configuration ---
const dbConfig = {
  // For local development via Public IP, set DB_HOST.
  // For Cloud Run, set DB_SOCKET_PATH and the instance connection name.
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // Must be set as an environment variable
  database: process.env.DB_DATABASE || 'travelgame',
  socketPath: process.env.DB_SOCKET_PATH,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Prioritize socketPath for Cloud Run, as it's more secure and standard.
if (dbConfig.socketPath) {
    delete dbConfig.host;
    delete dbConfig.port;
}

let dbPool;

async function getDbPool() {
  if (!dbPool) {
    try {
      dbPool = mysql.createPool(dbConfig);
      await initializeDatabase(dbPool);
    } catch (error) {
      console.error('❌ Could not connect to the database:', error.message);
      // Exit if we can't connect, as the app is non-functional.
      process.exit(1);
    }
  }
  return dbPool;
}

async function initializeDatabase(pool) {
  console.log('🔄 Initializing database...');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS players (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(24) NOT NULL,
      emoji VARCHAR(16),
      x INT,
      y INT,
      zone VARCHAR(32),
      city VARCHAR(64),
      direction VARCHAR(32),
      lastUpdated BIGINT NOT NULL
    );
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS chatlog (
      id VARCHAR(36) PRIMARY KEY,
      playerId VARCHAR(36) NOT NULL,
      name VARCHAR(24) NOT NULL,
      message VARCHAR(280) NOT NULL,
      zone VARCHAR(32),
      city VARCHAR(64),
      timestamp BIGINT NOT NULL,
      INDEX(timestamp)
    );
  `);
  console.log('✅ Database tables are ready.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};


const server = createServer(async (req, res) => {
  if (!req.url) {
    writeJson(res, 400, { error: 'bad_request', message: 'Missing request URL.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    writeOptions(res);
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const pool = await getDbPool(); // Ensure pool is ready for all requests

  if (pathname === '/status') {
    writeJson(res, 200, { status: 'ok', uptime: process.uptime() });
    return;
  }

  if (pathname === '/healthz') {
     try {
        const [rows] = await pool.execute('SELECT COUNT(*) as playerCount FROM players');
        writeJson(res, 200, { status: 'ok', players: rows[0].playerCount });
     } catch (err) {
        writeJson(res, 500, { status: 'error', message: 'Database query failed.' });
     }
    return;
  }

  if (pathname === '/state' || pathname === '/chatlog.txt') {
    try {
        const [players] = await pool.execute('SELECT * FROM players WHERE lastUpdated > ?', [Date.now() - PLAYER_TIMEOUT]);
        const [chatRows] = await pool.execute('SELECT * FROM chatlog ORDER BY timestamp DESC LIMIT ?', [CHAT_HISTORY_LIMIT]);
        
        const state = {
            updatedAt: Date.now(),
            players,
            chat: chatRows.reverse() // Reverse to show oldest first
        };
        writeJson(res, 200, state);
    } catch(err) {
        console.error("Error fetching state:", err);
        writeJson(res, 500, { error: 'db_error', message: 'Failed to fetch game state.' });
    }
    return;
  }

  if (pathname === '/update' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload || typeof payload.id !== 'string') {
        writeJson(res, 400, { error: 'missing_id' });
        return;
      }

      const now = Date.now();
      const { id, emoji, zone, city, direction } = payload;
      const name = sanitiseName(payload.name);
      const x = clampNumber(payload.x, -5000, 5000, 0);
      const y = clampNumber(payload.y, -5000, 5000, 0);

      const sql = `
        INSERT INTO players (id, name, emoji, x, y, zone, city, direction, lastUpdated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name), emoji = VALUES(emoji), x = VALUES(x), y = VALUES(y), zone = VALUES(zone), city = VALUES(city), direction = VALUES(direction), lastUpdated = VALUES(lastUpdated);
      `;

      await pool.execute(sql, [id, name, emoji, x, y, zone, city, direction, now]);
      writeJson(res, 200, { status: 'ok' });
    } catch (error) {
        console.error("Error on /update:", error);
        writeJson(res, 400, { error: 'invalid_request', message: error.message });
    }
    return;
  }

  if (pathname === '/chat' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const message = sanitiseMessage(payload.message);
      if (!payload || typeof payload.id !== 'string' || !message) {
        writeJson(res, 400, { error: 'invalid_payload' });
        return;
      }
      
      const { id: playerId, zone, city } = payload;
      const name = sanitiseName(payload.name);
      const timestamp = Date.now();
      const messageId = randomUUID();

      const chatSql = `INSERT INTO chatlog (id, playerId, name, message, zone, city, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?);`;
      const playerUpdateSql = `UPDATE players SET lastUpdated = ? WHERE id = ?;`;

      // Run both queries
      await pool.execute(chatSql, [messageId, playerId, name, message, zone, city, timestamp]);
      await pool.execute(playerUpdateSql, [timestamp, playerId]);
      
      writeJson(res, 200, { status: 'ok' });
    } catch (error) {
      console.error("Error on /chat:", error);
      writeJson(res, 400, { error: 'invalid_request', message: error.message });
    }
    return;
  }

  // --- Static asset handling ---
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(distPath, requestedPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(distPath, 'index.html'), (err, indexContent) => {
          if (err) {
            writeJson(res, 500, { error: 'internal_error', message: 'Could not read index.html' });
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        writeJson(res, 500, { error: 'internal_error', message: `Server error: ${error.code}` });
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

async function startServer() {
    await getDbPool(); // Wait for initial DB connection
    server.listen(PORT, () => {
        console.log(`✅ Server listening on port ${PORT}`);
    });
    setInterval(pruneStalePlayers, 5000);
}

startServer();


// --- Helper functions ---

async function pruneStalePlayers() {
    if (!dbPool) return;
    try {
        const [result] = await dbPool.execute('DELETE FROM players WHERE lastUpdated < ?', [Date.now() - PLAYER_TIMEOUT]);
        if (result.affectedRows > 0) {
            console.log(`Pruned ${result.affectedRows} stale players.`);
        }
    } catch(err) {
        console.error("Error pruning players:", err);
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

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => reject(error));
  });
}

function writeJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  });
  res.end(body);
}

function writeOptions(res) {
  res.writeHead(204, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-length': '0',
  });
  res.end();
}