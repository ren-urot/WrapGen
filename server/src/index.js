// server/src/index.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { createApp } = require('./app');
const { getDb } = require('./db');
const { ensurePlaceholders } = require('./templates');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

getDb(); // Run migrations on startup

const app = createApp();

const PORT = process.env.PORT || 3001;
ensurePlaceholders()
  .catch((e) => console.warn('Template placeholder generation failed:', e.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`WrapGen API on :${PORT}`));
  });
