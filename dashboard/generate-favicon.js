const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG with ultra-legible, luxury letter "D" designed for high visibility at 16px to 512px
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19" />
      <stop offset="100%" stop-color="#020408" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#C084FC" />
    </linearGradient>
    <linearGradient id="letterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#38BDF8" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="12" />

  <!-- Letter D (clean vector path for maximum crispness) -->
  <path d="M 160 120 L 270 120 C 355 120 400 170 400 256 C 400 342 355 392 270 392 L 160 392 Z M 224 176 L 224 336 L 268 336 C 315 336 342 308 342 256 C 342 204 315 176 268 176 Z" 
        fill="url(#letterGrad)" 
        filter="url(#glow)" />
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'app');

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent.trim());
  fs.writeFileSync(path.join(appDir, 'favicon.svg'), svgContent.trim());

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNGs
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-icon.png', size: 180 },
    { name: 'favicon.png', size: 192 },
    { name: 'icon.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, name), pngBuffer);
    fs.writeFileSync(path.join(appDir, name), pngBuffer);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Also write 32x32 as favicon.ico for standard fallback
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), ico32);
  console.log('Generated favicon.ico (32x32)');
}

generate().catch(console.error);
