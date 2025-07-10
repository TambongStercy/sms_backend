import { User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            ip: string;
            path: string;
            get(field: string): string | undefined;
        }
    }
} 