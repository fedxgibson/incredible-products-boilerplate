module.exports = {
  launch: {
    dumpio: true,
    headless: 'new',
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
      '--disable-features=VizDisplayCompositor',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ],
    ignoreDefaultArgs: ['--disable-extensions']
  }
}