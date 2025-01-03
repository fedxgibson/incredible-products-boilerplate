FROM node:18-alpine

ENV NODE_OPTIONS=--experimental-vm-modules

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]