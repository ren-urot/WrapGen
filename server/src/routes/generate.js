// server/src/routes/generate.js
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { getDb } = require('../db');
const { getTemplate } = require('../templates');
const { generateArtwork } = require('../services/fal');
const { composite } = require('../services/compositor');
const { uploadBuffer } = require('../storage');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'ref', maxCount: 1 },
  ]),
  async (req, res) => {
    const { prompt } = req.body;
    const { id: projectId } = req.params;

    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    if (!req.files?.logo) return res.status(400).json({ error: 'logo file is required' });

    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const template = getTemplate(project.vehicle_id);
    if (!template) return res.status(400).json({ error: 'Invalid vehicle template' });

    try {
      // Upload logo to R2
      const logoFile = req.files.logo[0];
      const logoExt = logoFile.originalname.split('.').pop().toLowerCase();
      const logoUrl = await uploadBuffer(logoFile.buffer, logoFile.mimetype, logoExt);

      let refUrl = null;
      if (req.files?.ref) {
        const refFile = req.files.ref[0];
        const refExt = refFile.originalname.split('.').pop().toLowerCase();
        refUrl = await uploadBuffer(refFile.buffer, refFile.mimetype, refExt);
      }

      // Enrich prompt for wrap-style generation
      const enrichedPrompt = [
        `Vehicle wrap graphic design for a ${template.label}.`,
        prompt,
        'Bold, flat graphic design. Vibrant colors. No text unless specified.',
        'Seamless horizontal layout suitable for vehicle wrapping. Print-ready artwork.',
      ].join(' ');

      // Generate 2 artwork variations via Fal.ai in parallel
      const artworkBuffers = await generateArtwork(enrichedPrompt, 2);

      // Upload raw artwork to R2 (needed for hi-res export later)
      const artworkUrls = await Promise.all(
        artworkBuffers.map((buf) => uploadBuffer(buf, 'image/jpeg', 'jpg'))
      );

      // Composite each artwork onto vehicle template with Sharp
      const mockupBuffers = await Promise.all(
        artworkBuffers.map((buf) => composite(buf, template))
      );

      // Upload composited mockups to R2
      const mockupUrls = await Promise.all(
        mockupBuffers.map((buf) => uploadBuffer(buf, 'image/jpeg', 'jpg'))
      );

      // Persist version
      const versionId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO versions
          (id, project_id, prompt, logo_url, ref_url, artwork_urls, mockup_urls, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        versionId, projectId, prompt, logoUrl, refUrl,
        JSON.stringify(artworkUrls),
        JSON.stringify(mockupUrls),
        Date.now()
      );

      res.status(201).json({ versionId, mockupUrls });
    } catch (err) {
      console.error('Generation error:', err);
      res.status(500).json({ error: 'Generation failed', detail: err.message });
    }
  }
);

module.exports = router;
