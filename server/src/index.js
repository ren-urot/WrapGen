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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`WrapGen API on :${PORT}`));
