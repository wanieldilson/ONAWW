# Multi-stage build for One Night a Werewolf game

# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build the backend
RUN npm run build

# Stage 3: Production runtime
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

# Copy backend production dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend from builder stage
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend from builder stage
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Change ownership to app user
RUN chown -R appuser:appuser /app

# Switch to app user
USER appuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application with dumb-init
WORKDIR /app/backend
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
