
let chromeArgs = [
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
]

if (!!process.env.DEBUG) {
  chromeArgs = chromeArgs.concat([
    '--auto-open-devtools-for-tabs',  // This will auto-open DevTools
    '--remote-debugging-address=0.0.0.0',
    '--remote-debugging-port=9222'
  ])
}

const launch = {
  dumpio: true,
  ignoreHTTPSErrors: true,
  headless: !!process.env.DEBUG || 'new',
  devtools: !!process.env.DEBUG,
  args: chromeArgs,
  ignoreDefaultArgs: ['--disable-extensions']
}

module.exports = { launch }