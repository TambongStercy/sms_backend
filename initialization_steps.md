# Project Initialization Steps

This document outlines the steps to initialize the school management system API project.

## Prerequisites

*   Node.js and npm installed.
*   PostgreSQL installed and running.
*   A PostgreSQL database created for the project.

## Steps

1.  **Project Initialization:**

    ```bash
    mkdir school-management-api
    cd school-management-api
    npm init -y  # Initialize Node.js project with default settings
    npm install express @types/express cors dotenv
    npm install --save-dev typescript @types/node ts-node nodemon
    tsc --init --rootDir src --outDir build --esModuleInterop --resolveJsonModule --lib es6 --module commonjs --allowJs true --noImplicitAny true
    ```

    *   `mkdir school-management-api`: Creates the project directory.
    *   `cd school-management-api`: Navigates into the project directory.
    *   `npm init -y`: Initializes a `package.json` file with default settings.
    *   `npm install express @types/express cors dotenv`: Installs Express (web framework), type definitions for Express, CORS (Cross-Origin Resource Sharing) middleware, and dotenv (for loading environment variables).
    *   `npm install --save-dev typescript @types/node ts-node nodemon`: Installs TypeScript, type definitions for Node.js, ts-node (for running TypeScript directly), and nodemon (for automatic server restarts on file changes) as development dependencies.
    *   `tsc --init ...`: Initializes a `tsconfig.json` file with recommended settings.

2.  **Prisma Setup:**

    ```bash
    npm install @prisma/client
    npm install --save-dev prisma
    npx prisma init --datasource-provider postgresql
    ```
    *  `npm install @prisma/client`: Installs the Prisma Client.
    *   `npm install --save-dev prisma`: Installs the Prisma CLI as a development dependency.
    *   `npx prisma init --datasource-provider postgresql`: Initializes Prisma for PostgreSQL. This creates a `prisma` directory with a `schema.prisma` file.

    **Configure PostgreSQL Connection:**

    *   Edit the `.env` file in the project root and add your PostgreSQL connection URL:

        ```
        DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
        ```

        Replace `user`, `password`, `host`, `port`, and `database` with your actual database credentials.

    *   Update the `datasource` block in `prisma/schema.prisma` to use the `env()` function:

        ```prisma
        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }
        ```

    **Create Initial Migration:**

    ```bash
    npx prisma migrate dev --name init
    ```

    *   `npx prisma migrate dev --name init`: Creates an initial database migration based on your `schema.prisma` file and applies it to your database. The `--name init` part gives a descriptive name to the migration.

3.  **Folder Structure Creation:**

    Create the following directories based on the proposed folder structure:

    ```bash
    mkdir -p src/api/v1/{controllers,services,models,routes,middleware,utils} src/config src/utils tests
    ```
    * `mkdir -p`: Creates parent directories if they don't exist.

4. **Basic Files:**

    Create `src/app.ts`:

    ```typescript
    import express from 'express';
    import cors from 'cors';
    import dotenv from 'dotenv';

    dotenv.config();

    const app = express();

    app.use(cors());
    app.use(express.json());

    // Routes will be added here later

    export default app;

    ```

    Create `src/server.ts`:
    ```typescript
    import app from './app';

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

    Update `package.json` scripts:
    ```json
    "scripts": {
        "start": "ts-node src/server.ts",
        "dev": "nodemon src/server.ts",
        "build": "tsc",
        "migrate:dev": "npx prisma migrate dev",
        "migrate:deploy": "npx prisma migrate deploy"
      },