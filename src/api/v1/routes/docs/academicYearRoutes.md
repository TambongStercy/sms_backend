# Academic Year API Documentation

This document provides comprehensive details about the Academic Year API endpoints in the School Management System.

## Base URL

All endpoints are relative to the base URL: `/api/v1/academic-years`

## Authentication

All endpoints require authentication using a JWT token. The token must be included in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Get All Academic Years

Retrieves a list of all academic years.

- **URL**: `/`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term to filter results

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "2023-2024",
      "startDate": "2023-09-01T00:00:00.000Z",
      "endDate": "2024-06-30T00:00:00.000Z",
      "isDefault": true,
      "terms": [
        {
          "id": 1,
          "name": "First Term",
          "startDate": "2023-09-01T00:00:00.000Z",
          "endDate": "2023-12-20T00:00:00.000Z"
        }
      ]
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

### Get Academic Year by ID

Retrieves a specific academic year by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### URL Parameters

- `id`: The ID of the academic year to retrieve

#### Response

```json
{
  "id": 1,
  "name": "2023-2024",
  "startDate": "2023-09-01T00:00:00.000Z",
  "endDate": "2024-06-30T00:00:00.000Z",
  "isDefault": true,
  "terms": [
    {
      "id": 1,
      "name": "First Term",
      "startDate": "2023-09-01T00:00:00.000Z",
      "endDate": "2023-12-20T00:00:00.000Z"
    }
  ]
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **404 Not Found**: Academic year with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Create Academic Year

Creates a new academic year.

- **URL**: `/`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### Request Body

```json
{
  "name": "2024-2025",
  "startDate": "2024-09-01",
  "endDate": "2025-06-30",
  "isDefault": false
}
```

#### Response

```json
{
  "id": 2,
  "name": "2024-2025",
  "startDate": "2024-09-01T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "isDefault": false,
  "terms": []
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to create academic years
- **500 Internal Server Error**: Server encountered an error

---

### Update Academic Year

Updates an existing academic year.

- **URL**: `/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the academic year to update

#### Request Body

```json
{
  "name": "2024-2025 Updated",
  "startDate": "2024-08-15",
  "endDate": "2025-06-15",
  "isDefault": false
}
```

#### Response

```json
{
  "id": 2,
  "name": "2024-2025 Updated",
  "startDate": "2024-08-15T00:00:00.000Z",
  "endDate": "2025-06-15T00:00:00.000Z",
  "isDefault": false,
  "terms": []
}
```

#### Error Responses

- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to update academic years
- **404 Not Found**: Academic year with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Delete Academic Year

Deletes an academic year.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the academic year to delete

#### Response

```json
{
  "message": "Academic year deleted successfully"
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to delete academic years
- **404 Not Found**: Academic year with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Set Default Academic Year

Sets an academic year as the default.

- **URL**: `/:id/set-default`
- **Method**: `PUT`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the academic year to set as default

#### Response

```json
{
  "message": "Academic year set as default successfully",
  "academicYear": {
    "id": 2,
    "name": "2024-2025",
    "startDate": "2024-09-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "isDefault": true
  }
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to set default academic year
- **404 Not Found**: Academic year with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Add Term to Academic Year

Adds a new term to an academic year.

- **URL**: `/:id/terms`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the academic year to add a term to

#### Request Body

```json
{
  "name": "Second Term",
  "startDate": "2024-01-10",
  "endDate": "2024-04-15"
}
```

#### Response

```json
{
  "id": 2,
  "name": "Second Term",
  "startDate": "2024-01-10T00:00:00.000Z",
  "endDate": "2024-04-15T00:00:00.000Z",
  "academicYearId": 1
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to add terms
- **404 Not Found**: Academic year with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

## Data Models

### Academic Year

```typescript
interface AcademicYear {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isDefault: boolean;
  terms?: Term[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Term

```typescript
interface Term {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  academicYearId: number;
  createdAt: Date;
  updatedAt: Date;
}
``` 