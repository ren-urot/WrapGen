// server/src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const projectsRouter = require('./routes/projects');
const generateRouter = require('./routes/generate');
const templatesRouter = require('./routes/templates');
const exportRouter = require('./routes/export');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, '../../data/uploads')));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/projects', projectsRouter);
  app.use('/api/projects/:id/generate', generateRouter);
  app.use('/api/templates', templatesRouter);
  app.use('/api/export', exportRouter);

  return app;
}

module.exports = { createApp };
