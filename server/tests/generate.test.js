// server/tests/generate.test.js
const request = require('supertest');
const path = require('path');

process.env.DB_PATH = ':memory:';
process.env.TEMPLATES_DIR = path.join(__dirname, 'fixtures/templates');

const { resetDb, seedProject } = require('./helpers');
const { createApp } = require('../src/app');
const projectsRouter = require('../src/routes/projects');
const generateRouter = require('../src/routes/generate');
const { _setClientForTesting } = require('../src/storage');
const { _setGenerateArtworkForTesting } = require('../src/services/fal');
const { _setCompositeForTesting } = require('../src/services/compositor');

let app;
beforeEach(() => {
  resetDb();
  app = createApp();
  app.use('/api/projects', projectsRouter);
  app.use('/api/projects/:id/generate', generateRouter);

  _setClientForTesting({ send: vi.fn().mockResolvedValue({}) });
  _setGenerateArtworkForTesting(vi.fn().mockResolvedValue([Buffer.from('art1'), Buffer.from('art2')]));
  _setCompositeForTesting(vi.fn().mockResolvedValue(Buffer.from('mockup')));
});

afterEach(() => {
  _setClientForTesting(null);
  _setGenerateArtworkForTesting(null);
  _setCompositeForTesting(null);
});

describe('POST /api/projects/:id/generate', () => {
  it('returns 201 with versionId and mockupUrls', async () => {
    const p = seedProject();
    const res = await request(app)
      .post(`/api/projects/${p.id}/generate`)
      .field('prompt', 'blue and white plumbing van')
      .attach('logo', Buffer.from('fake-png'), { filename: 'logo.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.versionId).toBeDefined();
    expect(Array.isArray(res.body.mockupUrls)).toBe(true);
    expect(res.body.mockupUrls.length).toBe(2);
  });

  it('returns 400 when prompt is missing', async () => {
    const p = seedProject();
    const res = await request(app)
      .post(`/api/projects/${p.id}/generate`)
      .attach('logo', Buffer.from('fake'), { filename: 'logo.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/prompt/);
  });

  it('returns 400 when logo is missing', async () => {
    const p = seedProject();
    const res = await request(app)
      .post(`/api/projects/${p.id}/generate`)
      .field('prompt', 'test prompt');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/logo/);
  });

  it('returns 404 for unknown project', async () => {
    const res = await request(app)
      .post('/api/projects/ghost/generate')
      .field('prompt', 'test')
      .attach('logo', Buffer.from('x'), { filename: 'l.png', contentType: 'image/png' });
    expect(res.status).toBe(404);
  });

  it('persists version to DB', async () => {
    const { getDb } = require('../src/db');
    const p = seedProject();
    await request(app)
      .post(`/api/projects/${p.id}/generate`)
      .field('prompt', 'bold red truck')
      .attach('logo', Buffer.from('fake'), { filename: 'logo.png', contentType: 'image/png' });

    const version = getDb()
      .prepare('SELECT * FROM versions WHERE project_id = ?')
      .get(p.id);
    expect(version).toBeDefined();
    expect(version.prompt).toBe('bold red truck');
    const mockupUrls = JSON.parse(version.mockup_urls);
    expect(mockupUrls.length).toBe(2);
  });
});
