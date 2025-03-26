/**
 * Convert camelCase string to snake_case
 * @param str String to convert
 * @returns snake_case string
 */
export const camelToSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case string to camelCase
 * @param str String to convert
 * @returns camelCase string
 */
export const snakeToCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert keys in object from camelCase to snake_case (recursive)
 * @param obj Object to convert
 * @returns Object with snake_case keys
 */
export const convertToSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertToSnakeCase(item));
    }

    return Object.keys(obj).reduce((acc: any, key: string) => {
        const snakeKey = camelToSnakeCase(key);
        acc[snakeKey] = convertToSnakeCase(obj[key]);
        return acc;
    }, {});
};

/**
 * Convert keys in object from snake_case to camelCase (recursive)
 * @param obj Object to convert
 * @returns Object with camelCase keys
 */
export const convertToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertToCamelCase(item));
    }

    return Object.keys(obj).reduce((acc: any, key: string) => {
        if (key.includes('_')) {
            const camelKey = snakeToCamelCase(key);
            acc[camelKey] = convertToCamelCase(obj[key]);
        } else {
            acc[key] = convertToCamelCase(obj[key]);
        }
        return acc;
    }, {});
}; 