# School Management System - Fee Management API

This document provides a comprehensive guide to the Fee Management API endpoints for the School Management System.

## Overview

The Fee Management API allows authorized users to manage school fees, record payments, and generate fee reports. The API supports the following operations:

- Retrieving fee records (all, by ID, by student, by subclass)
- Creating new fee records
- Updating existing fee records
- Deleting fee records
- Recording payments for fees
- Generating fee reports

## Authentication

All API endpoints require authentication. Include a valid JWT token in the Authorization header:

```
Authorization: Bearer your-token-here
```

## Permission Requirements

| Role | Permissions |
|------|-------------|
| SUPER_MANAGER | Full access to all endpoints |
| PRINCIPAL | Full access to all endpoints |
| BURSAR | Full access to all endpoints |
| Others | Read-only access (GET endpoints only) |

## API Endpoints

### 1. Get All Fees

Retrieves a list of all fee records, optionally filtered by academic year.

```
GET /api/v1/fees?academic_year_id={academicYearId}
```

**Query Parameters:**
- `academic_year_id` (optional): Filter fees by academic year ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amountExpected": 100000,
      "amountPaid": 50000,
      "dueDate": "2024-02-15T00:00:00.000Z",
      "enrollment": {
        "student": {
          "id": 5,
          "name": "John Doe",
          "matricule": "STD005"
        }
      }
    },
    // More fee records...
  ]
}
```

### 2. Get Fee by ID

Retrieves a specific fee record by its ID.

```
GET /api/v1/fees/{id}
```

**Path Parameters:**
- `id`: The ID of the fee record

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amountExpected": 100000,
    "amountPaid": 50000,
    "academicYearId": 4,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "enrollmentId": 10,
    "enrollment": {
      "student": {
        "id": 5,
        "name": "John Doe",
        "matricule": "STD005"
      },
      "subclass": {
        "id": 1,
        "name": "Form 1A",
        "class": {
          "id": 1,
          "name": "Form 1"
        }
      }
    },
    "academicYear": {
      "id": 4,
      "name": "2023-2024"
    },
    "paymentTransactions": [
      {
        "id": 1,
        "amount": 50000,
        "paymentDate": "2024-01-15T00:00:00.000Z",
        "receiptNumber": "REC-001",
        "paymentMethod": "CASH"
      }
    ]
  }
}
```

### 3. Create Fee Record

Creates a new fee record for a student.

```
POST /api/v1/fees
```

**Required Permissions:** SUPER_MANAGER, PRINCIPAL, or BURSAR

**Request Body:**
```json
{
  "amountExpected": 100000,
  "amountPaid": 0,
  "dueDate": "2024-02-15",
  "studentId": 5,
  "academicYearId": 4
}
```

**Notes:**
- You can provide either `studentId` or `enrollmentId`. If you provide `studentId`, the system will find the appropriate enrollment for the current academic year.
- If `academicYearId` is not provided, the system will use the current academic year.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amountExpected": 100000,
    "amountPaid": 0,
    "academicYearId": 4,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "enrollmentId": 10
  }
}
```

### 4. Update Fee Record

Updates an existing fee record.

```
PUT /api/v1/fees/{id}
```

**Required Permissions:** SUPER_MANAGER, PRINCIPAL, or BURSAR

**Path Parameters:**
- `id`: The ID of the fee record to update

**Request Body:**
```json
{
  "amountExpected": 120000,
  "amountPaid": 60000,
  "dueDate": "2024-03-01"
}
```

**Notes:**
- All fields in the request body are optional. Only the provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amountExpected": 120000,
    "amountPaid": 60000,
    "dueDate": "2024-03-01T00:00:00.000Z",
    "academicYearId": 4,
    "enrollmentId": 10
  }
}
```

### 5. Delete Fee Record

Deletes a fee record.

```
DELETE /api/v1/fees/{id}
```

**Required Permissions:** SUPER_MANAGER, PRINCIPAL, or BURSAR

**Path Parameters:**
- `id`: The ID of the fee record to delete

**Notes:**
- You cannot delete a fee record that has existing payment records.

**Response:**
```json
{
  "success": true,
  "message": "Fee deleted successfully"
}
```

### 6. Get Student Fees

Retrieves all fee records for a specific student.

```
GET /api/v1/fees/student/{studentId}?academic_year_id={academicYearId}
```

**Path Parameters:**
- `studentId`: The ID of the student

