// server/tests/export.test.js
const request = require('supertest');
const path = require('path');

process.env.DB_PATH = ':memory:';
process.env.TEMPLATES_DIR = path.join(__dirname, 'fixtures/templates');

const { resetDb, seedProject, seedVersion } = require('./helpers');
const { createApp } = require('../src/app');
const exportRouter = require('../src/routes/export');
const projectsRouter = require('../src/routes/projects');
const { _setExportVersionForTesting } = require('../src/services/exporter');

const mockExportResult = {
  files: ['https://r2.example.com/export.png'],
  specs: { dpi: 300, bleed: '3mm', colorProfile: 'CMYK' },
};

let app;
beforeEach(() => {
  resetDb();
  app = createApp();
  app.use('/api/projects', projectsRouter);
  app.use('/api/export', exportRouter);
  _setExportVersionForTesting(() => Promise.resolve(mockExportResult));
});

afterEach(() => {
  _setExportVersionForTesting(null);
});

describe('POST /api/export/:versionId', () => {
  it('creates export record and returns 202', async () => {
    const p = seedProject();
    const v = seedVersion(p.id);
    const res = await request(app).post(`/api/export/${v.id}`);
    expect(res.status).toBe(202);
    expect(res.body.exportId).toBeDefined();
    expect(res.body.status).toBe('pending');
  });

  it('returns existing export if already triggered', async () => {
    const p = seedProject();
    const v = seedVersion(p.id);
    await request(app).post(`/api/export/${v.id}`);
    const res = await request(app).post(`/api/export/${v.id}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for unknown version', async () => {
    const res = await request(app).post('/api/export/ghost-version');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/export/:versionId', () => {
  it('returns 404 when no export triggered', async () => {
    const p = seedProject();
    const v = seedVersion(p.id);
    const res = await request(app).get(`/api/export/${v.id}`);
    expect(res.status).toBe(404);
  });

  it('returns export status after trigger', async () => {
    const p = seedProject();
    const v = seedVersion(p.id);
    await request(app).post(`/api/export/${v.id}`);
    // Wait briefly for async export to complete in test
    await new Promise((r) => setTimeout(r, 50));
    const res = await request(app).get(`/api/export/${v.id}`);
    expect(res.status).toBe(200);
    expect(['pending', 'ready']).toContain(res.body.status);
  });
});
