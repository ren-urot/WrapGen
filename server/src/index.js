// server/src/index.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { createApp } = require('./app');
const { getDb } = require('./db');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

getDb(); // Run migrations on startup

const app = createApp();

const projectsRouter = require('./routes/projects');
const generateRouter = require('./routes/generate');
const templatesRouter = require('./routes/templates');
const exportRouter = require('./routes/export');

app.use('/api/projects', projectsRouter);
app.use('/api/projects/:id/generate', generateRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/export', exportRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`WrapGen API on :${PORT}`));
