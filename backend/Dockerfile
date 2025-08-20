# Multi-stage build for Node.js TypeScript backend
# Stage 1: Build stage
FROM node:18-alpine AS builder
# Install pnpm globally
RUN npm install -g pnpm
# Set working directory
WORKDIR /app
# Copy package files
COPY package.json pnpm-lock.yaml ./
# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile
# Copy source code and configuration files
COPY tsconfig.json ./
COPY src/ ./src/
# Build TypeScript to JavaScript
RUN pnpm run build
# Stage 2: Production stage
FROM node:18-alpine AS production
# Install pnpm globally
RUN npm install -g pnpm
# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
adduser -S backend -u 1001
# Set working directory
WORKDIR /app
# Copy package files
COPY package.json pnpm-lock.yaml ./
# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod && \
pnpm store prune
# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
# Change ownership to non-root user
RUN chown -R backend:nodejs /app
USER backend
# Expose port (default from server.ts)
EXPOSE 3000
# Start the application
CMD ["node", "dist/server.js"]