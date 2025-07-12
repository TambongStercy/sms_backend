// Global type declarations for modules without proper type definitions
// This is a workaround for Vercel deployment issues

declare module 'express' {
    import * as http from 'http';

    export interface Request extends http.IncomingMessage {
        body: any;
        query: any;
        finalQuery: any;
        params: any;
        user?: any;
        ip: string;
        get(field: string): string | undefined;
    }

    export interface Response extends http.ServerResponse {
        json: (body: any) => void;
        status: (code: number) => Response;
        send: (body: any) => void;
        download(path: string, filename?: string, options?: any, fn?: (err?: Error) => void): void;
    }

    export interface NextFunction {
        (err?: any): void;
    }

    export interface Router {
        get: any;
        post: any;
        put: any;
        patch: any;
        delete: any;
        use: any;
    }

    export function Router(): Router;
    export function static(path: string): any;
    export function json(): any;
    export function urlencoded(options: { extended: boolean }): any;

    const express: {
        (): any;
        Router: typeof Router;
        static: typeof static;
        json: typeof json;
        urlencoded: typeof urlencoded;
    };

    export default express;
}

declare module 'swagger-ui-express' {
    import { RequestHandler } from 'express';
    export function serve(options?: any): RequestHandler;
    export function setup(spec: any, options?: any): RequestHandler;
}

declare module 'swagger-jsdoc' {
    function swaggerJsdoc(options: any): any;
    export default swaggerJsdoc;
}

declare module 'jsonwebtoken' {
    export function sign(payload: any, secret: string, options?: any): string;
    export function verify(token: string, secret: string, options?: any): any;
}

declare module 'bcrypt' {
    export function hash(data: string, rounds: number): Promise<string>;
    export function compare(data: string, hash: string): Promise<boolean>;
}

declare module 'cors' {
    function cors(options?: any): any;
    export default cors;
}

declare module 'morgan' {
    function morgan(format: string, options?: any): any;
    export default morgan;
}

declare module 'multer' {
    function multer(options?: any): any;
    export default multer;
}

declare module 'ejs' {
    export function render(template: string, data: any, options?: any): string;
    export function renderFile(path: string, data: any, options?: any, callback?: (err: Error, str: string) => void): void;
}

// Add more declarations as needed 