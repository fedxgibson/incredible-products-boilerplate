module.exports = {
  launch: {
    dumpio: true,
    ignoreHTTPSErrors: true,
    headless: 'new',
    args: [
      // Your existing args
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
      '--allow-insecure-localhost',
      '--no-single-process',
      '--no-zygote',
      '--deterministic-fetch',
      '--disable-features=IsolateOrigins,site-per-process',
      // Add these new flags
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--disable-features=BlockInsecurePrivateNetworkRequests'
    ],
    ignoreDefaultArgs: ['--disable-extensions']
  }
}