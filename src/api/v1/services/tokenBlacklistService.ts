/**
 * Simple token blacklist service
 * 
 * In a production environment, this would likely use Redis or another persistence mechanism
 * to store tokens across application restarts and across multiple instances.
 */

interface BlacklistedToken {
    token: string;
    expiresAt: number; // Timestamp when the token expires
}

// In-memory blacklist of tokens
let tokenBlacklist: BlacklistedToken[] = [];

/**
 * Add a token to the blacklist
 * @param token - The JWT token to blacklist
 * @param expirationTime - Optional expiration time in seconds (defaults to 24 hours)
 */
export function blacklistToken(token: string, expirationTime = 24 * 60 * 60): void {
    // Calculate expiry timestamp (current time + expiration time in seconds)
    const expiresAt = Math.floor(Date.now() / 1000) + expirationTime;

    // Add token to blacklist
    tokenBlacklist.push({ token, expiresAt });

    // Clean up expired tokens to prevent memory leaks
    cleanupExpiredTokens();
}

/**
 * Check if a token is blacklisted
 * @param token - The JWT token to check
 * @returns true if the token is blacklisted, false otherwise
 */
export function isTokenBlacklisted(token: string): boolean {
    cleanupExpiredTokens();
    return tokenBlacklist.some(item => item.token === token);
}

/**
 * Remove expired tokens from the blacklist
 */
function cleanupExpiredTokens(): void {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    tokenBlacklist = tokenBlacklist.filter(item => item.expiresAt > currentTimestamp);
}

/**
 * Get the current size of the blacklist (for debugging/monitoring)
 * @returns The number of blacklisted tokens
 */
export function getBlacklistSize(): number {
    return tokenBlacklist.length;
}

// Periodically clean up the blacklist (every hour)
setInterval(cleanupExpiredTokens, 60 * 60 * 1000); 