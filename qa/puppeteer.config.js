module.exports = {
  launch: {
    dumpio: true,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--no-single-process',
      '--no-zygote',
      '--deterministic-fetch',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    ignoreDefaultArgs: ['--disable-extensions']
  }
}