#!/usr/bin/env bash
# This script is used by Render to build and deploy the application

# Exit on error
set -o errexit

# Install Chromium for Puppeteer
apt-get update
apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

# Set environment variables for Puppeteer
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Clean install of dependencies
npm ci

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Build the application
npm run build 