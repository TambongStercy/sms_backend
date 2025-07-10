import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const TOKEN_EXPIRY = '24h';

interface TokenPayload {
    id: number;
    roles: string[];
}

export const generateToken = (payload: TokenPayload): string => {
    // The property in the token should be `role` (singular) to match your middleware
    const tokenPayload = {
        id: payload.id,
        role: payload.roles
    };
    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};
