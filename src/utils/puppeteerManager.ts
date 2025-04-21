import puppeteer, { Browser, Page } from 'puppeteer';
import getPuppeteerConfig from './puppeteer.config';

let browserInstance: Browser | null = null;
let launchConfig: Record<string, any> | null = null;

/**
 * Initializes and returns a shared Puppeteer browser instance.
 * Launches the browser if it's not already running.
 * @returns {Promise<Browser>} The Puppeteer browser instance.
 */
async function getBrowser(): Promise<Browser> {
    if (!browserInstance) {
        console.log('Launching shared Puppeteer browser instance...');
        launchConfig = getPuppeteerConfig();
        try {
            browserInstance = await puppeteer.launch(launchConfig);
            console.log('Shared Puppeteer browser instance launched successfully.');

            browserInstance.on('disconnected', () => {
                console.error('Puppeteer browser disconnected unexpectedly!');
                browserInstance = null; // Reset instance so it relaunches on next call
            });

        } catch (error) {
            console.error('Failed to launch Puppeteer browser:', error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    // Ensure the browser is still connected
    if (browserInstance && !browserInstance.isConnected()) {
        console.warn('Existing browser instance was disconnected. Launching a new one...');
        await closeBrowser(); // Attempt to clean up the old one
        browserInstance = null; // Force relaunch
        return getBrowser(); // Retry getting the browser
    }
    return browserInstance!;
}

/**
 * Creates a new page in the shared browser instance.
 * @returns {Promise<Page>} A new Puppeteer page.
 */
export async function newPage(): Promise<Page> {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        // Optional: Add default configurations or listeners to the page here
        // page.on('error', err => console.error('Page error:', err));
        return page;
    } catch (error) {
        console.error('Failed to create new page:', error);
        // Attempt to close the potentially broken browser and relaunch?
        await closeBrowser();
        browserInstance = null;
        throw new Error('Failed to create new Puppeteer page, browser might have crashed.');
    }
}

/**
 * Closes the shared Puppeteer browser instance.
 * Should be called on application shutdown.
 */
export async function closeBrowser(): Promise<void> {
    if (browserInstance) {
        console.log('Closing shared Puppeteer browser instance...');
        try {
            await browserInstance.close();
            console.log('Shared Puppeteer browser instance closed.');
        } catch (error) {
            console.error('Error closing Puppeteer browser:', error);
        } finally {
            browserInstance = null;
        }
    }
}

// Graceful shutdown handling
process.on('exit', closeBrowser);
process.on('SIGINT', async () => { // Catches Ctrl+C
    await closeBrowser();
    process.exit(0);
});
process.on('SIGTERM', async () => { // Catches termination signals
    await closeBrowser();
    process.exit(0);
});
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    // Optionally try to close browser, but the process state might be unstable
    // await closeBrowser();
    process.exit(1); // Exit with error code
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally try to close browser
    // await closeBrowser();
    process.exit(1); // Exit with error code
}); 