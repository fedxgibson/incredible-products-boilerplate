FROM node:lts-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json prisma ./
RUN npm install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy Prisma files and necessary node modules for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
RUN npm install --production=false prisma

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

COPY start.sh .

RUN chmod +x start.sh
CMD ["./start.sh"]