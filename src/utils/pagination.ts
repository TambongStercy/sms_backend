import { Prisma } from '@prisma/client';

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
    [key: string]: any;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Creates a paginated query for Prisma
 * @param model The Prisma model to query
 * @param paginationOptions Pagination options (page, limit, sortBy, sortOrder)
 * @param filterOptions Filter criteria
 * @param includeOptions Relations to include
 * @returns A promise with the paginated results
 */
export async function paginate<T>(
    model: any,
    paginationOptions: PaginationOptions = {},
    filterOptions: FilterOptions = {},
    includeOptions: Prisma.Enumerable<any> = {}
): Promise<PaginatedResult<T>> {
    // Default pagination values
    const page = paginationOptions.page || 1;
    const limit = paginationOptions.limit || 10;
    const skip = (page - 1) * limit;

    // Process filter options - convert string values that should be numbers
    const processedFilters: any = {};
    Object.entries(filterOptions).forEach(([key, value]) => {
        // Skip empty values
        if (value === undefined || value === null || value === '') {
            return;
        }

        // Handle search by name (case insensitive)
        if (key === 'name' && typeof value === 'string') {
            processedFilters.name = {
                contains: value,
                mode: 'insensitive'
            };
        }
        // Handle numeric IDs
        else if ((key.endsWith('_id') || key === 'id') && typeof value === 'string') {
            const numericValue = parseInt(value);
            if (!isNaN(numericValue)) {
                processedFilters[key] = numericValue;
            }
        }
        // Handle boolean values
        else if (value === 'true' || value === 'false') {
            processedFilters[key] = value === 'true';
        }
        // Handle other fields
        else {
            processedFilters[key] = value;
        }
    });

    // Build where conditions
    const where = Object.keys(processedFilters).length > 0 ? processedFilters : undefined;

    // Build orderBy
    let orderBy = undefined;
    if (paginationOptions.sortBy) {
        orderBy = {
            [paginationOptions.sortBy]: paginationOptions.sortOrder || 'asc'
        };
    }

    // Count total records
    const total = await model.count({ where });

    // Fetch paginated data
    const data = await model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: includeOptions
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Return paginated result
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages
        }
    };
}

/**
 * Extract pagination and filter parameters from request query
 * @param query The request query object
 * @param allowedFilters Array of filter field names that are allowed
 * @returns Object containing pagination options and filter options
 */
export function extractPaginationAndFilters(
    query: any,
    allowedFilters: string[] = []
): { paginationOptions: PaginationOptions, filterOptions: FilterOptions } {
    // Extract pagination params
    const page = query.page ? parseInt(query.page) : undefined;
    const limit = query.limit ? parseInt(query.limit) : undefined;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const paginationOptions: PaginationOptions = {
        page,
        limit,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
    };

    // Extract filter params
    const filterOptions: FilterOptions = {};
    allowedFilters.forEach(filter => {
        if (query[filter] !== undefined) {
            filterOptions[filter] = query[filter];
        }
    });

    return { paginationOptions, filterOptions };
} 