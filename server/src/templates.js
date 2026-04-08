// server/src/templates.js
const fs = require('fs');
const path = require('path');

const TEMPLATE_VERSION = '3'; // bump to force regeneration

const BUILT_IN_TEMPLATES = [
  { id: 'transit-van', label: 'Transit Van', outputWidth: 1200, wrapZone: { x: 98, y: 82, w: 1004, h: 464 }, bleed: '3mm', dpi: 300 },
  { id: 'ute',         label: 'Ute',         outputWidth: 1200, wrapZone: { x: 80, y: 90, w: 1040, h: 420 }, bleed: '3mm', dpi: 300 },
  { id: 'sedan',       label: 'Sedan',       outputWidth: 1200, wrapZone: { x: 90, y: 95, w: 1020, h: 410 }, bleed: '3mm', dpi: 300 },
  { id: 'truck',       label: 'Truck',       outputWidth: 1400, wrapZone: { x: 70, y: 80, w: 1260, h: 520 }, bleed: '3mm', dpi: 300 },
];

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
  } catch (_) {}
  return BUILT_IN_TEMPLATES;
}

function getTemplate(id) {
  const dir = getTemplatesDir();
  const metaPath = path.join(dir, id, 'metadata.json');
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    return { id, photoPath: path.join(dir, id, 'photo.png'), overlayPath: path.join(dir, id, 'overlay.png'), ...meta };
  }
  const dataDir = getDataTemplatesDir();
  const dataMetaPath = path.join(dataDir, id, 'metadata.json');
  if (fs.existsSync(dataMetaPath)) {
    const meta = JSON.parse(fs.readFileSync(dataMetaPath, 'utf8'));
    return { id, photoPath: path.join(dataDir, id, 'photo.png'), overlayPath: path.join(dataDir, id, 'overlay.png'), ...meta };
  }
  return null;
}

// ─── SVG generators ─────────────────────────────────────────────────────────

