# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Start development server**: `npm run dev` (uses ts-node-dev with TypeScript)
- **Build for production**: `npm run build` (compiles TypeScript only)
- **Start production server**: `npm start` (runs from dist/)

### Database Operations
- **Generate Prisma client**: `npm run db:generate` (or `npx prisma generate`)
- **Push schema to database**: `npm run db:push` (or `npx prisma db push`)
- **Create and apply migration**: `npm run db:migrate` (or `npx prisma migrate dev`)
- **Open Prisma Studio**: `npm run db:studio` (or `npx prisma studio`)

### Sync Operations (Database Synchronization System)
- **Trigger manual sync**: `npm run sync:trigger` (POST request to sync endpoint)
- **Check sync status**: `npm run sync:status` (GET sync status)

### Production Seeding
- **Comprehensive production seed**: `npm run seed:production` (Seeds complete production data: academic years, users, classes, subjects, periods, terms)

### Testing Commands
- **Check enrollments**: `node check-enrollments.js`
- **HTTP API tests**: Use files in `tests/` directory and `.http` files
- **Shell script tests**: `./test-all-endpoints.sh`, `./test-corrected-endpoints.sh`

## Architecture Overview

### Core Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with comprehensive middleware stack
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with role-based authorization and token blacklisting
- **Documentation**: Swagger/OpenAPI with comprehensive schemas
- **Rate Limiting**: Express rate limiting middleware
- **Security**: Helmet.js for security headers, CORS for cross-origin requests
- **Database Synchronization**: Custom sync system for offline/online server synchronization

### Project Structure
```
src/api/v1/
├── controllers/    # Request handlers (camelCase external interface)
├── services/       # Business logic (snake_case internal/Prisma interface)
├── routes/         # API route definitions with middleware
├── middleware/     # Auth, case conversion, audit trail
└── utils/          # API-specific utilities

src/config/
├── db.ts          # Prisma client configuration
├── auth.ts        # JWT configuration
└── swagger/       # Complete API documentation system

src/sync/          # Database synchronization system
                   # Handles bidirectional sync between VPS and local servers
                   # Includes conflict resolution and network monitoring

prisma/
└── schema.prisma  # Single source of truth for database schema

workflows/          # Detailed business logic and role-specific workflows
                   # These documents explain user journeys, system interactions,
                   # and often include API endpoint references for context.
```

### Critical Data Conversion Pattern
The system implements automatic case conversion between external API (camelCase) and internal database operations (snake_case):

- **External API**: All requests/responses use camelCase (enforced by Swagger)
- **Internal/Database**: All Prisma operations use snake_case (enforced by schema)
- **Middleware**: Global `convertCamelToSnakeCase` and `convertSnakeToCamelCase` handle automatic conversion
- **Never manually convert case** - rely on the middleware system

### Academic Year Context System
Most operations are scoped to academic years with intelligent defaulting:

- Use `getCurrentAcademicYear()` or `getAcademicYearId()` from `src/utils/academicYear.ts`
- Filter data by `academic_year_id` in Prisma queries
- Handle global vs year-specific roles: `where: { academic_year_id: { in: [currentAcademicYearId, null] } }`
- Check foreign key constraints before deletion operations

### Authentication & Authorization Architecture
- **JWT-based authentication** with token blacklisting on logout
- **Role-based authorization** with hierarchical permissions
- **SUPER_MANAGER**: Has access to all operations
- **Academic year-specific roles**: Most roles tied to specific academic years
- **Global roles**: Some roles (like SUPER_MANAGER) have null academic_year_id

### Role System
```typescript
// Core roles with academic year context
UserRole: { user_id, role, academic_year_id (nullable) }
```

### Database Design Principles
- **snake_case**: All database fields use snake_case naming
- **Unique constraints**: Carefully designed composite keys (e.g., user_id + role + academic_year_id)
- **Foreign key relationships**: Extensive use of relations with proper cascade rules
- **Audit trail**: Built-in tracking for sensitive operations

### Report Generation System
- **PDF generation**: Puppeteer with EJS templates in `src/view/`
- **Background processing**: BullMQ workers for large report generation
- **Report types**: Student, class, subclass, sequence reports
- **Template system**: EJS templates with CSS styling for professional reports

