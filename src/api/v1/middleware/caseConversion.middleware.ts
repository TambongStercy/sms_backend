import { Request, Response, NextFunction } from 'express';

/**
 * Convert camelCase string to snake_case
 * @param str String to convert
 * @returns snake_case string
 */
const camelToSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case string to camelCase
 * @param str String to convert
 * @returns camelCase string
 */
const snakeToCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 * @param obj Object to convert
 * @returns Object with snake_case keys
 */
const convertObjectKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertObjectKeys(item));
    }

    return Object.keys(obj).reduce((acc: any, key: string) => {
        const snakeKey = camelToSnakeCase(key);
        acc[snakeKey] = convertObjectKeys(obj[key]);
        return acc;
    }, {});
};

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 * @param obj Object to convert
 * @returns Object with camelCase keys
 */
const convertObjectKeysToClient = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertObjectKeysToClient(item));
    }

    return Object.keys(obj).reduce((acc: any, key: string) => {
        if (key.includes('_')) {
            const camelKey = snakeToCamelCase(key);
            acc[camelKey] = convertObjectKeysToClient(obj[key]);
        } else {
            acc[key] = convertObjectKeysToClient(obj[key]);
        }
        return acc;
    }, {});
};

/**
 * Middleware that converts all camelCase keys in request body and query to snake_case
 * This ensures the API can accept camelCase parameters from clients while using snake_case internally
 */
export const convertCamelToSnakeCase = (req: Request, res: Response, next: NextFunction) => {
    // Convert request body if it exists
    if (req.body && Object.keys(req.body).length > 0) {
        req.body = convertObjectKeys(req.body);
    }

    // Convert query parameters if they exist
    if (req.query && Object.keys(req.query).length > 0) {
        const convertedQuery: any = {};

        // Convert each query parameter
        for (const [key, value] of Object.entries(req.query)) {
            const snakeKey = camelToSnakeCase(key);
            convertedQuery[snakeKey] = value;
        }

        req.query = convertedQuery;
    }

    next();
};

/**
 * Middleware that converts all snake_case keys in response body to camelCase
 * This ensures the API returns camelCase format expected by clients
 */
export const convertSnakeToCamelCase = (req: Request, res: Response, next: NextFunction) => {
    // Store the original res.json method
    const originalJson = res.json;

    // Override the res.json method
    res.json = function (body: any): Response {
        // Convert the response body from snake_case to camelCase
        const convertedBody = convertObjectKeysToClient(body);

        // Call the original json method with the converted body
        return originalJson.call(this, convertedBody);
    };

    next();
}; 