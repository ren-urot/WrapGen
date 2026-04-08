// server/src/db.js
const Database = require('better-sqlite3');
const path = require('path');

const DEFAULT_PATH = path.join(__dirname, '../data/wrapgen.db');

let _db = null;

function getDb() {
  if (!_db) {
    const dbPath = process.env.DB_PATH || DEFAULT_PATH;
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    _migrate(_db);
  }
  return _db;
}

// Exposed for tests only
function _resetDb() {
  if (_db) { _db.close(); _db = null; }
}

function _migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      vehicle_id  TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS versions (
      id           TEXT PRIMARY KEY,
      project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      prompt       TEXT NOT NULL,
      logo_url     TEXT NOT NULL,
      ref_url      TEXT,
      artwork_urls TEXT NOT NULL,
      mockup_urls  TEXT NOT NULL,
      created_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exports (
      id           TEXT PRIMARY KEY,
      version_id   TEXT NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
      status       TEXT NOT NULL DEFAULT 'pending',
      files        TEXT,
      specs        TEXT,
      created_at   INTEGER NOT NULL
    );
  `);
}

module.exports = { getDb, _resetDb };