function makePhotoSvg(id, W, H, z) {
  const BG    = '#07070b';
  const BODY  = 'url(#body_grad)';
  const DARK  = '#101014';
  const TRIM  = '#2a2a32';

  // Wheel geometry
  const wr  = Math.round(Math.min(z.h * 0.112, (H - z.y - z.h) * 1.9));
  const wY  = z.y + z.h - Math.round(wr * 0.08);
  const fwX = z.x + Math.round(z.w * 0.165);
  const rwX = z.x + Math.round(z.w * 0.815);

  function wheel(cx, cy) {
    const r  = wr;
    const r2 = Math.round(r * 0.76);
    const r3 = Math.round(r * 0.50);
    const r4 = Math.round(r * 0.20);
    const sw = Math.max(3, Math.round(r * 0.09));
    const spokes = Array.from({ length: 5 }, (_, i) => {
      const a  = (i / 5) * Math.PI * 2 + Math.PI / 10;
      const x1 = (cx + Math.cos(a) * r3).toFixed(1);
      const y1 = (cy + Math.sin(a) * r3).toFixed(1);
      const x2 = (cx + Math.cos(a) * r2).toFixed(1);
      const y2 = (cy + Math.sin(a) * r2).toFixed(1);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0e0e14" stroke-width="${sw}" stroke-linecap="round"/>`;
    }).join('');
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}"  fill="#07070c"/>
      <circle cx="${cx}" cy="${cy}" r="${r2}" fill="#141420"/>
      <circle cx="${cx}" cy="${cy}" r="${r3}" fill="#1e1e26"/>
      ${spokes}
      <circle cx="${cx}" cy="${cy}" r="${r4}" fill="#2e2e38"/>
      <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.09)}" fill="#424250"/>`;
  }

  const roofTop = Math.max(6, Math.round(z.y * 0.12));
  let vehicleShapes = '';

  if (id === 'transit-van') {
    vehicleShapes = `
      <!-- Roof — high and boxy -->
      <path d="M ${z.x - 2},${z.y} L ${z.x + 2},${roofTop + 10} L ${z.x + Math.round(z.w * 0.14)},${roofTop} L ${W - 8},${roofTop} L ${W - 6},${z.y}" fill="url(#body_grad)"/>
      <line x1="${z.x + Math.round(z.w * 0.14)}" y1="${roofTop + 3}" x2="${W - 8}" y2="${roofTop + 3}" stroke="white" stroke-opacity="0.06" stroke-width="3"/>
      <!-- Front section -->
      <rect x="4" y="${z.y}" width="${z.x - 4}" height="${z.h}" fill="url(#body_grad)"/>
      <!-- Headlight strip -->
      <rect x="7" y="${z.y + Math.round(z.h * 0.13)}" width="${z.x - 14}" height="${Math.round(z.h * 0.10)}" fill="rgb(230,240,255)" fill-opacity="0.75" rx="3"/>
      <!-- Grille -->
      <rect x="7" y="${z.y + Math.round(z.h * 0.56)}" width="${z.x - 14}" height="${Math.round(z.h * 0.28)}" fill="${DARK}" rx="2"/>
      <!-- Rear section -->
      <rect x="${z.x + z.w}" y="${z.y}" width="${W - z.x - z.w - 4}" height="${z.h}" fill="url(#body_grad)"/>
      <!-- Tail light -->
      <rect x="${z.x + z.w + 5}" y="${z.y + Math.round(z.h * 0.11)}" width="9" height="${Math.round(z.h * 0.12)}" fill="rgb(220,28,12)" fill-opacity="0.92" rx="2"/>
      <rect x="${z.x + z.w + 5}" y="${z.y + Math.round(z.h * 0.27)}" width="9" height="${Math.round(z.h * 0.06)}" fill="rgb(255,115,0)" fill-opacity="0.80" rx="2"/>
      <!-- Rear step bump -->
      <rect x="${z.x + z.w}" y="${z.y + z.h - 18}" width="${W - z.x - z.w - 4}" height="18" fill="${TRIM}"/>`;

  } else if (id === 'sedan') {
    vehicleShapes = `
      <!-- Curved coupe roof -->
      <path d="M ${z.x - 4},${z.y} Q ${z.x + Math.round(z.w * 0.08)},${roofTop + 8} ${z.x + Math.round(z.w * 0.22)},${roofTop - 2} Q ${z.x + Math.round(z.w * 0.48)},${roofTop - 12} ${z.x + Math.round(z.w * 0.68)},${roofTop} Q ${z.x + Math.round(z.w * 0.88)},${roofTop + 10} ${z.x + z.w},${z.y}" fill="url(#body_grad)"/>
      <!-- Front sloped hood -->
      <path d="M 4,${z.y + Math.round(z.h * 0.32)} L ${z.x},${z.y} L 4,${z.y + Math.round(z.h * 0.32)}" fill="url(#body_grad)"/>
      <rect x="4" y="${z.y + Math.round(z.h * 0.32)}" width="${z.x - 4}" height="${z.h - Math.round(z.h * 0.32)}" fill="url(#body_grad)"/>
      <!-- Headlight -->
      <rect x="7" y="${z.y + Math.round(z.h * 0.08)}" width="${z.x - 13}" height="${Math.round(z.h * 0.1)}" fill="rgb(230,240,255)" fill-opacity="0.65" rx="3"/>
      <!-- Rear sloped boot -->
      <path d="M ${z.x + z.w},${z.y} L ${W - 6},${z.y + Math.round(z.h * 0.28)} L ${W - 6},${z.y + z.h} L ${z.x + z.w},${z.y + z.h}" fill="url(#body_grad)"/>
      <!-- Tail light -->
      <rect x="${z.x + z.w + 3}" y="${z.y + Math.round(z.h * 0.08)}" width="9" height="${Math.round(z.h * 0.14)}" fill="rgb(220,28,12)" fill-opacity="0.9" rx="2"/>`;

  } else if (id === 'ute') {
    const cabEnd = z.x + Math.round(z.w * 0.44);
    vehicleShapes = `
      <!-- Cab roof -->
      <path d="M ${z.x - 2},${z.y} L ${z.x + 2},${roofTop + 12} L ${z.x + Math.round(z.w * 0.11)},${roofTop} L ${cabEnd - 14},${roofTop} L ${cabEnd},${z.y}" fill="url(#body_grad)"/>
      <!-- Tray top rail (lower than cab) -->
      <rect x="${cabEnd}" y="${z.y + Math.round(z.h * 0.07)}" width="${z.x + z.w - cabEnd}" height="7" fill="${TRIM}"/>
      <!-- Front -->
      <rect x="4" y="${z.y}" width="${z.x - 4}" height="${z.h}" fill="url(#body_grad)"/>
      <rect x="7" y="${z.y + Math.round(z.h * 0.11)}" width="${z.x - 13}" height="${Math.round(z.h * 0.10)}" fill="rgb(230,240,255)" fill-opacity="0.65" rx="3"/>
      <rect x="7" y="${z.y + Math.round(z.h * 0.52)}" width="${z.x - 13}" height="${Math.round(z.h * 0.28)}" fill="${DARK}" rx="2"/>
      <!-- Rear -->
      <rect x="${z.x + z.w}" y="${z.y}" width="${W - z.x - z.w - 4}" height="${z.h}" fill="url(#body_grad)"/>
      <rect x="${z.x + z.w + 4}" y="${z.y + Math.round(z.h * 0.1)}" width="9" height="${Math.round(z.h * 0.12)}" fill="rgb(220,28,12)" fill-opacity="0.9" rx="2"/>`;

  } else { // truck
    const cabEnd = z.x + Math.round(z.w * 0.30);
    vehicleShapes = `
      <!-- Tall boxy cab -->
      <path d="M ${z.x - 2},${z.y} L ${z.x + 3},${roofTop + 5} L ${z.x + 22},${roofTop} L ${cabEnd - 10},${roofTop} L ${cabEnd},${z.y}" fill="url(#body_grad)"/>
      <!-- Front - large cab face -->
      <rect x="4" y="${z.y}" width="${z.x - 4}" height="${z.h}" fill="url(#body_grad)"/>
      <rect x="7" y="${z.y + Math.round(z.h * 0.09)}" width="${z.x - 13}" height="${Math.round(z.h * 0.12)}" fill="rgb(230,240,255)" fill-opacity="0.72" rx="3"/>
      <!-- Bull bar -->
      <rect x="4"  y="${z.y + Math.round(z.h * 0.65)}" width="${z.x - 4}" height="${Math.round(z.h * 0.35)}" fill="${TRIM}" rx="2"/>
      <!-- Rear -->
      <rect x="${z.x + z.w}" y="${z.y}" width="${W - z.x - z.w - 4}" height="${z.h}" fill="url(#body_grad)"/>
      <rect x="${z.x + z.w + 5}" y="${z.y + Math.round(z.h * 0.08)}" width="11" height="${Math.round(z.h * 0.16)}" fill="rgb(220,28,12)" fill-opacity="0.9" rx="2"/>`;
  }

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="body_grad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%"   stop-color="#28282e"/>
    <stop offset="100%" stop-color="#131318"/>
  </linearGradient>
  <linearGradient id="floor_grad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%"   stop-color="#0d0d12"/>
    <stop offset="100%" stop-color="${BG}"/>
  </linearGradient>
