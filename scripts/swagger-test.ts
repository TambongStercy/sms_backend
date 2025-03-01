import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Import the Swagger configuration
import swaggerOptions from '../src/config/swagger/swagger';

interface SwaggerSpec {
    paths?: Record<string, any>;
    components?: {
        schemas?: Record<string, any>;
    };
    [key: string]: any;
}

async function runTest() {
    try {
        // Generate the specification
        const swaggerSpec = swaggerOptions as SwaggerSpec;

        // Create the directory if it doesn't exist
        const dir = path.join(__dirname, '../swagger-output');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save the specification to a file
        fs.writeFileSync(
            path.join(dir, 'swagger-specification.json'),
            JSON.stringify(swaggerSpec, null, 2)
        );

        console.log('Swagger specification generated successfully!');
        console.log(`Saved to ${path.join(dir, 'swagger-specification.json')}`);

        // Check if the auth routes are properly documented
        const paths = swaggerSpec.paths || {};
        const authPaths = ['/auth/login', '/auth/register', '/auth/me'];

        let allAuthPathsFound = true;
        for (const authPath of authPaths) {
            if (!paths[authPath]) {
                console.error(`Error: Path "${authPath}" is not documented!`);
                allAuthPathsFound = false;
            } else {
                console.log(`Path "${authPath}" is properly documented.`);
            }
        }

        if (allAuthPathsFound) {
            console.log('All authentication routes are properly documented!');
        } else {
            console.error('Some authentication routes are missing documentation!');
        }

        // Check schemas
        const schemas = swaggerSpec.components?.schemas || {};
        const requiredSchemas = ['LoginRequest', 'LoginResponse', 'RegisterRequest', 'User'];

        let allSchemasFound = true;
        for (const schema of requiredSchemas) {
            if (!schemas[schema]) {
                console.error(`Error: Schema "${schema}" is not defined!`);
                allSchemasFound = false;
            } else {
                console.log(`Schema "${schema}" is properly defined.`);
            }
        }

        if (allSchemasFound) {
            console.log('All required schemas are properly defined!');
        } else {
            console.error('Some required schemas are missing!');
        }
    } catch (error) {
        console.error('Error generating Swagger documentation:', error);
        throw error;
    }
}

runTest().catch(console.error); 