declare module 'swagger-jsdoc' {
    export interface Options {
        definition: {
            openapi: string;
            info: {
                title: string;
                version: string;
                description: string;
                license?: {
                    name: string;
                    url: string;
                };
                contact?: {
                    name: string;
                    url: string;
                    email: string;
                };
            };
            servers?: Array<{
                url: string;
                description: string;
            }>;
            components?: {
                securitySchemes?: Record<string, any>;
                schemas?: Record<string, any>;
                responses?: Record<string, any>;
            };
            security?: Array<Record<string, any>>;
            [key: string]: any;
        };
        apis: string | string[];
    }

    function swaggerJsdoc(options: Options): any;
    export default swaggerJsdoc;
}

// Export the Options interface for direct import
export interface Options {
    definition: {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
            license?: {
                name: string;
                url: string;
            };
            contact?: {
                name: string;
                url: string;
                email: string;
            };
        };
        servers?: Array<{
            url: string;
            description: string;
        }>;
        components?: {
            securitySchemes?: Record<string, any>;
            schemas?: Record<string, any>;
            responses?: Record<string, any>;
        };
        security?: Array<Record<string, any>>;
        [key: string]: any;
    };
    apis: string | string[];
} 