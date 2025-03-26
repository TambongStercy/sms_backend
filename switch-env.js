#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Get the environment from command line argument
const env = process.argv[2]?.toLowerCase();

if (!env || (env !== 'development' && env !== 'production')) {
    console.error('Usage: node switch-env.js [development|production]');
    process.exit(1);
}

// Path to .env file
const envPath = path.join(__dirname, '.env');

try {
    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the NODE_ENV value
    envContent = envContent.replace(
        /NODE_ENV=["']?\w+["']?/,
        `NODE_ENV="${env}"`
    );

    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent);

    console.log(`Switched to ${env} environment`);
    console.log('Restart your application for changes to take effect');
} catch (error) {
    console.error('Error updating environment:', error);
    process.exit(1);
} 