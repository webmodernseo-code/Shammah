const sharp = require('sharp');
const path = require('path');

async function processImages() {
  const hoodieInput = path.join(__dirname, '../public/images/hero/hero-hoodie-clean.png');
  const hoodieOutput = path.join(__dirname, '../public/images/hero/hero-hoodie-blend.png');
  
  const modelInput = path.join(__dirname, '../public/images/hero/hero-jesus-model.png');
  const modelOutput = path.join(__dirname, '../public/images/hero/hero-model-blend.png');

  // 1. Process Hoodie:
  // Dimensions: 435 x 435.
  // The hoodie occupies almost the full width and height.
  // We want the outer 25px rectangle boundary to feather smoothly to 100% transparent (alpha: 0)
  // while keeping the center 100% opaque.
  const hoodieSvg = `
    <svg width="435" height="435" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rGrad" cx="50%" cy="50%" r="50%">
          <stop offset="68%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="85%" stop-color="#fff" stop-opacity="0.85"/>
          <stop offset="94%" stop-color="#fff" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="435" height="435" fill="url(#rGrad)"/>
    </svg>
  `;

  await sharp(hoodieInput)
    .ensureAlpha()
    .composite([{ input: Buffer.from(hoodieSvg), blend: 'dest-in' }])
    .png()
    .toFile(hoodieOutput);
  console.log('Processed hoodie blend successfully');

  // 2. Process Model:
  // Dimensions: 1024 x 576.
  // Model is positioned on the right (x: 440 to 1024).
  // Left 45% (x: 0 to 460) must fade smoothly to 0% opacity to blend with the dark card.
  // Top edge (y: 0 to 40) and bottom edge (y: 530 to 576) fade to 0% opacity.
  // Right edge (x: 980 to 1024) fades to 0% opacity.
  const modelSvg = `
    <svg width="1024" height="576" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="28%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="42%" stop-color="#fff" stop-opacity="0.4"/>
          <stop offset="52%" stop-color="#fff" stop-opacity="0.95"/>
          <stop offset="60%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="95%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="5%" stop-color="#fff" stop-opacity="0.9"/>
          <stop offset="10%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="92%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <mask id="vMask">
          <rect width="1024" height="576" fill="url(#vGrad)"/>
        </mask>
      </defs>
      <rect width="1024" height="576" fill="url(#hGrad)" mask="url(#vMask)"/>
    </svg>
  `;

  await sharp(modelInput)
    .ensureAlpha()
    .composite([{ input: Buffer.from(modelSvg), blend: 'dest-in' }])
    .png()
    .toFile(modelOutput);
  console.log('Processed model blend successfully');
}

processImages().catch(err => {
  console.error('Error processing:', err);
  process.exit(1);
});
