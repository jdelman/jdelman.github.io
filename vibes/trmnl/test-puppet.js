// call with GOOGLE_APPLICATION_CREDENTIALS=google-service-account-credentials.json node test-puppet.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const bucket = storage.bucket('trmnl-flight-map');

const locations = {
  "port-st-lucie": [27.253465970793197, -80.45804049072981],
  "monroe-township": [40.32511951903072, -74.38012104697023],
}

async function uploadToBucket(filePath, destination) {
  try {
    const metadata = {
      // For HTML files, set no-cache to force browser reload
      // For PNG files, keep the existing no-cache setting
      cacheControl: destination.endsWith('.html') ? 'no-cache, no-store, must-revalidate' : 'no-cache',
    };

    await bucket.upload(filePath, {
      destination: destination,
      metadata: metadata,
    });
    console.log(`${filePath} uploaded to ${destination}`);
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    throw error;
  }
}

function getTime() {
  const now = new Date();

  // build the two chunks separately so you can drop the seconds
  const datePart = now.toLocaleDateString('en-US', {
    month: 'long',   // "June"
    day: 'numeric',  // "12"
    year: 'numeric'  // "2026"
  });

  const timePart = now.toLocaleTimeString('en-US', {
    hour:   'numeric', // "5"
    minute: '2-digit', // "20"
    hour12: true       // "PM"
  });

  return `${datePart} @ ${timePart}`;
}

// Floyd–Steinberg dithering function
function floydSteinbergDither(imageData, width, height) {
  const data = Uint8ClampedArray.from(imageData);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const oldPixel = data[i];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      data[i] = newPixel;

      if (x + 1 < width) data[i + 1] += error * 7 / 16;
      if (x > 0 && y + 1 < height) data[i + width - 1] += error * 3 / 16;
      if (y + 1 < height) data[i + width] += error * 5 / 16;
      if (x + 1 < width && y + 1 < height) data[i + width + 1] += error * 1 / 16;
    }
  }

  return data;
}

function generateHTML(imageUrl) {
  return `<!DOCTYPE html>
<html>
    <head>
        <style>
            body {margin: 0; padding: 0;}
        </style>
    </head>
    <body>
        <img src="https://storage.googleapis.com/trmnl-flight-map/${imageUrl}" />
    </body>
</html>`;
}

async function captureMap(location, coords) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--enable-blink-features=GeolocationOverride']
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://www.flightaware.com', ['geolocation']);

  const page = await browser.newPage();

  // Set your fake geolocation
  await page.setGeolocation({
    latitude: coords[0],
    longitude: coords[1],
    accuracy: 5
  });

  await page.goto('https://www.flightaware.com/live/map', { waitUntil: 'networkidle2' });

  // 1. Resize the map div
  await page.evaluate(() => {
    const mapDiv = document.getElementById('mapContainer');
    if (mapDiv) {
      mapDiv.style.width = '800px';
      mapDiv.style.height = '480px';
    }
  });

  // 2. Click the zoom to location button
  await page.waitForSelector('a[title="Zoom to my location"]');
  await page.click('a[title="Zoom to my location"]');

  // Wait for location to update
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.click('a[title="Zoom to my location"]');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Remove the ad div + UI elements
  await page.evaluate(() => {
    const elementsToRemove = [
      '#Ad',
      '.ol-attribution',
      '.ol-filter-ui',
      '.fa-map-logo',
      '.ol-panzoom-control',
      '.ol-layer-ui'
    ];
    
    elementsToRemove.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    });
  });

  // 3. Take screenshot of the map
  const mapElement = await page.$('#mapContainer');
  const mapBox = await mapElement.boundingBox();
  
  // Ensure the directory exists
  const dir = path.join(__dirname, 'bucket-data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const browserImagePath = path.join(dir, `map-${location}-tmp.png`);
  const finalImagePath = path.join(dir, `map-${location}-${timestamp}.png`);
  const htmlPath = path.join(dir, `${location}.html`);

  await page.screenshot({
    path: browserImagePath,
    clip: mapBox
  });

  await browser.close();

  // image pipline should be:
  // 1. add text
  // 2. contrast
  // 3. dither
  // 4. save

  const svg = Buffer.from(`
    <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font: 14px monospace; fill: white; }
      </style>
      <text x="0" y="10" dominant-baseline="top" text-anchor="left">
        ${location}, ${getTime()}
      </text>
    </svg>
  `);

  const contrastFactor = 1.5;
  const { data, info } = await sharp(browserImagePath)
    // Add text
    .composite([{ input: svg, top: 0, left: 0 }])
    // Convert to grayscale and apply contrast
    .grayscale()
    .linear(contrastFactor, -(128 * (contrastFactor - 1))) // contrast adjustment
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Apply dithering
  const dithered = floydSteinbergDither(data, info.width, info.height);

  await sharp(Buffer.from(dithered), {
    raw: {
      width: info.width,
      height: info.height,
      channels: 1
    }
  })
    .png({ palette: true, colors: 2 }) // 2-color palette output
    .toFile(finalImagePath)
  
  // Upload to Google Cloud Storage
  await uploadToBucket(finalImagePath, `map-${location}-${timestamp}.png`);
  
  // Generate and save HTML
  const html = generateHTML(`map-${location}-${timestamp}.png`);
  fs.writeFileSync(htmlPath, html);
  await uploadToBucket(htmlPath, `${location}.html`);
}

async function main() {
  for (const [location, coords] of Object.entries(locations)) {
    console.log(`Capturing map for ${location}...`);
    await captureMap(location, coords);
    console.log(`Completed ${location}`);
  }
}

main().catch(console.error);
