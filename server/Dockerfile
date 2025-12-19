# ============================================
# LUXETHREAD - BACKEND DOCKERFILE
# Production-optimized Node.js container
# ============================================

# Use Node 18 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
# Copy package files first for better layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy application source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Set ownership
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port (will be set via environment variable)
EXPOSE ${PORT:-5000}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/ || exit 1

# Start the server
CMD ["node", "server.js"]
