// server/src/services/fal.js
const { fal } = require('@fal-ai/client');

fal.config({ credentials: process.env.FAL_KEY });

let _generateArtworkOverride = null;
function _setGenerateArtworkForTesting(fn) { _generateArtworkOverride = fn; }

async function generateDemoArtwork(count) {
  const sharp = require('sharp');
  const palette = [
    { from: '#007BFF', to: '#00D1FF' },
    { from: '#A3FF12', to: '#007BFF' },
    { from: '#00D1FF', to: '#A3FF12' },
    { from: '#FF6B00', to: '#FF00D1' },
  ];
  return Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const { from, to } = palette[i % palette.length];
      return sharp(Buffer.from(
        `<svg width="2048" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${from}"/>
            <stop offset="100%" style="stop-color:${to}"/>
          </linearGradient></defs>
          <rect width="2048" height="1024" fill="url(#g)"/>
          <text x="1024" y="512" text-anchor="middle" dominant-baseline="middle"
            fill="white" font-size="72" font-family="Arial" font-weight="bold" opacity="0.25">DEMO</text>
        </svg>`
      )).jpeg({ quality: 90 }).toBuffer();
    })
  );
}

async function generateArtwork(prompt, count = 2) {
  if (_generateArtworkOverride) return _generateArtworkOverride(prompt, count);
  if (!process.env.FAL_KEY) {
    console.log('[demo] FAL_KEY not set — returning placeholder artwork');
    return generateDemoArtwork(count);
  }
  const requests = Array.from({ length: count }, () =>
    fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt,
        image_size: { width: 2048, height: 1024 },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
      },
    })
  );

  const results = await Promise.all(requests);

  const buffers = await Promise.all(
    results.map(async (r) => {
      const url = r.data.images[0].url;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch artwork: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    })
  );

  return buffers;
}

module.exports = { generateArtwork, _setGenerateArtworkForTesting };
