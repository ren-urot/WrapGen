// server/tests/db.test.js
// Force in-memory DB for tests
process.env.DB_PATH = ':memory:';

const { getDb, _resetDb } = require('../src/db');

describe('db migrations', () => {
  beforeEach(() => _resetDb());

  it('creates projects table', () => {
    const db = getDb();
    const row = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'"
    ).get();
    expect(row).toBeDefined();
    expect(row.name).toBe('projects');
  });

  it('creates versions table', () => {
    const db = getDb();
    const row = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='versions'"
    ).get();
    expect(row).toBeDefined();
  });

  it('creates exports table', () => {
    const db = getDb();
    const row = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='exports'"
    ).get();
    expect(row).toBeDefined();
  });

  it('inserts and retrieves a project', () => {
    const db = getDb();
    db.prepare(
      'INSERT INTO projects (id, name, vehicle_id, created_at) VALUES (?, ?, ?, ?)'
    ).run('proj-1', 'Test Project', 'transit-van', Date.now());

    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get('proj-1');
    expect(row.name).toBe('Test Project');
    expect(row.vehicle_id).toBe('transit-van');
  });
});
