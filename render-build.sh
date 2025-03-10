#!/bin/bash
# Exit on error
set -e

# Install dependencies
npm ci

# Install Chrome for Puppeteer
echo "Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

# Build the application
npm run build

echo "Build completed successfully!" 