</defs>

<!-- Studio background -->
<rect width="${W}" height="${H}" fill="${BG}"/>
<rect x="0" y="${Math.round(H * 0.80)}" width="${W}" height="${Math.round(H * 0.20)}" fill="url(#floor_grad)"/>

<!-- Side panel base (artwork composites over this) -->
<rect x="4" y="${z.y}" width="${W - 8}" height="${z.h}" fill="url(#body_grad)"/>

${vehicleShapes}

<!-- Rocker panel / chassis -->
<rect x="4" y="${z.y + z.h}" width="${W - 8}" height="${Math.round((H - z.y - z.h) * 0.48)}" fill="${DARK}"/>
<!-- Chrome rocker strip -->
<rect x="4" y="${z.y + z.h}" width="${W - 8}" height="4" fill="${TRIM}"/>

<!-- Wheel arch cutouts -->
<ellipse cx="${fwX}" cy="${z.y + z.h - 5}" rx="${Math.round(wr * 1.28)}" ry="${Math.round(wr * 0.40)}" fill="${BG}"/>
<ellipse cx="${rwX}" cy="${z.y + z.h - 5}" rx="${Math.round(wr * 1.28)}" ry="${Math.round(wr * 0.40)}" fill="${BG}"/>

<!-- Wheels -->
${wheel(fwX, wY)}
${wheel(rwX, wY)}

