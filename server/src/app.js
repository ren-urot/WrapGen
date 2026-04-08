// server/src/app.js
const express = require('express');
const cors = require('cors');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = { createApp };
