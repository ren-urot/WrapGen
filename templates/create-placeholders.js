// templates/create-placeholders.js
// Run once from repo root: node templates/create-placeholders.js
const path = require('path');
const sharp = require(path.join(__dirname, '../server/node_modules/sharp'));
const fs = require('fs');
const { loadTemplates } = require('../server/src/templates');

process.env.TEMPLATES_DIR = path.join(__dirname);

async function createPlaceholders() {
  const templates = loadTemplates();

  for (const t of templates) {
    const dir = path.join(__dirname, t.id);
    const { outputWidth, wrapZone } = t;
    const height = Math.round(outputWidth * 0.523); // ~16:8.4 ratio

    // photo.png — grey vehicle silhouette with transparent wrap zone cut out
    const photo = await sharp({
      create: {
        width: outputWidth,
        height,
        channels: 4,
        background: { r: 60, g: 60, b: 60, alpha: 1 },
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: wrapZone.w,
              height: wrapZone.h,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
          }).png().toBuffer(),
          left: wrapZone.x,
          top: wrapZone.y,
          blend: 'dest-out',
        },
      ])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(dir, 'photo.png'), photo);
    console.log(`✓ ${t.id}/photo.png`);

    // overlay.png — subtle dark vignette
    const overlay = await sharp({
      create: {
        width: outputWidth,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${outputWidth}" height="${height}">
              <defs>
                <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                  <stop offset="60%" stop-color="black" stop-opacity="0"/>
                  <stop offset="100%" stop-color="black" stop-opacity="0.3"/>
                </radialGradient>
              </defs>
              <rect width="${outputWidth}" height="${height}" fill="url(#vignette)"/>
            </svg>`
          ),
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(dir, 'overlay.png'), overlay);
    console.log(`✓ ${t.id}/overlay.png`);
  }
  console.log('\nPlaceholder templates created. Replace photo.png files with real vehicle photos before launch.');
}

createPlaceholders().catch(console.error);
