


# DEBUG CHROME QA

- Open Chrome on your host machine
- Go to chrome://inspect
- Click "Configure..." and add localhost:9229 to the target discovery settings
- You should see your Node.js process appear under "Remote Target"
- Click "inspect" to open the DevTools for the Node.js process
- In a separate tab, go to http://localhost:9222 to see the Chrome DevTools for the Puppeteer browser
