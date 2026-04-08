// server/src/routes/projects.js
const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../db');

const router = express.Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const projects = db.prepare(`
    SELECT p.*, COUNT(v.id) AS version_count
    FROM projects p
    LEFT JOIN versions v ON v.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(projects);
});

router.post('/', (req, res) => {
  const { name, vehicle_id } = req.body;
  if (!name || !vehicle_id) {
    return res.status(400).json({ error: 'name and vehicle_id are required' });
  }
  const db = getDb();
  const id = crypto.randomUUID();
  const created_at = Date.now();
  db.prepare(
    'INSERT INTO projects (id, name, vehicle_id, created_at) VALUES (?, ?, ?, ?)'
  ).run(id, name, vehicle_id, created_at);
  res.status(201).json({ id, name, vehicle_id, created_at });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const versions = db.prepare(
    'SELECT * FROM versions WHERE project_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json({ ...project, versions });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
  res.status(204).send();
});

router.get('/:id/versions', (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const versions = db.prepare(
    'SELECT * FROM versions WHERE project_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json(versions);
});

module.exports = router;
