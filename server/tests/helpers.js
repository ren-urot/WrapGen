// server/tests/helpers.js
// vi, describe, it, expect, etc. are available as globals via vitest.config.mjs (globals: true)
// No import needed — requiring vitest directly fails in CommonJS packages

process.env.DB_PATH = ':memory:';
process.env.TEMPLATES_DIR = require('path').join(__dirname, 'fixtures/templates');

const { getDb, _resetDb } = require('../src/db');

function resetDb() {
  _resetDb();
}

function seedProject(overrides = {}) {
  const db = getDb();
  const project = {
    id: 'proj-test',
    name: 'Test Project',
    vehicle_id: 'transit-van',
    created_at: Date.now(),
    ...overrides,
  };
  db.prepare(
    'INSERT INTO projects (id, name, vehicle_id, created_at) VALUES (?, ?, ?, ?)'
  ).run(project.id, project.name, project.vehicle_id, project.created_at);
  return project;
}

function seedVersion(projectId, overrides = {}) {
  const db = getDb();
  const version = {
    id: 'ver-test',
    project_id: projectId,
    prompt: 'test prompt',
    logo_url: 'https://r2.example.com/logo.png',
    ref_url: null,
    artwork_urls: JSON.stringify(['https://r2.example.com/art1.jpg', 'https://r2.example.com/art2.jpg']),
    mockup_urls: JSON.stringify(['https://r2.example.com/mock1.jpg', 'https://r2.example.com/mock2.jpg']),
    created_at: Date.now(),
    ...overrides,
  };
  db.prepare(`
    INSERT INTO versions (id, project_id, prompt, logo_url, ref_url, artwork_urls, mockup_urls, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    version.id, version.project_id, version.prompt,
    version.logo_url, version.ref_url,
    version.artwork_urls, version.mockup_urls, version.created_at
  );
  return version;
}

module.exports = { resetDb, seedProject, seedVersion };
