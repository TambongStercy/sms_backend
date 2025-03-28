import { User } from '@prisma/client';
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            file?: Express.Multer.File;
            files?: Express.Multer.File[];
        }
    }
}

declare module 'express' {
    interface Request {
        user?: any;
        file?: Express.Multer.File;
        files?: Express.Multer.File[];
    }
} 