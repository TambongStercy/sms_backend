/**
 * Puppeteer configuration options to ensure compatibility in both development and production environments
 * 
 * In production (such as on Render), this will use the system-installed Chromium
 * In development, it will use the version bundled with Puppeteer
 */
export const getPuppeteerConfig = (): Record<string, any> => {
    // Base configuration
    const config: Record<string, any> = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
    };

    // If running in production and PUPPETEER_EXECUTABLE_PATH is set (e.g., on Render)
    if (process.env.NODE_ENV === 'production' && process.env.PUPPETEER_EXECUTABLE_PATH) {
        config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    return config;
};

export default getPuppeteerConfig; 