<!-- Ground shadow -->
<ellipse cx="${Math.round(W / 2)}" cy="${H - 4}" rx="${Math.round(W * 0.44)}" ry="18" fill="black" fill-opacity="0.85"/>
</svg>`;
}

function makeOverlaySvg(id, W, H, z) {
  const { x, y, w, h } = z;

  const winW = Math.round(w * (id === 'truck' ? 0.24 : id === 'ute' ? 0.17 : 0.15));
  const winH = Math.round(h * (id === 'sedan' ? 0.52 : 0.62));
  const winX = x + 7;
  const winY = y + 7;

  const doorX = id === 'ute'   ? x + Math.round(w * 0.42)
              : id === 'truck' ? x + Math.round(w * 0.29)
              :                  x + Math.round(w * 0.35);

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="vig" cx="50%" cy="44%" r="72%">
    <stop offset="48%" stop-color="black" stop-opacity="0"/>
    <stop offset="100%" stop-color="black" stop-opacity="0.55"/>
  </radialGradient>
  <linearGradient id="win_shine" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="white" stop-opacity="0.09"/>
    <stop offset="100%" stop-color="white" stop-opacity="0"/>
  </linearGradient>
</defs>

<!-- Side window glass -->
<rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" fill="rgb(60,100,170)" fill-opacity="0.30" rx="4"/>
<rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" fill="none" stroke="rgb(180,215,255)" stroke-opacity="0.10" stroke-width="1.5" rx="4"/>
<rect x="${winX + 5}" y="${winY + 5}" width="${Math.round(winW * 0.5)}" height="${Math.round(winH * 0.38)}" fill="url(#win_shine)" rx="3"/>

<!-- Door seam -->
<line x1="${doorX}" y1="${y + 14}" x2="${doorX}" y2="${y + h - 14}" stroke="black" stroke-opacity="0.32" stroke-width="1.5"/>

<!-- Panel top edge highlight -->
<line x1="${x + 2}" y1="${y + 8}" x2="${x + w - 2}" y2="${y + 8}" stroke="white" stroke-opacity="0.06" stroke-width="3"/>

<!-- Bottom shadow on wrap zone -->
<rect x="${x}" y="${y + h - 45}" width="${w}" height="45" fill="black" fill-opacity="0.22"/>

<!-- Full scene vignette -->
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

// ─── Placeholder generation ──────────────────────────────────────────────────

async function ensurePlaceholders() {
  const sharp = require('sharp');
  const dataDir = getDataTemplatesDir();

  for (const t of BUILT_IN_TEMPLATES) {
    const dir = path.join(dataDir, t.id);
    const versionFile = path.join(dir, 'version.txt');

    // Skip if already generated at the current version
    if (fs.existsSync(versionFile) && fs.readFileSync(versionFile, 'utf8').trim() === TEMPLATE_VERSION) continue;

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(
      { label: t.label, outputWidth: t.outputWidth, wrapZone: t.wrapZone, bleed: t.bleed, dpi: t.dpi },
      null, 2
    ));

    const W = t.outputWidth;
    const H = Math.round(W * 0.523);
    const z = t.wrapZone;

    const photoSvg   = makePhotoSvg(t.id, W, H, z);
    const overlaySvg = makeOverlaySvg(t.id, W, H, z);

    await sharp(Buffer.from(photoSvg)).png().toFile(path.join(dir, 'photo.png'));
    await sharp(Buffer.from(overlaySvg)).png().toFile(path.join(dir, 'overlay.png'));
    fs.writeFileSync(versionFile, TEMPLATE_VERSION);

    console.log(`✓ Generated vehicle template v${TEMPLATE_VERSION}: ${t.id}`);
  }
}

module.exports = { loadTemplates, getTemplate, ensurePlaceholders };
