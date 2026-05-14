# Base image
FROM node:20-alpine AS development

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and lock file
COPY package*.json pnpm-lock.yaml ./

# Install ALL dependencies (including dev)
RUN pnpm install

# Copy source code
COPY . .

# Start development server
CMD ["pnpm", "run", "start:dev"]

# Builder stage for production
FROM development AS builder
RUN pnpm build

# Production image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and lock file
COPY package*.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built assets
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose API port
EXPOSE 3000

# Start final server
CMD ["node", "dist/main"]
