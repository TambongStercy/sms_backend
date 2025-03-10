# Deploying to Render

This document provides instructions for deploying the School Management System to Render.

## Prerequisites

- A Render account
- Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your Git repository
4. Configure the service:
   - Name: school-management-system (or your preferred name)
   - Environment: Node
   - Build Command: `npm run render-build`
   - Start Command: `npm start`

5. Add the following environment variables:
   - `NODE_ENV`: production
   - `DATABASE_URL`: Your Prisma database URL
   - `DATABASE_URI`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PUPPETEER_EXECUTABLE_PATH`: /usr/bin/google-chrome-stable

6. Click "Create Web Service"

## Troubleshooting Puppeteer Issues

If you encounter issues with Puppeteer and Chrome:

1. Check the build logs to ensure Chrome is being installed correctly

2. If you encounter build script errors:
   - Try using the alternative build command: `npm ci && npm run install-chrome && npm run build`
   - If shell scripts are preferred, try: `bash ./render-build-simple.sh`

3. If you still have issues, you can try manually installing Chrome in the Render dashboard:
   - Go to your web service
   - Click on "Shell"
   - Run: `npx puppeteer browsers install chrome`

## Alternative Approaches

If the npm script approach doesn't work, you can try:

1. Using the shell script directly:
   - Build Command: `bash ./render-build.sh`

2. Using the simplified shell script:
   - Build Command: `bash ./render-build-simple.sh`

## Notes

- The `package.json` includes a `render-build` script specifically for Render deployment
- The `PUPPETEER_EXECUTABLE_PATH` environment variable tells Puppeteer where to find Chrome 