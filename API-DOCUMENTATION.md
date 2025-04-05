# School Management System API Documentation

## Introduction

The School Management System API provides a comprehensive set of endpoints for managing all aspects of a school's operations. This RESTful API allows administrators, teachers, and other stakeholders to:

- Manage academic years, terms, and class schedules
- Administer student enrollment, attendance, and performance tracking
- Handle staff management including teachers and administrative staff
- Process fee payments and financial transactions
- Organize subjects, exams, and grading
- Generate report cards and academic performance reports
- Facilitate communication between school stakeholders

The API is designed with role-based access control to ensure that users can only access information and perform actions appropriate to their role within the school system.

## Base URL

All endpoints are prefixed with `/api/v1`.

## Authentication

Most endpoints require authentication via JWT token. Send the token in the `Authorization` header using the format: `Bearer <token>`.

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": {...}
}
```

Error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Available Roles

- `SUPER_MANAGER`: Highest level administrator
- `MANAGER`: System administrator
- `PRINCIPAL`: School principal
- `VICE_PRINCIPAL`: Vice principal
- `BURSAR`: Finance manager
- `TEACHER`: Teacher
- `DISCIPLINE_MASTER`: Manages student discipline
- `GUIDANCE_COUNSELOR`: Student counseling
- `PARENT`: Student's parent

## API Endpoints

### Authentication

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | Authenticate user and get token | None |
| `/auth/register` | POST | Register a new user | None |
| `/auth/logout` | POST | Invalidate user's token | Any authenticated user |
| `/auth/me` | GET | Get current user's profile | Any authenticated user |

### Academic Years

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/academic-years` | GET | List all academic years | Any authenticated user |
| `/academic-years` | POST | Create a new academic year | SUPER_MANAGER, PRINCIPAL |
| `/academic-years/:id` | GET | Get academic year details | Any authenticated user |
| `/academic-years/:id` | PUT | Update an academic year | SUPER_MANAGER, PRINCIPAL |
| `/academic-years/:id` | DELETE | Delete an academic year | SUPER_MANAGER, PRINCIPAL |
| `/academic-years/:id/terms` | GET | Get all terms for an academic year | Any authenticated user |
| `/academic-years/:id/terms` | POST | Add a term to an academic year | SUPER_MANAGER, PRINCIPAL |

### Users

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/users` | GET | List all users | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users` | POST | Create a new user | MANAGER, SUPER_MANAGER |
| `/users/:id` | GET | Get user details | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:id` | PUT | Update a user | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:id` | DELETE | Delete a user | MANAGER, SUPER_MANAGER |
| `/users/register-with-roles` | POST | Register and assign roles to a new user | None (public) |
| `/users/create-with-role` | POST | Create a user with a specific role | MANAGER, SUPER_MANAGER |
| `/users/:id/roles/academic-year` | PUT | Set user roles for current academic year | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:id/roles/:roleId` | DELETE | Remove a role from a user | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:userId/assignments/vice-principal` | POST | Assign vice principal to a subclass | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:userId/assignments/vice-principal/:subClassId` | DELETE | Remove vice principal from a subclass | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:userId/assignments/discipline-master` | POST | Assign discipline master to a subclass | MANAGER, SUPER_MANAGER, PRINCIPAL |
| `/users/:userId/assignments/discipline-master/:subClassId` | DELETE | Remove discipline master from a subclass | MANAGER, SUPER_MANAGER, PRINCIPAL |

### Classes

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/classes` | GET | List all classes | Any authenticated user |
| `/classes` | POST | Create a new class | SUPER_MANAGER, PRINCIPAL |
| `/classes/sub-classes` | GET | List all subclasses | Any authenticated user |
| `/classes/:id` | GET | Get class details with subclasses | Any authenticated user |
| `/classes/:id` | PUT | Update class details | SUPER_MANAGER, PRINCIPAL |
| `/classes/:id/sub-classes` | GET | List all subclasses for a specific class | Any authenticated user |
| `/classes/:id/sub-classes` | POST | Add a new subclass to a class | SUPER_MANAGER, PRINCIPAL |
| `/classes/:id/sub-classes/:subClassId` | PUT | Update a subclass | SUPER_MANAGER, PRINCIPAL |
| `/classes/:id/sub-classes/:subClassId` | DELETE | Delete a subclass | SUPER_MANAGER, PRINCIPAL |
| `/classes/sub-classes/:subclassId/class-master` | GET | Get the class master of a subclass | Any authenticated user |
| `/classes/sub-classes/:subclassId/class-master` | POST | Assign a class master to a subclass | SUPER_MANAGER, PRINCIPAL |
| `/classes/sub-classes/:subclassId/class-master` | DELETE | Remove the class master from a subclass | SUPER_MANAGER, PRINCIPAL |
| `/classes/sub-classes/:subClassId/subjects` | GET | Get all subjects for a specific subclass | Any authenticated user |

### Students

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/students` | GET | List all students with filters | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, DISCIPLINE_MASTER |
| `/students` | POST | Create a new student record | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/students/:id` | GET | Get student details | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, PARENT (own children only) |
| `/students/:id/parents` | POST | Link a parent to a student | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/students/:id/enroll` | POST | Enroll student in a subclass/year | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |

