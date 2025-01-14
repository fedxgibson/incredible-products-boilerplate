const setupDebugListeners = async (page) => {
  // Enable request interception
  await page.setRequestInterception(true);

  // Log all requests
  page.on('request', request => {
    console.log(`➡️ ${request.method()} ${request.url()}`);
    const postData = request.postData();
    if (postData) {
      console.log('POST Data:', postData);
    }
    request.continue();
  });

  // Log all responses
  page.on('response', async response => {
    const request = response.request();
    console.log(`⬅️ ${response.status()} ${request.method()} ${request.url()}`);
    try {
      const contentType = response.headers()['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        console.log('Response Data:', json);
      }
    } catch (e) {
      // Ignore response body parsing errors
    }
  });

  // Log console messages
  page.on('console', msg => {
    const type = msg.type().toUpperCase();
    console.log(`🌐 Console ${type}: ${msg.text()}`);
  });

  // Log errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  // Log network errors
  page.on('requestfailed', request => {
    console.error('❌ Request Failed:', request.url(), request.failure().errorText);
  });
};

module.exports = { setupDebugListeners };