// server/src/templates.js
const fs = require('fs');
const path = require('path');

function getTemplatesDir() {
  return process.env.TEMPLATES_DIR ||
    path.join(__dirname, '../../templates');
}

function loadTemplates() {
  const dir = getTemplatesDir();
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const meta = JSON.parse(
        fs.readFileSync(path.join(dir, d.name, 'metadata.json'), 'utf8')
      );
      return { id: d.name, ...meta };
    });
}

function getTemplate(id) {
  const dir = getTemplatesDir();
  const metaPath = path.join(dir, id, 'metadata.json');
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  return {
    id,
    photoPath: path.join(dir, id, 'photo.png'),
    overlayPath: path.join(dir, id, 'overlay.png'),
    ...meta,
  };
}

module.exports = { loadTemplates, getTemplate };
