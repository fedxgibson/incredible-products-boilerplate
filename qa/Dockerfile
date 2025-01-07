FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libpangocairo-1.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    dbus \
    dbus-x11 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up D-Bus system daemon
RUN mkdir -p /var/run/dbus \
    && mkdir -p /var/run/dbus/system_bus_socket \
    && dbus-uuidgen > /var/lib/dbus/machine-id \
    && chmod -R 755 /var/run/dbus

# Configure environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV DBUS_SESSION_BUS_ADDRESS=unix:path=/var/run/dbus/system_bus_socket

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Create entrypoint script
RUN echo '#!/bin/bash\ndbus-daemon --system --fork\nexec "$@"' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]