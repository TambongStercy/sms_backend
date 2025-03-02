# School Management System API Documentation

Welcome to the School Management System API documentation. This documentation provides comprehensive details about all available API endpoints, their request/response formats, and authentication requirements.

## Authentication

All API endpoints require authentication using JSON Web Tokens (JWT). To authenticate, include the JWT token in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_token>
```

You can obtain a token by using the authentication endpoints described in the Auth API documentation.

## API Modules

The School Management System API is organized into the following modules:

1. [Authentication API](./authRoutes.md) - User registration, login, and token management
2. [User API](./userRoutes.md) - User management and profile operations
3. [Student API](./studentRoutes.md) - Student management and related operations
4. [Teacher API](./teacherRoutes.md) - Teacher management and related operations
5. [Class API](./classRoutes.md) - Class management and related operations
6. [Subclass API](./subclassRoutes.md) - Subclass management and related operations
7. [Subject API](./subjectRoutes.md) - Subject management and related operations
8. [Academic Year API](./academicYearRoutes.md) - Academic year and term management
9. [Exam API](./examRoutes.md) - Exam, exam paper, and mark management
10. [Attendance API](./attendanceRoutes.md) - Student and teacher attendance tracking
11. [Fee API](./feeRoutes.md) - Fee structure and payment management
12. [Timetable API](./timetableRoutes.md) - Class timetable management
13. [Announcement API](./announcementRoutes.md) - School-wide announcements
14. [Event API](./eventRoutes.md) - School events and calendar management
15. [Mobile API](./mobileRoutes.md) - Mobile application specific endpoints
16. [File Upload API](./fileRoutes.md) - File upload and management for images and documents

## Common Response Formats

All API endpoints follow a consistent response format:

### Success Response

```json
{
  "data": {
    // Response data specific to the endpoint
  },
  "meta": {
    // Metadata such as pagination information (if applicable)
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (if applicable)
    }
  }
}
```

## Common Status Codes

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `400 Bad Request`: The request was invalid or cannot be served
- `401 Unauthorized`: Authentication is required or has failed
- `403 Forbidden`: The authenticated user does not have permission to access the requested resource
- `404 Not Found`: The requested resource does not exist
- `409 Conflict`: The request could not be completed due to a conflict with the current state of the resource
- `413 Payload Too Large`: The request entity is larger than limits defined by server
- `500 Internal Server Error`: An error occurred on the server

## Pagination

Many endpoints that return lists of resources support pagination. The following query parameters can be used to control pagination:

- `page`: The page number (starting from 1)
- `limit`: The number of items per page

Example:

```
GET /api/v1/students?page=2&limit=20
```

## Filtering and Searching

Many endpoints support filtering and searching. Common query parameters include:

- `search`: A general search term
- Specific field filters (e.g., `status`, `departmentId`, etc.)

Example:

```
GET /api/v1/students?search=John&status=ACTIVE
```

## API Versioning

The API uses URL versioning. The current version is `v1`, which is reflected in the URL path:

```
/api/v1/...
```

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## Support

If you encounter any issues or have questions about the API, please contact the system administrator or refer to the internal support documentation. 