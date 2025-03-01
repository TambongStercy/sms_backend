# Subject API Documentation

This document provides comprehensive details about the Subject API endpoints in the School Management System.

## Base URL

All endpoints are relative to the base URL: `/api/v1/subjects`

## Authentication

All endpoints require authentication using a JWT token. The token must be included in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Get All Subjects

Retrieves a list of all subjects.

- **URL**: `/`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term to filter results by subject name or code
- `departmentId` (optional): Filter subjects by department ID

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH101",
      "description": "Basic mathematics concepts",
      "departmentId": 1,
      "department": {
        "id": 1,
        "name": "Science Department"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **500 Internal Server Error**: Server encountered an error

---

### Get Subject by ID

Retrieves a specific subject by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### URL Parameters

- `id`: The ID of the subject to retrieve

#### Response

```json
{
  "id": 1,
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Basic mathematics concepts",
  "departmentId": 1,
  "department": {
    "id": 1,
    "name": "Science Department"
  },
  "subclassSubjects": [
    {
      "id": 1,
      "subclassId": 1,
      "subclass": {
        "id": 1,
        "name": "Class 1A"
      }
    }
  ]
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **404 Not Found**: Subject with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Create Subject

Creates a new subject.

- **URL**: `/`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal

#### Request Body

```json
{
  "name": "Physics",
  "code": "PHYS101",
  "description": "Introduction to physics",
  "departmentId": 1
}
```

#### Response

```json
{
  "id": 2,
  "name": "Physics",
  "code": "PHYS101",
  "description": "Introduction to physics",
  "departmentId": 1,
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to create subjects
- **500 Internal Server Error**: Server encountered an error

---

### Update Subject

Updates an existing subject.

- **URL**: `/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal

#### URL Parameters

- `id`: The ID of the subject to update

#### Request Body

```json
{
  "name": "Advanced Physics",
  "code": "PHYS102",
  "description": "Advanced concepts in physics",
  "departmentId": 1
}
```

#### Response

```json
{
  "id": 2,
  "name": "Advanced Physics",
  "code": "PHYS102",
  "description": "Advanced concepts in physics",
  "departmentId": 1,
  "updatedAt": "2023-01-02T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to update subjects
- **404 Not Found**: Subject with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Delete Subject

Deletes a subject.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the subject to delete

#### Response

```json
{
  "message": "Subject deleted successfully"
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to delete subjects
- **404 Not Found**: Subject with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Assign Subject to Subclass

Assigns a subject to a specific subclass.

- **URL**: `/:id/assign`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal

#### URL Parameters

- `id`: The ID of the subject to assign

#### Request Body

```json
{
  "subclassId": 1
}
```

#### Response

```json
{
  "id": 1,
  "subjectId": 2,
  "subclassId": 1,
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to assign subjects
- **404 Not Found**: Subject or subclass with the specified ID does not exist
- **409 Conflict**: Subject is already assigned to the specified subclass
- **500 Internal Server Error**: Server encountered an error

---

### Unassign Subject from Subclass

Removes a subject assignment from a specific subclass.

- **URL**: `/:id/unassign`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal

#### URL Parameters

- `id`: The ID of the subject to unassign

#### Request Body

```json
{
  "subclassId": 1
}
```

#### Response

```json
{
  "message": "Subject unassigned from subclass successfully"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to unassign subjects
- **404 Not Found**: Subject assignment does not exist
- **500 Internal Server Error**: Server encountered an error

## Data Models

### Subject

```typescript
interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  departmentId: number;
  department?: Department;
  subclassSubjects?: SubclassSubject[];
  createdAt: Date;
  updatedAt: Date;
}
```

### SubclassSubject

```typescript
interface SubclassSubject {
  id: number;
  subjectId: number;
  subclassId: number;
  subject?: Subject;
  subclass?: Subclass;
  createdAt: Date;
  updatedAt: Date;
}
``` 