// server/src/routes/export.js
const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../db');
const { exportVersion } = require('../services/exporter');

const router = express.Router();

router.post('/:versionId', async (req, res) => {
  const { versionId } = req.params;
  const db = getDb();

  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(versionId);
  if (!version) return res.status(404).json({ error: 'Version not found' });

  const existing = db.prepare('SELECT * FROM exports WHERE version_id = ?').get(versionId);
  if (existing) return res.json({ exportId: existing.id, status: existing.status });

  const exportId = crypto.randomUUID();
  db.prepare(
    "INSERT INTO exports (id, version_id, status, created_at) VALUES (?, ?, 'pending', ?)"
  ).run(exportId, versionId, Date.now());

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(version.project_id);

  // Fire-and-forget: process export asynchronously
  exportVersion(version, project)
    .then(({ files, specs }) => {
      db.prepare(
        "UPDATE exports SET status = 'ready', files = ?, specs = ? WHERE id = ?"
      ).run(JSON.stringify(files), JSON.stringify(specs), exportId);
    })
    .catch((err) => {
      console.error('Export error:', err);
      db.prepare("UPDATE exports SET status = 'error' WHERE id = ?").run(exportId);
    });

  res.status(202).json({ exportId, status: 'pending' });
});

router.get('/:versionId', (req, res) => {
  const db = getDb();
  const exp = db.prepare('SELECT * FROM exports WHERE version_id = ?').get(req.params.versionId);
  if (!exp) return res.status(404).json({ error: 'No export found for this version' });

  res.json({
    exportId: exp.id,
    status: exp.status,
    files: exp.files ? JSON.parse(exp.files) : null,
    specs: exp.specs ? JSON.parse(exp.specs) : null,
  });
});

module.exports = router;
