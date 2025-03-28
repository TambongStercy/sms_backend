import { JwtPayload } from 'jsonwebtoken';
import { Gender } from '../../src/types/enums';
import { Request as ExpressRequest } from 'express-serve-static-core';

declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            name: string;
            gender: Gender;
            date_of_birth: Date;
            photo: string;
            phone: string;
            address: string;
            password: string;
            id_card_num: string;
            created_at: Date;
            updated_at: Date;
            role?: string[];
            iat?: number;
            exp?: number;
        }

        interface Request extends ExpressRequest {
            user?: User & JwtPayload;
        }
    }
}

export { }; 