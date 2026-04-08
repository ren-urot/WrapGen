// server/src/services/compositor.js
const sharp = require('sharp');

let _compositeOverride = null;
function _setCompositeForTesting(fn) { _compositeOverride = fn; }

async function composite(artworkBuffer, template) {
  if (_compositeOverride) return _compositeOverride(artworkBuffer, template);
  const { photoPath, overlayPath, wrapZone, outputWidth = 1200 } = template;

  // Get vehicle photo dimensions to compute scale
  const photoMeta = await sharp(photoPath).metadata();
  const scale = outputWidth / photoMeta.width;
  const scaledHeight = Math.round(photoMeta.height * scale);

  // Scale wrap zone to output dimensions
  const zone = {
    left: Math.round(wrapZone.x * scale),
    top: Math.round(wrapZone.y * scale),
    width: Math.round(wrapZone.w * scale),
    height: Math.round(wrapZone.h * scale),
  };

  // Resize AI artwork to exactly fill the wrap zone
  const resizedArtwork = await sharp(artworkBuffer)
    .resize(zone.width, zone.height, { fit: 'cover', position: 'centre' })
    .toBuffer();

  // Layer: vehicle photo → artwork in zone → shadow overlay on top
  const result = await sharp(photoPath)
    .resize(outputWidth, scaledHeight)
    .composite([
      { input: resizedArtwork, left: zone.left, top: zone.top },
      { input: overlayPath, left: 0, top: 0 },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return result;
}

module.exports = { composite, _setCompositeForTesting };
