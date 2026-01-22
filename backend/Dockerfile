# Multi-stage build for NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 8000

ENV PORT=8000
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
