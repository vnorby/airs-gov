const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateImages() {
  // Read SVG files
  const faviconSvg = fs.readFileSync(path.join(__dirname, 'favicon.svg'));
  const ogSvg = fs.readFileSync(path.join(__dirname, 'og-image.svg'));

  // Generate favicon-32.png
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'favicon-32.png'));
  console.log('Created favicon-32.png');

  // Generate apple-touch-icon.png
  await sharp(faviconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Generate og-image.png
  await sharp(ogSvg)
    .resize(1200, 630)
    .png()
    .toFile(path.join(__dirname, 'og-image.png'));
  console.log('Created og-image.png');

  // Generate twitter-graphic.png
  if (fs.existsSync(path.join(__dirname, 'twitter-graphic.svg'))) {
    const twitterSvg = fs.readFileSync(path.join(__dirname, 'twitter-graphic.svg'));
    await sharp(twitterSvg)
      .resize(1200, 675)
      .png()
      .toFile(path.join(__dirname, 'twitter-graphic.png'));
    console.log('Created twitter-graphic.png');
  }

  console.log('All images generated successfully!');
}

generateImages().catch(console.error);
