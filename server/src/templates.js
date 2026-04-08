// server/src/templates.js
const fs = require('fs');
const path = require('path');

// Built-in vehicle definitions — used as fallback when templates dir is unavailable
const BUILT_IN_TEMPLATES = [
  { id: 'transit-van', label: 'Transit Van', outputWidth: 1200, wrapZone: { x: 98, y: 82, w: 1004, h: 464 }, bleed: '3mm', dpi: 300 },
  { id: 'ute',         label: 'Ute',         outputWidth: 1200, wrapZone: { x: 80, y: 90, w: 1040, h: 420 }, bleed: '3mm', dpi: 300 },
  { id: 'sedan',       label: 'Sedan',       outputWidth: 1200, wrapZone: { x: 90, y: 95, w: 1020, h: 410 }, bleed: '3mm', dpi: 300 },
  { id: 'truck',       label: 'Truck',       outputWidth: 1400, wrapZone: { x: 70, y: 80, w: 1260, h: 520 }, bleed: '3mm', dpi: 300 },
];

// Data-local templates dir — always writable, used as the canonical location on Railway
function getDataTemplatesDir() {
  return path.join(__dirname, '../../data/templates');
}

function getTemplatesDir() {
  return process.env.TEMPLATES_DIR || getDataTemplatesDir();
}

function loadTemplates() {
  const dir = getTemplatesDir();
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
    if (entries.length > 0) {
      return entries.map((d) => {
        const meta = JSON.parse(fs.readFileSync(path.join(dir, d.name, 'metadata.json'), 'utf8'));
        return { id: d.name, ...meta };
      });
    }
  } catch (_) {
    // fall through to built-ins
  }
  return BUILT_IN_TEMPLATES;
}

function getTemplate(id) {
  // Try configured/data dir first
  const dir = getTemplatesDir();
  const metaPath = path.join(dir, id, 'metadata.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    return { id, photoPath: path.join(dir, id, 'photo.png'), overlayPath: path.join(dir, id, 'overlay.png'), ...meta };
  }

  // Fall back to data/templates dir
  const dataDir = getDataTemplatesDir();
  const dataMetaPath = path.join(dataDir, id, 'metadata.json');
  if (fs.existsSync(dataMetaPath)) {
    const meta = JSON.parse(fs.readFileSync(dataMetaPath, 'utf8'));
    return { id, photoPath: path.join(dataDir, id, 'photo.png'), overlayPath: path.join(dataDir, id, 'overlay.png'), ...meta };
  }

  return null;
}

async function ensurePlaceholders() {
  const sharp = require('sharp');
  const dataDir = getDataTemplatesDir();

  for (const t of BUILT_IN_TEMPLATES) {
    const dir = path.join(dataDir, t.id);
    const photoPath = path.join(dir, 'photo.png');
    const overlayPath = path.join(dir, 'overlay.png');
    const metaPath = path.join(dir, 'metadata.json');

    if (fs.existsSync(photoPath) && fs.existsSync(overlayPath)) continue;

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(metaPath, JSON.stringify(t, null, 2));

    const { outputWidth, wrapZone } = t;
    const height = Math.round(outputWidth * 0.523);

    const transparent = await sharp({
      create: { width: wrapZone.w, height: wrapZone.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).png().toBuffer();

    const photo = await sharp({
      create: { width: outputWidth, height, channels: 4, background: { r: 50, g: 50, b: 55, alpha: 1 } },
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
