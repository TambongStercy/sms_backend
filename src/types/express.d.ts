import { Request as ExpressRequest, Response, NextFunction, Router } from 'express';
import { JwtPayload } from 'jsonwebtoken';
declare global {
    namespace Express {
        interface Request extends ExpressRequest {
            user?: JwtPayload;
            file?: Express.Multer.File;
            files?: Express.Multer.File[];
        }
    }
}

declare module 'express' {
    interface Request extends ExpressRequest {
        user?: JwtPayload;
        file?: Express.Multer.File;
        files?: Express.Multer.File[];
    }
}

export { Request, Response, NextFunction, Router }; 