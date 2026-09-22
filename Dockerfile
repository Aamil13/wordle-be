# =============================================================================
# BUILD STAGE - Compiles TypeScript to JavaScript
# =============================================================================

# Use Node.js 20 Alpine Linux image for smaller size
# Alpine is a minimal Linux distribution, perfect for containers
FROM node:20-alpine AS builder

# Set working directory to /app inside the container
# All subsequent commands will run from this directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
# Using * to copy both package.json and package-lock.json if they exist
# This is done before copying source code to leverage Docker layer caching
COPY package*.json ./

# Install dependencies using npm ci (clean install)
# ci is faster and more reliable than install, uses exact versions from lock file
# This ensures reproducible builds across different environments
RUN npm ci

# Copy all source code from current directory to /app in container
# This includes TypeScript files, config files, and everything else
COPY . .

# Build the TypeScript project to JavaScript
# Runs the build script defined in package.json (tsc)
# Output goes to dist/ directory as specified in tsconfig.json
RUN npm run build

# =============================================================================
# PRODUCTION STAGE - Creates minimal runtime image
# =============================================================================

# Use Node.js 20 Alpine Linux image for production
# Starting fresh to avoid including build tools and dev dependencies
FROM node:20-alpine AS production

# Set working directory to /app inside the container
WORKDIR /app

# Set NODE_ENV environment variable to production
# This tells Node.js and your app to run in production mode
# Often enables optimizations and disables debug features
ENV NODE_ENV=production

# Copy package.json and package-lock.json to the container
# Needed to install production dependencies only
COPY package*.json ./

# Install only production dependencies (skip devDependencies)
# --omit=dev (or --production) installs only runtime dependencies
# This reduces image size by excluding development tools
RUN npm ci --omit=dev

# Copy the compiled JavaScript files from the build stage
# --from=builder specifies to copy from the builder stage we created earlier
# /app/dist in builder becomes ./dist in production stage
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
# Running as root is a security risk, so we create a dedicated user
# addgroup creates a group with GID 1001
# adduser creates a user with UID 1001 in the nodejs group
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Create logs directory and set proper permissions
# Create the logs directory before switching to non-root user
# Set ownership to nodejs user so the app can write to it
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Expose port 8000 for external access
# This is a documentation hint that the app listens on port 8000
# Doesn't actually publish the port (use -p in docker run for that)
# Note: The actual port is configurable via PORT environment variable
EXPOSE 8000

# Switch to the non-root user for subsequent commands
# All following commands run as the nodejs user instead of root
USER nodejs

# Set the default command to run when container starts
# Uses exec form (JSON array) for proper signal handling
# Runs the compiled JavaScript server file
CMD ["node", "dist/server.js"]
