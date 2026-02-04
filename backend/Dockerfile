FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 openssl make g++ curl openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS prisma
COPY prisma ./prisma/
RUN npx prisma generate

FROM prisma AS builder
COPY . .
RUN npm run build

# Migrations stage
FROM node:20-alpine AS migrations

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install
# Install dependencies (include Prisma CLI)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:20-alpine AS production

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat curl openssl
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm install --omit=dev
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Install wget for healthcheck
RUN apk add --no-cache wget
RUN mkdir -p /app/uploads/kyc && \
    chown -R nestjs:nodejs /app/uploads

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]