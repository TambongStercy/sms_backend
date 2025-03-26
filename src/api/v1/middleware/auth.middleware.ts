/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         JWT authentication for API endpoints. 
 *         Tokens are obtained from the `/auth/login` endpoint and should be included
 *         in the Authorization header as `Bearer {token}`.
 *         
 *         Tokens are valid for 24 hours after which they expire and a new login is required.
 *         Tokens can be invalidated before expiration by using the `/auth/logout` endpoint.
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: |
 *         Access token is missing, invalid, or expired.
 *         This response is returned when:
 *         - No token is provided in the Authorization header
 *         - The token format is invalid
 *         - The token has been blacklisted (after logout)
 *         - The token signature is invalid
 *         - The token has expired
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: Descriptive error message
 *                 enum:
 *                   - No token provided
 *                   - Invalid token
 *                   - Token expired
 *                   - Token has been invalidated
 *                   - Unauthorized
 *     ForbiddenError:
 *       description: |
 *         User does not have sufficient permissions to access the resource.
 *         This occurs when the user is authenticated but lacks the required role.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: Forbidden: Insufficient permissions
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../services/tokenBlacklistService';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * JWT token payload interface
 * This defines what is stored in the JWT token
 */
export interface JwtPayload {
    id: number;
    email: string;
    role?: [string];
    [key: string]: any;
}

// Add the user property to the Express Request interface directly
// This augmentation approach avoids conflicts with other declarations
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Extended Request interface that includes the user property
 * This is used for better code readability and type safety
 */
export type AuthenticatedRequest = Request;

/**
 * Authentication middleware that verifies JWT tokens
 * 
 * This middleware:
 * 1. Extracts the token from the Authorization header
 * 2. Checks if the token is blacklisted (logged out)
 * 3. Verifies the token's signature and expiration
 * 4. Adds the decoded user information to the request object
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        // Check if auth header exists and starts with 'Bearer '
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        // Extract token from header
        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        // if(token == 'abcd1234'){
        //     next()
        // }

        // Check if token is blacklisted (logged out)
        if (isTokenBlacklisted(token)) {
            res.status(401).json({ error: 'Token has been invalidated' });
            return;
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Add user to request object
        (req as AuthenticatedRequest).user = decoded;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
        } else {
            res.status(500).json({ error: 'Server error during authentication' });
        }
    }
};

/**
 * Middleware for authorization based on user roles
 * 
 * This middleware:
 * 1. Checks if the user is authenticated
 * 2. Verifies if the user's role is included in the list of allowed roles
 * 3. Returns a 403 Forbidden response if the user doesn't have the required role
 * 
 * @param roles - Array of roles allowed to access the route
 * @returns Middleware function that checks if user has allowed role
 * 
 * @example
 * // Allow only teachers and principals to access a route
 * router.get('/grades', authenticate, authorize(['TEACHER', 'PRINCIPAL']), gradesController.getGrades);
 */
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {



        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Check if user's role is in the allowed roles
        if (req.user.role && roles.some(role => req.user!.role!.includes(role))) {
            next();
        } else {
            console.log(req.user?.role);
            console.log(roles);
            res.status(403).json({ error: `Forbidden: Insufficient permissions(Your Role: ${req.user?.role})` });
        }
    };
}; 