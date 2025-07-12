# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Start development server**: `npm run dev` (uses nodemon with TypeScript)
- **Build for production**: `npm run build` (compiles TypeScript, generates Prisma client, copies assets)
- **Start production server**: `npm start` (runs from dist/)
- **Build for Vercel**: `npm run vercel-build` (TypeScript compilation only)

### Database Operations
- **Deploy migrations**: `npm run prisma:deploy`
- **Generate Prisma client**: `npx prisma generate` (auto-runs after npm install)
- **Create migration**: `npx prisma migrate dev --name <migration_name>`
- **Seed periods**: `npm run seed-periods`
- **Seed test data**: `npm run seed:test`

### Utility Scripts
- **Generate Swagger docs**: `npm run swagger-docs`
- **Create super manager**: `npm run create-super-manager`
- **Import students**: `npm run import-students`
- **Start report worker**: `npm run start:worker`

### Testing Commands
- **Check enrollments**: `node check-enrollments.js`
- **HTTP API tests**: Use files in `tests/` directory and `.http` files

## Architecture Overview

### Core Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with comprehensive middleware stack
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with role-based authorization
- **Documentation**: Swagger/OpenAPI with comprehensive schemas
- **Report Generation**: Puppeteer for PDF generation with EJS templates
- **File Handling**: Multer for uploads, static file serving
- **Background Jobs**: BullMQ with Redis for report generation workers

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
├── queue.ts       # BullMQ configuration
└── swagger/       # Complete API documentation system

prisma/
└── schema.prisma  # Single source of truth for database schema
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
- **Complete Swagger integration** with schemas in `src/config/swagger/schemas/`
- **Interactive testing**: Swagger UI at `/api-docs` with authentication
- **Schema consistency**: All API models defined in reusable schemas
- **Export capability**: JSON spec available at `/api-docs.json`

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