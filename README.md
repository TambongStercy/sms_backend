# School Management System

## Overview

This is a comprehensive School Management System backend API built with TypeScript, Node.js, Express, and PostgreSQL. The system helps educational institutions manage their academic operations, including student information, classes, exams, marks, report cards, attendance, and more.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Deployment](#deployment)
  - [Deploying to Render](#deploying-to-render)
- [API Documentation](#api-documentation)
  - [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Core Modules](#core-modules)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Testing](#testing)
- [Development Guidelines](#development-guidelines)

## Features

- **User Management**
  - Different user roles (Admin, Principal, Vice Principal, Teacher, Student, Parent)
  - Authentication and authorization
  - User profiles and settings

- **Academic Management**
  - Classes and subclasses
  - Academic years and terms
  - Subject management
  - Teacher assignments

- **Student Management**
  - Student enrollment
  - Student profiles
  - Parent-student associations

- **Exam Management**
  - Exam creation and scheduling
  - Question management
  - Marking system
  - Report card generation
  - Statistical analysis of performance

- **Attendance Management**
  - Student attendance tracking
  - Teacher attendance tracking
  - Discipline issue recording

- **Finance Management**
  - School fees management
  - Payment tracking
  - Financial reporting

- **Communication**
  - Announcements
  - Mobile notifications
  - Targeted audience messaging

- **File Management**
  - Document uploads
  - Media storage and retrieval

## Project Structure

The project follows a modular architecture organized by feature:

```
src/
├── api/                    # API modules
│   └── v1/                 # API version 1
│       ├── controllers/    # Request handlers
│       ├── middleware/     # Custom middleware
│       ├── models/         # Data models
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── swagger/        # API documentation
│       ├── docs/           # Additional documentation
│       └── utils/          # API-specific utilities
├── config/                 # Configuration files
├── reports/                # Report templates and generation
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── view/                   # View templates
├── app.ts                  # Express application setup
├── script.ts               # Utility scripts
├── seed.ts                 # Database seed data
└── server.ts               # Server entry point
```

### Key API Modules

The system is divided into the following main API modules:

- **Authentication** (`/auth`) - User registration, login, password reset
- **Academic Years** (`/academic-years`) - Manage school academic calendar
- **Users** (`/users`) - User management for all roles
- **Classes** (`/classes`) - Class and subclass management
- **Students** (`/students`) - Student records and operations
- **Fees** (`/fees`) - School fees and payment management
- **Subjects** (`/subjects`) - Academic subjects and teacher assignments
- **Discipline** (`/discipline`) - Student discipline management
- **Attendance** (`/attendance`) - Student and teacher attendance
- **Exams** (`/exams`) - Exam creation and management
- **Marks** (`/marks`) - Student grading and marks
- **Report Cards** (`/report-cards`) - Academic performance reports
- **Communication** - Announcements and notifications
- **Mobile** (`/mobile`) - Mobile app specific endpoints
- **Files** (`/uploads`) - File upload and management

## Technology Stack

- **Backend Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JSON Web Tokens (JWT)
- **Documentation**: Swagger/OpenAPI
- **Report Generation**: HTML/PDF generation for report cards
- **File Storage**: Local file system with configurable paths

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd School_Management_System
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URI=postgresql://username:password@localhost:5432/school_management_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Other configuration
UPLOAD_DIR=./uploads
```

### Database Setup

1. Create a PostgreSQL database
   ```sql
   CREATE DATABASE school_management_db;
   ```

2. Run Prisma migrations
   ```bash
   npx prisma migrate dev
   ```

3. Seed the database (optional)
   ```bash
   npm run seed
   # or
   yarn seed
   ```

### Running the Application

Development mode:
```bash
npm run dev
# or
yarn dev
```

Production mode:
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Deployment

### Deploying to Render

This application can be deployed to Render as a Web Service. Follow these steps to deploy:

1. Create a new Web Service in Render and connect your GitHub repository.

2. Configure the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 16 or higher (recommended)

3. Add the necessary environment variables in the Render dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT authentication
   - `NODE_ENV`: Set to `production`
   - Other environment variables as needed

4. For database, you can either:
   - Use Render's PostgreSQL managed database service
   - Connect to an external PostgreSQL database

5. Once deployed, Render will automatically build and start your application whenever you push changes to your repository.

**Note**: The repository is configured with a special `postbuild` script that creates necessary directories and copies templates for report generation, ensuring proper functionality in the Render environment.

## API Documentation

The API documentation is available via Swagger UI at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

The complete OpenAPI specification is also available in JSON format at `/api-docs.json`. This can be useful for:
- Importing the API collection into tools like Postman or Insomnia
- Generating client libraries for various programming languages
- Offline documentation reference
- Integration with third-party API management tools

To download the specification file, you can use:
```bash
curl http://localhost:3000/api-docs.json -o api-docs.json
```

### API Endpoints

The API is organized into logical modules with the following base paths:

| Base Path | Description |
|-----------|-------------|
| `/api/v1/auth` | Authentication endpoints |
| `/api/v1/academic-years` | Academic year management |
| `/api/v1/users` | User management |
| `/api/v1/classes` | Class and subclass management |
| `/api/v1/students` | Student management |
| `/api/v1/fees` | School fees management |
| `/api/v1/subjects` | Subject management |
| `/api/v1/exams` | Exam management |
| `/api/v1/marks` | Student marks management |
| `/api/v1/report-cards` | Report card generation |
| `/api/v1/discipline` | Student discipline issues |
| `/api/v1/attendance` | Attendance tracking |
| `/api/v1/mobile` | Mobile-specific endpoints |
| `/api/v1/uploads` | File upload and management |

## Authentication & Authorization

The system uses JWT (JSON Web Tokens) for authentication. The `authenticate` middleware verifies tokens, and the `authorize` middleware controls access based on user roles.

Different endpoints have different authorization requirements:
- Some endpoints are accessible by all authenticated users
- Some endpoints require specific roles (e.g., ADMIN, PRINCIPAL, TEACHER)
- Some endpoints have data-level permissions (e.g., teachers can only view their assigned students)

Example of protected route implementation:
```typescript
router.get('/students', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'TEACHER']), studentController.getAllStudents);
```

## Core Modules

### User Management

The system supports multiple user roles with different permissions:
- **Admin**: Full system access
- **Principal**: School-wide management
- **Vice Principal**: Assists principal in management
- **Discipline Master**: Handles discipline issues
- **Bursar**: Manages school finances
- **Teacher**: Manages classes, subjects, and marks
- **Parent**: Views their children's information
- **Student**: Views own information

### Exam Management

The exam system allows for:
- Creating and scheduling exams
- Managing exam papers and questions
- Recording student marks
- Generating report cards with academic performance
- Analyzing results with statistics and rankings

Key features include:
- Individual student report cards
- Class-wide report cards
- Performance statistics (min, max, average scores)
- Grade calculations
- Student ranking

### Class & Subject Management

- Classes can have multiple subclasses
- Subjects can be assigned to specific subclasses
- Teachers can be assigned to teach specific subjects
- The system tracks periods and teaching schedules

### Mobile App Integration

The system includes API endpoints specifically designed for mobile app integration, available under the `/api/v1/mobile` path. These endpoints provide:

- **Mobile Dashboard**: Personalized dashboard data for different user roles
- **Push Notifications**: Registration and delivery of notifications to mobile devices
- **Optimized Responses**: Data formatted specifically for mobile consumption
- **Authentication**: Specialized authentication flows for mobile clients

Mobile app developers can reference the API documentation at `/api-docs` for detailed information about the mobile endpoints.

## Database Schema

The database uses a relational model with the following key entities:

- **AcademicYear**: School academic calendar years
- **User**: System users with various roles
- **UserRole**: Role assignments for users
- **Student**: Student information and profiles
- **Enrollment**: Student enrollment in classes
- **Class/Subclass**: School class structure
- **Subject/SubclassSubject**: Academic subjects and their assignment to classes
- **SubjectTeacher**: Teacher assignments to subjects
- **ExamSequence/ExamPaper**: Exam information and scheduling
- **Question/ExamPaperQuestion**: Exam questions and their structure
- **Mark**: Student exam performance records
- **StudentAbsence/TeacherAbsence**: Attendance tracking
- **DisciplineIssue**: Student discipline records
- **SchoolFees/PaymentTransaction**: Financial records
- **Announcement/MobileNotification**: Communication records

## Contributing

1. Create a new branch for features or fixes
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Follow the coding style and patterns used in the project
   - Use TypeScript interfaces for data structures
   - Follow the controller-service-repository pattern
   - Add proper error handling
   - Document your code with JSDoc comments

3. Write appropriate tests for your changes

4. Submit a pull request with a description of your changes

## Testing

Run the test suite with:
```bash
npm test
# or
yarn test
```

For specific test files:
```bash
npm test -- path/to/test
# or
yarn test path/to/test
```

## Development Guidelines

### Adding New API Endpoints

1. Create or modify the appropriate controller in `src/api/v1/controllers/`
2. Implement the business logic in a service in `src/api/v1/services/`
3. Add the route to the appropriate router in `src/api/v1/routes/`
4. Document the endpoint with Swagger annotations
5. Update tests to cover the new functionality

### Database Changes

1. Modify the Prisma schema in `prisma/schema.prisma`
2. Generate a migration:
   ```bash
   npx prisma migrate dev --name descriptive-name
   ```
3. Update related services and controllers
4. Update TypeScript types if necessary

### Best Practices

- Always validate user input
- Use proper error handling and consistent error responses
- Implement role-based access control for all endpoints
- Keep controller methods focused on request/response handling
- Put business logic in service files
- Use transactions for operations that modify multiple database records

### Using Swagger for Development

Swagger UI provides a powerful interactive tool for testing and exploring the API during development:

1. **Testing Endpoints**: Use the Swagger UI to send requests directly from your browser
2. **Exploring Parameters**: View all required and optional parameters for each endpoint
3. **Authentication**: Test endpoints with authentication by clicking the "Authorize" button
4. **Schema Inspection**: View the data models and response schemas

To properly document new endpoints, add Swagger JSDoc comments to your route files:

```typescript
/**
 * @swagger
 * /api/v1/your-path:
 *   get:
 *     summary: Brief description of your endpoint
 *     description: Detailed description of what this endpoint does
 *     tags: [YourTagName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: paramName
 *         in: query
 *         description: Description of the parameter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourResponseType'
 */
```

This approach ensures that all API changes are automatically reflected in the documentation. 

## License

[MIT](LICENSE) 