# User Management API Documentation

This document provides comprehensive details about the User Management endpoints in the School Management System API.

## Base URL

All endpoints are relative to the base URL: `/api/v1/users`

## Authentication

Most endpoints require authentication using a JWT token. The token must be included in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_token>
```

## Endpoints

### List All Users

Retrieves a paginated list of users with optional filtering.

- **URL**: `/`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: Must have role `ADMIN`, `PRINCIPAL`, or `VICE_PRINCIPAL`

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| sortBy | string | Field to sort by |
| sortOrder | string | Sort direction (`asc` or `desc`) |
| name | string | Filter by user name (partial match) |
| email | string | Filter by user email (partial match) |
| gender | string | Filter by gender (`Male` or `Female`) |
| role | string | Filter by role (e.g., `ADMIN`, `TEACHER`) |
| phone | string | Filter by phone number (partial match) |
| includeRoles | boolean | Include user roles in response (`true` or `false`) |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "gender": "Male",
      "date_of_birth": "1990-01-01T00:00:00.000Z",
      "phone": "1234567890",
      "address": "123 Main St",
      "photo": null,
      "id_card_num": null,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "user_roles": [
        {
          "id": 1,
          "user_id": 1,
          "academic_year_id": 1,
          "role": "TEACHER",
          "created_at": "2023-01-01T00:00:00.000Z",
          "updated_at": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to access this resource
- **500 Internal Server Error**: Server encountered an error

---

### Create User

Creates a new user in the system.

- **URL**: `/`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Must have role `ADMIN`

#### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "securePassword123",
  "gender": "Female",
  "date_of_birth": "1992-05-15",
  "phone": "0987654321",
  "address": "456 Oak Street"
}
```

#### Response

```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "gender": "Female",
  "date_of_birth": "1992-05-15T00:00:00.000Z",
  "phone": "0987654321",
  "address": "456 Oak Street",
  "photo": null,
  "id_card_num": null,
  "created_at": "2023-01-02T00:00:00.000Z",
  "updated_at": "2023-01-02T00:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Invalid request body
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to create users
- **500 Internal Server Error**: Server encountered an error

---

### Get User by ID

Retrieves details of a specific user.

- **URL**: `/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: 
  - `ADMIN`, `PRINCIPAL`, `VICE_PRINCIPAL` can view any user
  - Other users can only view their own profile

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | The user ID |

#### Response

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "gender": "Male",
  "date_of_birth": "1990-01-01T00:00:00.000Z",
  "phone": "1234567890",
  "address": "123 Main St",
  "photo": null,
  "id_card_num": null,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to view this profile
- **404 Not Found**: User with the specified ID doesn't exist
- **500 Internal Server Error**: Server encountered an error

---

### Update User

Updates details of an existing user.

- **URL**: `/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Authorization**: 
  - `ADMIN` can update any user
  - Other users can only update their own profile

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | The user ID |

#### Request Body

```json
{
  "name": "John Doe Jr.",
  "phone": "1234567899",
  "address": "123 Second St"
}
```

#### Response

```json
{
  "id": 1,
  "name": "John Doe Jr.",
  "email": "john.doe@example.com",
  "gender": "Male",
  "date_of_birth": "1990-01-01T00:00:00.000Z",
  "phone": "1234567899",
  "address": "123 Second St",
  "photo": null,
  "id_card_num": null,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Invalid request body
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to update this profile
- **404 Not Found**: User with the specified ID doesn't exist
- **500 Internal Server Error**: Server encountered an error

---

### Delete User

Removes a user from the system.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Authorization**: Must have role `ADMIN`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | The user ID |

#### Response

```json
{
  "message": "User deleted successfully"
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to delete users
- **404 Not Found**: User with the specified ID doesn't exist
- **500 Internal Server Error**: Server encountered an error

---

### Assign Role to User

Assigns a role to a user, optionally for a specific academic year.

- **URL**: `/:id/roles`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Must have role `ADMIN`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | The user ID |

#### Request Body

```json
{
  "role": "TEACHER",
  "academic_year_id": 2
}
```

#### Response

```json
{
  "id": 3,
  "user_id": 1,
  "academic_year_id": 2,
  "role": "TEACHER",
  "created_at": "2023-01-03T00:00:00.000Z",
  "updated_at": "2023-01-03T00:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Invalid request body
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to assign roles
- **404 Not Found**: User with the specified ID doesn't exist
- **500 Internal Server Error**: Server encountered an error

---

### Remove Role from User

Removes a role from a user.

- **URL**: `/:id/roles/:roleId`
- **Method**: `DELETE`
- **Authentication**: Required
- **Authorization**: Must have role `ADMIN`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | The user ID |
| roleId | string | The role to remove (e.g., "TEACHER") |

#### Response

```json
{
  "message": "Role removed successfully",
  "removedCount": 1
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User doesn't have permission to remove roles
- **404 Not Found**: User with the specified ID doesn't exist or doesn't have the specified role
- **500 Internal Server Error**: Server encountered an error

## Role Definitions

The system supports the following user roles:

- `SUPER_MANAGER`: Highest level of access to all system functions
- `MANAGER`: Administrative access to manage the system
- `PRINCIPAL`: School principal with access to most functions
- `VICE_PRINCIPAL`: Vice principal with access to academic functions
- `BURSAR`: Financial administrator
- `TEACHER`: Regular teaching staff
- `DISCIPLINE_MASTER`: Manages student discipline
- `GUIDANCE_COUNSELOR`: Provides guidance to students
- `PARENT`: Parent or guardian of students

## Data Models

### User

```typescript
interface User {
  id: number;
  name: string;
  gender: "Male" | "Female";
  date_of_birth: Date;
  photo?: string;
  phone: string;
  address: string;
  email: string;
  password: string; // Hashed, never returned in responses
  id_card_num?: string;
  created_at: Date;
  updated_at: Date;
}
```

### UserRole

```typescript
interface UserRole {
  id: number;
  user_id: number;
  academic_year_id?: number;
  role: Role;
  created_at: Date;
  updated_at: Date;
}
``` 