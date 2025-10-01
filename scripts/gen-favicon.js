/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function main() {
  const svgPath = path.resolve(__dirname, '..', 'public', 'favicon.svg');
  const outIco = path.resolve(__dirname, '..', 'public', 'favicon.ico');
  if (!fs.existsSync(svgPath)) {
    throw new Error('favicon.svg not found at public/favicon.svg');
  }

  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) => sharp(svgPath).resize(size, size).png().toBuffer())
  );
  const ico = await toIco(pngBuffers);
  fs.writeFileSync(outIco, ico);
  console.log('Generated', outIco);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