### API Documentation Strategy
-   **Primary Frontend Documentation**: `COMPLETE_API_DOCUMENTATION.md` is the *single, canonical source of truth* for frontend developers regarding API endpoints. It contains all necessary details, including request/response structures (in `camelCase`), authorization, and examples. Frontend developers should primarily consult this markdown file for integration.
-   **Swagger Integration Role**: Swagger UI (available at `/api-docs`) serves as an **interactive testing and exploration tool**. It's useful for verifying endpoint behavior and understanding the API on the fly, but `COMPLETE_API_DOCUMENTATION.md` remains the definitive reference for comprehensive details and consistency.
-   **Documentation Completeness**: **Crucial!** Ensure *all* API endpoints (GET, POST, PUT, DELETE, etc.) are thoroughly documented in `COMPLETE_API_DOCUMENTATION.md` immediately upon creation or modification in routes and controllers. This includes accurate request bodies, query parameters, path parameters, and response structures, adhering to `camelCase` for external API properties.
-   **Schema consistency**: All API models defined in reusable schemas in `src/config/swagger/schemas/` are used to generate the Swagger spec and should be consistent with the types presented in `COMPLETE_API_DOCUMENTATION.md`.
-   **Export capability**: JSON spec available at `/api-docs.json`.

### File Management
- **Upload directory**: Configurable upload paths with static serving
- **Multer integration**: Comprehensive file upload handling
- **Asset copying**: Build process copies templates and static assets to dist/

### Error Handling Standards
```typescript
// Success response
{ "success": true, "data": ... }

// Error response
{ "success": false, "error": "Descriptive message" }
```

### Development Workflow
1. **Database changes**: Modify `prisma/schema.prisma` → run migration → update services
2. **API endpoints**: Controller → Service → Route → Swagger documentation
3. **Testing**: Use `.http` files and Swagger UI for endpoint testing
4. **Case conversion**: Trust the middleware - don't manually convert
5. **Academic year context**: Always consider year-specific vs global operations

### Key Constraints to Remember
- **UserRole uniqueness**: `user_id + role + academic_year_id` must be unique
- **Foreign key checks**: Always verify dependent records before deletion
- **JWT token management**: Tokens are blacklisted on logout, check expiration
- **File paths**: Use absolute paths for file operations in production
- **Academic year filtering**: Most list operations should be year-scoped

### Production Deployment
- **Environment-specific database URLs**: Automatic switching based on NODE_ENV
- **Asset compilation**: Build process handles TypeScript compilation and asset copying
- **Health checks**: Multiple health endpoints for monitoring (`/api/health`, `/api/v1/health`)
- **Static file serving**: Uploads served from `/uploads` endpoint

### Common Development Pitfalls and Best Practices

To ensure smooth development and avoid common issues, keep the following in mind:

-   **Undocumented Endpoints**: A frequent problem is endpoints existing in the code (e.g., in `src/api/v1/routes/`) but not being reflected in `COMPLETE_API_DOCUMENTATION.md`. **Always document new or modified endpoints fully** – including their purpose, authorization, request/response formats, and any specific query/path parameters.
-   **Case Conversion Mismatch**: Remember the `camelCase` (API external) vs `snake_case` (internal/Prisma) convention. Rely entirely on the `caseConversion.middleware.ts` for automatic handling. **Do not manually convert case** in controllers or services unless explicitly dealing with a non-standard scenario.
-   **Academic Year Context**: Many operations are tied to an `academic_year_id`.
    -   Default to the current academic year using `getCurrentAcademicYear()` or `getAcademicYearId()` from `src/utils/academicYear.ts` if not explicitly provided.
    -   Ensure filtering by `academic_year_id` is correctly applied in Prisma queries for year-scoped data.
    -   Be mindful of `UserRole` records that can be global (`academic_year_id is null`) or year-specific.
-   **Foreign Key Constraints**: Before deleting any entity (e.g., `Class`, `SubClass`, `Subject`, `AcademicYear`), **always perform a check for dependent records** (e.g., `enrollments`, `sub_classes`, `marks`). If dependent records exist, prevent deletion and return a `409 Conflict` error with a clear message.
-   **Error Handling Consistency**: Adhere to the standard `{ success: false, error: "message" }` format for all error responses and use appropriate HTTP status codes (400, 401, 403, 404, 409, 500).
-   **Prisma Schema as Source of Truth**: Any changes to database models must first be made in `prisma/schema.prisma`, followed by a migration (`npx prisma migrate dev`).

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.