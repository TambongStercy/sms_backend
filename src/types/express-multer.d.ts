// Declaration for Express Multer interface (fixing "Namespace 'global.Express' has no exported member 'Multer'" error)

declare namespace Express {
    export interface Multer {
        single(fieldName: string): any;
        array(fieldName: string, maxCount?: number): any;
        fields(fields: Array<{ name: string, maxCount?: number }>): any;
        none(): any;
    }

    export interface Request {
        file?: any;
        files?: any;
    }
} 