import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import mysql from 'mysql2/promise';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PLAYER_TIMEOUT = 15000;
const CHAT_HISTORY_LIMIT = 50;

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
    co