**Query Parameters:**
- `academic_year_id` (optional): Filter fees by academic year ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amountExpected": 100000,
      "amountPaid": 50000,
      "dueDate": "2024-02-15T00:00:00.000Z",
      "enrollment": {
        "student": {
          "id": 5,
          "name": "John Doe",
          "matricule": "STD005"
        },
        "subclass": {
          "id": 1,
          "name": "Form 1A"
        }
      },
      "academicYear": {
        "id": 4,
        "name": "2023-2024"
      },
      "paymentTransactions": [
        {
          "id": 1,
          "amount": 50000,
          "paymentDate": "2024-01-15T00:00:00.000Z",
          "receiptNumber": "REC-001",
          "paymentMethod": "CASH"
        }
      ]
    }
  ]
}
```

### 7. Get Subclass Fees Summary

Retrieves a summary of fee payments for a specific subclass.

```
GET /api/v1/fees/subclass/{subclassId}/summary?academic_year_id={academicYearId}
```

**Path Parameters:**
- `subclassId`: The ID of the subclass

**Query Parameters:**
- `academic_year_id` (optional): Filter by academic year ID

**Response:**
```json
{
  "success": true,
  "data": {
    "subclassId": 1,
    "academicYearId": 4,
    "totalStudents": 30,
    "totalExpected": 3000000,
    "totalPaid": 1500000,
    "paymentPercentage": 50.0,
    "studentsWithFees": 30,
    "studentsFullyPaid": 15,
    "students": [
      {
        "studentId": 5,
        "studentName": "John Doe",
        "matricule": "STD005",
        "expectedTotal": 100000,
        "paidTotal": 50000,
        "outstanding": 50000,
        "paymentPercentage": 50.0,
        "status": "PENDING"
      },
      // More student summaries...
    ]
  }
}
```

### 8. Get Fee Payments

Retrieves all payment transactions for a specific fee record.

```
GET /api/v1/fees/{feeId}/payments
```

**Path Parameters:**
- `feeId`: The ID of the fee record

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 50000,
      "paymentDate": "2024-01-15T00:00:00.000Z",
      "receiptNumber": "REC-001",
      "paymentMethod": "CASH",
      "academicYearId": 4,
      "enrollmentId": 10,
      "feeId": 1
    }
  ]
}
```

### 9. Record Payment

Records a payment for a specific fee.

```
POST /api/v1/fees/{feeId}/payments
```

**Required Permissions:** SUPER_MANAGER, PRINCIPAL, or BURSAR

**Path Parameters:**
- `feeId`: The ID of the fee record

**Request Body:**
```json
{
  "amount": 50000,
  "paymentDate": "2024-01-15",
  "paymentMethod": "CASH",
  "receiptNumber": "REC-001"
}
```

**Notes:**
- Valid payment methods are: "CASH", "CARD", and "ONLINE"
- When a payment is recorded, the `amountPaid` field of the fee record is automatically updated to reflect the new payment.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amount": 50000,
    "paymentDate": "2024-01-15T00:00:00.000Z",
    "receiptNumber": "REC-001",
    "paymentMethod": "CASH",
    "academicYearId": 4,
    "enrollmentId": 10,
    "feeId": 1
  }
}
```

### 10. Export Fee Reports

Exports fee data as a report.

```
GET /api/v1/fees/reports?academic_year_id={academicYearId}&format={format}&subclass_id={subclassId}
```

**Required Permissions:** SUPER_MANAGER, PRINCIPAL, or BURSAR

**Query Parameters:**
- `academic_year_id` (optional): Filter by academic year ID
- `format` (optional): The format of the report (e.g., "excel", "pdf"). Default is "excel".
- `subclass_id` (optional): Filter by subclass ID

**Response:**
```json
{
  "success": true,
  "message": "Fee report exported successfully",
  "data": {
    "message": "Fee report exported successfully"
  }
}
```

## Common Use Cases

### Getting A Student's Payment Status

1. Get all fees for a student:
   ```
   GET /api/v1/fees/student/{studentId}?academic_year_id={academicYearId}
   ```

2. Calculate the total amount expected and amount paid to determine payment status.

### Recording A New Payment

1. Get the fee record:
   ```
   GET /api/v1/fees/{feeId}
   ```

2. Record a payment:
   ```
   POST /api/v1/fees/{feeId}/payments
   ```
   with the payment details in the request body.

### Generating Class Payment Reports

1. Get the fee summary for a subclass:
   ```
   GET /api/v1/fees/subclass/{subclassId}/summary?academic_year_id={academicYearId}
   ```

2. Export the data as a report:
   ```
   GET /api/v1/fees/reports?academic_year_id={academicYearId}&subclass_id={subclassId}
   ```

## Error Handling

All API endpoints return a standard error response format:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- 400: Bad Request (invalid input data)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error 