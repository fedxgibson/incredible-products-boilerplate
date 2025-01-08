const fs = require('fs').promises;
const path = require('path');

async function takeScreenshot(page, name) {
  const screenshotsDir = global.SCREENSHOTS_DIR;
  
  // Create screenshots directory if it doesn't exist
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  // Create timestamp for unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  
  await page.screenshot({
    path: path.join(screenshotsDir, filename),
    fullPage: true
  });
}

module.exports = takeScreenshot;