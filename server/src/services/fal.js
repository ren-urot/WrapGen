// server/src/services/fal.js
const { fal } = require('@fal-ai/client');

fal.config({ credentials: process.env.FAL_KEY });

let _generateArtworkOverride = null;
function _setGenerateArtworkForTesting(fn) { _generateArtworkOverride = fn; }

async function generateArtwork(prompt, count = 2) {
  if (_generateArtworkOverride) return _generateArtworkOverride(prompt, count);
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
