// server/src/services/fal.js
const { fal } = require('@fal-ai/client');

fal.config({ credentials: process.env.FAL_KEY });

let _generateArtworkOverride = null;
function _setGenerateArtworkForTesting(fn) { _generateArtworkOverride = fn; }

async function generateDemoArtwork(count) {
  const sharp = require('sharp');
  const W = 2048, H = 1024;

  // Design 1 — Deep blue base, bold white diagonal sweep, cyan + lime accents
  const design1 = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#001d5e"/>
    <stop offset="55%"  stop-color="#0044c8"/>
    <stop offset="100%" stop-color="#005de0"/>
  </linearGradient>
  <linearGradient id="sweep" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%"   stop-color="white" stop-opacity="0.20"/>
    <stop offset="100%" stop-color="white" stop-opacity="0.04"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#base)"/>

<!-- Bold diagonal white sweep -->
<polygon points="${H * 0.55},0 ${H * 0.55 + 150},0 ${H * 0.08 + 150},${H} ${H * 0.08},${H}" fill="url(#sweep)"/>

<!-- Cyan accent blade -->
<polygon points="${H * 0.98},0 ${H * 0.98 + 80},0 ${H * 0.51 + 80},${H} ${H * 0.51},${H}" fill="rgb(0,209,255)" fill-opacity="0.24"/>

<!-- Thin lime accent -->
<polygon points="${H * 1.22},0 ${H * 1.22 + 28},0 ${H * 0.75 + 28},${H} ${H * 0.75},${H}" fill="rgb(163,255,18)" fill-opacity="0.40"/>

<!-- Right side depth -->
<rect x="${Math.round(W * 0.76)}" y="0" width="${Math.round(W * 0.24)}" height="${H}" fill="black" fill-opacity="0.12"/>

<!-- Top/bottom edge darken for depth -->
<rect x="0" y="0"       width="${W}" height="55" fill="black" fill-opacity="0.22"/>
<rect x="0" y="${H - 55}" width="${W}" height="55" fill="black" fill-opacity="0.30"/>
</svg>`;

  // Design 2 — Dark base, bold lime + blue chevron shapes, high contrast
  const design2 = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="dk" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#07090f"/>
    <stop offset="100%" stop-color="#0b0e18"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#dk)"/>

<!-- Primary lime chevron block -->
<polygon points="0,0 ${Math.round(W * 0.22)},0 ${Math.round(W * 0.08)},${H} 0,${H}" fill="rgb(163,255,18)"/>
<!-- Blue fill next to lime -->
<polygon points="${Math.round(W * 0.235)},0 ${Math.round(W * 0.36)},0 ${Math.round(W * 0.22)},${H} ${Math.round(W * 0.095)},${H}" fill="rgb(0,100,220)" fill-opacity="0.72"/>
<!-- Smaller lime accent -->
<polygon points="${Math.round(W * 0.375)},0 ${Math.round(W * 0.43)},0 ${Math.round(W * 0.29)},${H} ${Math.round(W * 0.235)},${H}" fill="rgb(163,255,18)" fill-opacity="0.38"/>

<!-- Right mirror chevrons (subtle) -->
<polygon points="${W},0 ${Math.round(W * 0.80)},0 ${Math.round(W * 0.94)},${H} ${W},${H}" fill="rgb(163,255,18)" fill-opacity="0.10"/>
<polygon points="${Math.round(W * 0.79)},0 ${Math.round(W * 0.73)},0 ${Math.round(W * 0.87)},${H} ${Math.round(W * 0.93)},${H}" fill="rgb(0,100,220)" fill-opacity="0.14"/>

<!-- Thin horizontal centre line -->
<rect x="0" y="${H / 2 - 1}" width="${W}" height="2" fill="rgb(163,255,18)" fill-opacity="0.14"/>

<!-- Edge darkening -->
<rect x="0" y="0"       width="${W}" height="48" fill="black" fill-opacity="0.28"/>
<rect x="0" y="${H - 48}" width="${W}" height="48" fill="black" fill-opacity="0.38"/>
</svg>`;

  const designs = [design1, design2];
  return Promise.all(
    Array.from({ length: count }, async (_, i) =>
      sharp(Buffer.from(designs[i % designs.length])).jpeg({ quality: 92 }).toBuffer()
    )
  );
}

async function generateArtwork(prompt, count = 2) {
  if (_generateArtworkOverride) return _generateArtworkOverride(prompt, count);
  const falKey = process.env.FAL_KEY || '';
  // Treat unset or placeholder values (contain spaces or non-ASCII) as demo mode
  if (!falKey || falKey.includes(' ') || !/^[\x20-\x7E]+$/.test(falKey)) {
    console.log('[demo] FAL_KEY not configured — returning placeholder artwork');
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
