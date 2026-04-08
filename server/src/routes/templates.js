// server/src/routes/templates.js
const express = require('express');
const { loadTemplates, getTemplate } = require('../templates');

const router = express.Router();

router.get('/', (_req, res) => {
  const templates = loadTemplates();
  // Don't expose file paths to client
  res.json(templates.map(({ id, label, wrapZone, outputWidth }) => ({
    id, label, wrapZone, outputWidth,
  })));
});

router.get('/:id/image', (req, res) => {
  const template = getTemplate(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.sendFile(template.photoPath);
});

module.exports = router;
