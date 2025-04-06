# Stage 1: Builder Stage - Install dependencies, generate Prisma client, and build TypeScript
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client (needed for build step if using generated types)
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Build the TypeScript application
# This should compile TS to JS in the /dist folder and copy assets (like views/reports)
RUN npm run build

# Optional: Prune devDependencies before creating the final image layer cache
# RUN npm prune --production


# Stage 2: Production Stage - Install production dependencies and run the app
FROM node:18-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files and install *only* production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma schema (needed for runtime migrations and client)
COPY --from=builder /app/prisma ./prisma

# Copy node_modules (needed for prisma runtime) from builder to ensure Prisma CLI works if needed at runtime
# Adjust if your start script doesn't rely on npx prisma etc. directly
# If npm start just runs 'node dist/server.js', you might not need this copy
COPY --from=builder /app/node_modules ./node_modules


# Expose the port the application will run on (adjust if different)
# Ensure this matches the PORT environment variable your app uses
EXPOSE 4000

# Run as a non-root user for security
USER node

# Command to run the application
# This assumes 'npm start' script in package.json runs the production server (e.g., 'node dist/index.js')
# It also includes running Prisma migrations on startup.
# WARNING: Running migrations on startup can be problematic with multiple replicas.
# Consider running 'npx prisma migrate deploy' as a separate step after deployment
# or using an init container if your setup supports it.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

# --- Alternative CMD if you run migrations manually ---
# CMD ["npm", "start"]
# --- End Alternative CMD --- 