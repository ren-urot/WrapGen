// server/tests/projects.test.js
const request = require('supertest');

process.env.DB_PATH = ':memory:';
process.env.TEMPLATES_DIR = require('path').join(__dirname, 'fixtures/templates');

const { resetDb, seedProject, seedVersion } = require('./helpers');
const { createApp } = require('../src/app');
const projectsRouter = require('../src/routes/projects');

let app;
beforeEach(() => {
  resetDb();
  app = createApp();
  app.use('/api/projects', projectsRouter);
});

describe('GET /api/projects', () => {
  it('returns empty array when no projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns projects with version count', async () => {
    const p = seedProject();
    seedVersion(p.id);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe(p.id);
    expect(res.body[0].version_count).toBe(1);
  });
});

describe('POST /api/projects', () => {
  it('creates a project and returns 201', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'My Plumbing Van', vehicle_id: 'transit-van' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('My Plumbing Van');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ vehicle_id: 'transit-van' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when vehicle_id is missing', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns project with versions array', async () => {
    const p = seedProject();
    seedVersion(p.id);
    const res = await request(app).get(`/api/projects/${p.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(p.id);
    expect(Array.isArray(res.body.versions)).toBe(true);
    expect(res.body.versions.length).toBe(1);
  });

  it('returns 404 for unknown project', async () => {
    const res = await request(app).get('/api/projects/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/projects/:id', () => {
  it('deletes project and returns 204', async () => {
    const p = seedProject();
    const res = await request(app).delete(`/api/projects/${p.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for unknown project', async () => {
    const res = await request(app).delete('/api/projects/ghost');
    expect(res.status).toBe(404);
  });
});
