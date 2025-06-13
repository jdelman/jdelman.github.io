const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const morgan = require('morgan');

// Atkinson dithering implementation
function atkinsonDithering(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const channels = imageData.channels;
    
    // Convert to grayscale if not already
    for (let i = 0; i < data.length; i += channels) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
    }

    // Atkinson dithering
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * channels;
            const oldPixel = data[idx];
            const newPixel = oldPixel < 128 ? 0 : 255;
            data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
            
            const error = oldPixel - newPixel;
            
            // Distribute error to neighboring pixels
            if (x + 1 < width) {
                data[idx + channels] += error * 1/8;
                if (y + 1 < height) {
                    data[idx + width * channels + channels] += error * 1/8;
                }
            }
            if (x + 2 < width) {
                data[idx + channels * 2] += error * 1/8;
            }
            if (y + 1 < height) {
                data[idx + width * channels] += error * 1/8;
                if (x - 1 >= 0) {
                    data[idx + width * channels - channels] += error * 1/8;
                }
                if (x + 1 < width) {
                    data[idx + width * channels + channels] += error * 1/8;
                }
            }
            if (y + 2 < height) {
                data[idx + width * channels * 2] += error * 1/8;
            }
        }
    }
    
    return imageData;
}

async function captureScreenshot(shouldDither = false) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Set viewport to 800x480
        await page.setViewport({
            width: 800,
            height: 480
        });

        // Navigate to the local page
        await page.goto(`http://localhost:${port}`, {
            waitUntil: 'networkidle0' // Wait until network is idle
        });

        // Wait for the map to load
        await page.waitForFunction(() => {
            return document.querySelector('#map') !== null;
        });

        // Take screenshot
        const screenshotBuffer = await page.screenshot({
            fullPage: false
        });

        // Process the image
        let processedImage;
        if (shouldDither) {
            // Process with Atkinson dithering
            processedImage = await sharp(screenshotBuffer)
                .raw()
                .toBuffer({ resolveWithObject: true })
                .then(({ data, info }) => {
                    const imageData = {
                        data: data,
                        width: info.width,
                        height: info.height,
                        channels: info.channels
                    };
                    const dithered = atkinsonDithering(imageData);
                    return sharp(dithered.data, {
                        raw: {
                            width: dithered.width,
                            height: dithered.height,
                            channels: dithered.channels
                        }
                    });
                });
        } else {
            // Just convert to PNG without dithering
            processedImage = sharp(screenshotBuffer);
        }

        // Ensure the static/img directory exists
        const imgDir = path.join(__dirname, 'static', 'img');
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }

        // Save the processed image with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `map-screenshot-${timestamp}.png`;
        const outputPath = path.join(imgDir, filename);
        await processedImage.png().toFile(outputPath);

        await browser.close();
        return `img/${filename}`;  // Return relative path
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        throw error;
    }
}

const app = express();
const port = 3000;

// Add Apache-style logging
app.use(morgan('combined'));

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, 'static')));

// POST endpoint to capture screenshot
app.post('/capture-screenshot', async (req, res) => {
    try {
        const shouldDither = req.query.dither === 'true';
        const relativePath = await captureScreenshot(shouldDither);
        res.status(200).json({
            success: true,
            message: 'Screenshot captured successfully',
            path: relativePath,
            dithering: shouldDither
        });
    } catch (error) {
        console.error('Error in /capture-screenshot endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to capture screenshot',
            error: error.message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 