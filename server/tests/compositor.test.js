// server/tests/compositor.test.js
const sharp = require('sharp');
const path = require('path');
const { composite } = require('../src/services/compositor');

// Use real Sharp for this unit test — no mock needed
const FIXTURES = path.join(__dirname, 'fixtures/templates/transit-van');

async function makeSolidPng(w, h, r, g, b) {
  return sharp({ create: { width: w, height: h, channels: 3, background: { r, g, b } } })
    .png().toBuffer();
}

describe('composite', () => {
  it('returns a JPEG buffer', async () => {
    const artworkBuf = await makeSolidPng(2048, 1024, 0, 120, 255);
    const template = {
      photoPath: path.join(FIXTURES, 'photo.png'),
      overlayPath: path.join(FIXTURES, 'overlay.png'),
      wrapZone: { x: 100, y: 80, w: 1000, h: 468 },
      outputWidth: 1200,
    };

    // Create minimal fixture PNGs if they don't exist
    const fs = require('fs');
    if (!fs.existsSync(template.photoPath)) {
      const buf = await makeSolidPng(1200, 628, 60, 60, 60);
      fs.writeFileSync(template.photoPath, buf);
    }
    if (!fs.existsSync(template.overlayPath)) {
      const buf = await sharp({
        create: { width: 1200, height: 628, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      }).png().toBuffer();
      fs.writeFileSync(template.overlayPath, buf);
    }

    const result = await composite(artworkBuf, template);
    expect(Buffer.isBuffer(result)).toBe(true);
    const meta = await sharp(result).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.width).toBe(1200);
  });
});
