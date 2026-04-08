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

async function ensurePlaceholders() {
  const sharp = require('sharp');
  const dir = getTemplatesDir();
  if (!fs.existsSync(dir)) return;

  const templates = loadTemplates();
  for (const t of templates) {
    const photoPath = path.join(dir, t.id, 'photo.png');
    const overlayPath = path.join(dir, t.id, 'overlay.png');
    if (fs.existsSync(photoPath) && fs.existsSync(overlayPath)) continue;

    const { outputWidth, wrapZone } = t;
    const height = Math.round(outputWidth * 0.523);

    const transparent = await sharp({
      create: { width: wrapZone.w, height: wrapZone.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).png().toBuffer();

    const photo = await sharp({
      create: { width: outputWidth, height, channels: 4, background: { r: 60, g: 60, b: 60, alpha: 1 } },
    }).composite([{ input: transparent, left: wrapZone.x, top: wrapZone.y, blend: 'dest-out' }])
      .png().toBuffer();
    fs.writeFileSync(photoPath, photo);

    const overlay = await sharp(Buffer.from(
      `<svg width="${outputWidth}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="v" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.3"/>
        </radialGradient></defs>
        <rect width="${outputWidth}" height="${height}" fill="url(#v)"/>
      </svg>`
    )).png().toBuffer();
    fs.writeFileSync(overlayPath, overlay);

    console.log(`✓ Generated placeholder template: ${t.id}`);
  }
}

module.exports = { loadTemplates, getTemplate, ensurePlaceholders };