### Fees

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/fees` | GET | List all fees with filters | Any authenticated user |
| `/fees` | POST | Create a fee record for a student | SUPER_MANAGER, PRINCIPAL, BURSAR |
| `/fees/:id` | GET | Get fee details | Any authenticated user |
| `/fees/:id` | PUT | Update a fee record | SUPER_MANAGER, PRINCIPAL, BURSAR |
| `/fees/:id` | DELETE | Delete a fee record | SUPER_MANAGER, PRINCIPAL, BURSAR |
| `/fees/student/:studentId` | GET | Get all fees for a specific student | Any authenticated user |
| `/fees/subclass/:subclassId/summary` | GET | Get fee summary for a subclass | Any authenticated user |
| `/fees/:feeId/payments` | GET | List all payments for a fee | Any authenticated user |
| `/fees/:feeId/payments` | POST | Record a payment for a fee | SUPER_MANAGER, PRINCIPAL, BURSAR |
| `/fees/reports` | GET | Export fee data | SUPER_MANAGER, PRINCIPAL, BURSAR |

### Subjects

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/subjects` | GET | List all subjects | Any authenticated user |
| `/subjects` | POST | Create a new subject | SUPER_MANAGER, PRINCIPAL |
| `/subjects/:id` | GET | Get subject details | Any authenticated user |
| `/subjects/:id` | PUT | Update subject details | SUPER_MANAGER, PRINCIPAL |
| `/subjects/:id` | DELETE | Delete a subject | SUPER_MANAGER, PRINCIPAL |
| `/subjects/:id/teachers` | POST | Assign a teacher to a subject | SUPER_MANAGER, PRINCIPAL |
| `/subjects/:id/sub-classes` | POST | Link subject to a subclass with coefficient | SUPER_MANAGER, PRINCIPAL |
| `/subjects/:subjectId/classes/:classId` | POST | Assign a subject to all subclasses of a class | SUPER_MANAGER, PRINCIPAL |

### Discipline

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/discipline` | GET | List all discipline records | Any authenticated user |
| `/discipline/:studentId` | GET | Get discipline records for a student | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER |
| `/discipline` | POST | Record a discipline issue | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER |

### Attendance

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/attendance/students` | POST | Record student attendance | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, DISCIPLINE_MASTER, TEACHER |
| `/attendance/teachers` | POST | Record teacher attendance | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |

### Exams

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/exams` | GET | List all exams | Any authenticated user |
| `/exams` | POST | Create a new exam sequence | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/exams/:id` | GET | Get exam details | Any authenticated user |
| `/exams/:id` | DELETE | Delete an exam | SUPER_MANAGER, PRINCIPAL |
| `/exams/papers` | GET | List all exam papers | Any authenticated user |
| `/exams/papers` | POST | Create a new exam paper | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/exams/papers/:examId/with-questions` | GET | Get exam paper with questions | Any authenticated user |
| `/exams/papers/:id/questions` | POST | Add questions to an exam paper | Any authenticated user |
| `/exams/papers/:id/generate` | POST | Generate exam paper | Any authenticated user |

### Marks

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/marks` | GET | List all marks with filters | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER |
| `/marks` | POST | Create a new mark | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER |
| `/marks/:id` | PUT | Update a mark | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER |
| `/marks/:id` | DELETE | Delete a mark | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER |

### Report Cards

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/report-cards/student/:studentId` | GET | Generate report card for a student | Any authenticated user |
| `/report-cards/subclass/:subclassId` | GET | Generate report cards for a subclass | Any authenticated user |

### Communications

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/communications/announcements` | GET | List announcements | Any authenticated user |
| `/communications/announcements` | POST | Create an announcement | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/communications/announcements/:id` | PUT | Update an announcement | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/communications/announcements/:id` | DELETE | Delete an announcement | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |
| `/communications/notifications` | POST | Send push notifications | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL |

### Mobile API

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/mobile/dashboard` | GET | Get mobile dashboard data | Any authenticated user |
| `/mobile/register-device` | POST | Register a mobile device for push notifications | Any authenticated user |
| `/mobile/notifications` | GET | Get user-specific notifications | Any authenticated user |
| `/mobile/data/sync` | POST | Sync offline data | Any authenticated user |

### File Uploads

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/uploads` | POST | Upload a file | Any authenticated user |
| `/uploads/:filename` | DELETE | Delete an uploaded file | Any authenticated user |

### Student Averages

| Endpoint | Method | Description | Required Roles |
|----------|--------|-------------|---------------|
| `/student-averages/calculate/:examSequenceId` | POST | Calculate student averages for an exam sequence | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER |
| `/student-averages/sequence/:examSequenceId` | GET | Get all averages for an exam sequence | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, PARENT |
| `/student-averages/:enrollmentId/:examSequenceId` | GET | Get a student's average for an exam sequence | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, PARENT |
| `/student-averages/:id/decision` | PATCH | Update decision on a student's average | SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL | 