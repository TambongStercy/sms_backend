#!/bin/bash
set -e
npm ci
npx puppeteer browsers install chrome
npm run build 