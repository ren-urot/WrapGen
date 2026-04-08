// server/src/services/exporter.js
const sharp = require('sharp');
const { getTemplate } = require('../templates');
const { uploadBuffer } = require('../storage');

let _exportVersionOverride = null;
function _setExportVersionForTesting(fn) { _exportVersionOverride = fn; }

async function exportVersion(version, project) {
  if (_exportVersionOverride) return _exportVersionOverride(version, project);
  // version: { artwork_urls, ... }
  // project: { vehicle_id, ... }
  const template = getTemplate(project.vehicle_id);
  if (!template) throw new Error(`Template not found: ${project.vehicle_id}`);

  const artworkUrls = JSON.parse(version.artwork_urls);
  const bleedPx = 35; // ~3mm at 300dpi

  // Export first variation at 3× scale for print quality
  const res = await fetch(artworkUrls[0]);
  if (!res.ok) throw new Error(`Failed to fetch artwork: ${res.status}`);
  const sourceBuffer = Buffer.from(await res.arrayBuffer());

  const printBuffer = await sharp(sourceBuffer)
    .resize(template.outputWidth * 3, null, { fit: 'inside', withoutEnlargement: false })
    .extend({
      top: bleedPx, bottom: bleedPx, left: bleedPx, right: bleedPx,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  const fileUrl = await uploadBuffer(printBuffer, 'image/png', 'png');

  const specs = {
    dimensions: `${template.wrapZone.w * 3}px × ${template.wrapZone.h * 3}px (before bleed)`,
    bleed: '3mm (35px at 300dpi)',
    dpi: template.dpi,
    colorProfile: 'Convert to CMYK before sending to press',
  };

  return { files: [fileUrl], specs };
}

module.exports = { exportVersion, _setExportVersionForTesting };
