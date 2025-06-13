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
    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        cacheControl: 'no-cache',
      },
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

function overlayText(text, input, output) {
  const svg  = Buffer.from(`
    <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font: 14px monospace; fill: white; }
      </style>
      <text x="0" y="10" dominant-baseline="top" text-anchor="left">
        ${text}
      </text>
    </svg>
  `);
  return sharp(input)
    .composite([{ input: svg, top: 0, left: 0 }])   // position as needed
    .png()                                          // keep it PNG; or .toFormat('png')
    .toFile(output);
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
  const dir = path.join(__dirname, 'static', 'img');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.screenshot({
    path: path.join(dir, `map-${location}-tmp.png`),
    clip: mapBox
  });

  await browser.close();

  const text = `${location}, ${getTime()}`;
  const finalImagePath = path.join(dir, `map-${location}.png`);
  await overlayText(text, path.join(dir, `map-${location}-tmp.png`), finalImagePath);
  
  // Upload to Google Cloud Storage
  await uploadToBucket(finalImagePath, `map-${location}.png`);
}

async function main() {
  for (const [location, coords] of Object.entries(locations)) {
    console.log(`Capturing map for ${location}...`);
    await captureMap(location, coords);
    console.log(`Completed ${location}`);
  }
}

main().catch(console.error);
