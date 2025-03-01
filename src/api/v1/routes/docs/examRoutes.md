# Exam API Documentation

This document provides comprehensive details about the Exam API endpoints in the School Management System.

## Base URL

All endpoints are relative to the base URL: `/api/v1/exams`

## Authentication

All endpoints require authentication using a JWT token. The token must be included in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Get All Exams

Retrieves a list of all exams.

- **URL**: `/`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### Query Parameters

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term to filter results by exam name
- `academicYearId` (optional): Filter exams by academic year ID
- `termId` (optional): Filter exams by term ID
- `subclassId` (optional): Filter exams by subclass ID

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Mid-Term Examination",
      "description": "Mid-term assessment for first term",
      "startDate": "2023-10-15T00:00:00.000Z",
      "endDate": "2023-10-20T00:00:00.000Z",
      "academicYearId": 1,
      "termId": 1,
      "examSequence": "MID_TERM",
      "academicYear": {
        "id": 1,
        "name": "2023-2024"
      },
      "term": {
        "id": 1,
        "name": "First Term"
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

### Get Exam by ID

Retrieves a specific exam by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### URL Parameters

- `id`: The ID of the exam to retrieve

#### Response

```json
{
  "id": 1,
  "name": "Mid-Term Examination",
  "description": "Mid-term assessment for first term",
  "startDate": "2023-10-15T00:00:00.000Z",
  "endDate": "2023-10-20T00:00:00.000Z",
  "academicYearId": 1,
  "termId": 1,
  "examSequence": "MID_TERM",
  "academicYear": {
    "id": 1,
    "name": "2023-2024"
  },
  "term": {
    "id": 1,
    "name": "First Term"
  },
  "examPapers": [
    {
      "id": 1,
      "subjectId": 1,
      "subject": {
        "id": 1,
        "name": "Mathematics",
        "code": "MATH101"
      }
    }
  ]
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **404 Not Found**: Exam with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Create Exam

Creates a new exam.

- **URL**: `/`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal

#### Request Body

```json
{
  "name": "End of Term Examination",
  "description": "Final assessment for first term",
  "startDate": "2023-12-10",
  "endDate": "2023-12-15",
  "academicYearId": 1,
  "termId": 1,
  "examSequence": "END_TERM"
}
```

#### Response

```json
{
  "id": 2,
  "name": "End of Term Examination",
  "description": "Final assessment for first term",
  "startDate": "2023-12-10T00:00:00.000Z",
  "endDate": "2023-12-15T00:00:00.000Z",
  "academicYearId": 1,
  "termId": 1,
  "examSequence": "END_TERM",
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to create exams
- **500 Internal Server Error**: Server encountered an error

---

### Update Exam

Updates an existing exam.

- **URL**: `/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal

#### URL Parameters

- `id`: The ID of the exam to update

#### Request Body

```json
{
  "name": "Updated End of Term Examination",
  "description": "Updated final assessment for first term",
  "startDate": "2023-12-12",
  "endDate": "2023-12-17",
  "academicYearId": 1,
  "termId": 1,
  "examSequence": "END_TERM"
}
```

#### Response

```json
{
  "id": 2,
  "name": "Updated End of Term Examination",
  "description": "Updated final assessment for first term",
  "startDate": "2023-12-12T00:00:00.000Z",
  "endDate": "2023-12-17T00:00:00.000Z",
  "academicYearId": 1,
  "termId": 1,
  "examSequence": "END_TERM",
  "updatedAt": "2023-01-02T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to update exams
- **404 Not Found**: Exam with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Delete Exam

Deletes an exam.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the exam to delete

#### Response

```json
{
  "message": "Exam deleted successfully"
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to delete exams
- **404 Not Found**: Exam with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Create Exam Paper

Creates a new exam paper for a specific exam.

- **URL**: `/:examId/papers`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal, Teacher

#### URL Parameters

- `examId`: The ID of the exam to create a paper for

#### Request Body

```json
{
  "subjectId": 1,
  "totalMarks": 100,
  "duration": 120,
  "instructions": "Answer all questions"
}
```

#### Response

```json
{
  "id": 1,
  "examId": 1,
  "subjectId": 1,
  "totalMarks": 100,
  "duration": 120,
  "instructions": "Answer all questions",
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to create exam papers
- **404 Not Found**: Exam with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Get Exam Papers

Retrieves all exam papers for a specific exam.

- **URL**: `/:examId/papers`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### URL Parameters

- `examId`: The ID of the exam to retrieve papers for

#### Response

```json
[
  {
    "id": 1,
    "examId": 1,
    "subjectId": 1,
    "totalMarks": 100,
    "duration": 120,
    "instructions": "Answer all questions",
    "subject": {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH101"
    },
    "questions": [
      {
        "id": 1,
        "question": "Solve for x: 2x + 5 = 15",
        "marks": 5
      }
    ]
  }
]
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **404 Not Found**: Exam with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Create Mark

Creates a new mark for a student's exam.

- **URL**: `/marks`
- **Method**: `POST`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal, Teacher

#### Request Body

```json
{
  "examId": 1,
  "studentId": 1,
  "subjectId": 1,
  "score": 85,
  "comment": "Excellent performance"
}
```

#### Response

```json
{
  "id": 1,
  "examId": 1,
  "studentId": 1,
  "subjectId": 1,
  "score": 85,
  "comment": "Excellent performance",
  "createdAt": "2023-01-01T12:00:00.000Z",
  "updatedAt": "2023-01-01T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to create marks
- **404 Not Found**: Exam, student, or subject with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Update Mark

Updates an existing mark.

- **URL**: `/marks/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Authorization**: Admin, Principal, Vice Principal, Teacher

#### URL Parameters

- `id`: The ID of the mark to update

#### Request Body

```json
{
  "score": 90,
  "comment": "Outstanding performance"
}
```

#### Response

```json
{
  "id": 1,
  "examId": 1,
  "studentId": 1,
  "subjectId": 1,
  "score": 90,
  "comment": "Outstanding performance",
  "updatedAt": "2023-01-02T12:00:00.000Z"
}
```

#### Error Responses

- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to update marks
- **404 Not Found**: Mark with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Delete Mark

Deletes a mark.

- **URL**: `/marks/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Authorization**: Admin, Principal

#### URL Parameters

- `id`: The ID of the mark to delete

#### Response

```json
{
  "message": "Mark deleted successfully"
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **403 Forbidden**: User does not have permission to delete marks
- **404 Not Found**: Mark with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

---

### Get Student Report Card

Generates and retrieves a report card for a specific student.

- **URL**: `/report-cards/:studentId`
- **Method**: `GET`
- **Authentication**: Required
- **Authorization**: All authenticated users

#### URL Parameters

- `studentId`: The ID of the student to generate a report card for

#### Query Parameters

- `academicYearId` (optional): Filter by academic year ID
- `termId` (optional): Filter by term ID

#### Response

```json
{
  "student": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "admissionNumber": "STU001"
  },
  "academicYear": {
    "id": 1,
    "name": "2023-2024"
  },
  "term": {
    "id": 1,
    "name": "First Term"
  },
  "subclass": {
    "id": 1,
    "name": "Class 1A"
  },
  "exams": [
    {
      "id": 1,
      "name": "Mid-Term Examination",
      "examSequence": "MID_TERM"
    },
    {
      "id": 2,
      "name": "End of Term Examination",
      "examSequence": "END_TERM"
    }
  ],
  "subjects": [
    {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH101",
      "marks": [
        {
          "examId": 1,
          "score": 85
        },
        {
          "examId": 2,
          "score": 90
        }
      ],
      "average": 87.5
    }
  ],
  "averageScore": 87.5,
  "position": 1,
  "totalStudents": 30,
  "attendance": {
    "present": 45,
    "absent": 3,
    "total": 48,
    "percentage": 93.75
  },
  "teacherComment": "Excellent performance. Keep it up!",
  "principalComment": "Outstanding student with great potential."
}
```

#### Error Responses

- **401 Unauthorized**: Authentication token is missing or invalid
- **404 Not Found**: Student with the specified ID does not exist
- **500 Internal Server Error**: Server encountered an error

## Data Models

### Exam

```typescript
interface Exam {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  academicYearId: number;
  termId: number;
  examSequence: "MID_TERM" | "END_TERM" | "MOCK" | "OTHER";
  academicYear?: AcademicYear;
  term?: Term;
  examPapers?: ExamPaper[];
  marks?: Mark[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ExamPaper

```typescript
interface ExamPaper {
  id: number;
  examId: number;
  subjectId: number;
  totalMarks: number;
  duration: number;
  instructions?: string;
  exam?: Exam;
  subject?: Subject;
  questions?: ExamPaperQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ExamPaperQuestion

```typescript
interface ExamPaperQuestion {
  id: number;
  examPaperId: number;
  question: string;
  marks: number;
  examPaper?: ExamPaper;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mark

```typescript
interface Mark {
  id: number;
  examId: number;
  studentId: number;
  subjectId: number;
  score: number;
  comment?: string;
  exam?: Exam;
  student?: Student;
  subject?: Subject;
  createdAt: Date;
  updatedAt: Date;
}
``` 