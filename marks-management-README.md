# School Management System - Marks Management Flow Guide

This document provides a comprehensive guide for frontend developers implementing the marks management functionality in the School Management System.

## Overview

The marks management feature allows authorized users (Super Managers, Principals, Vice Principals, and Teachers) to:

1. View students enrolled in specific classes/subclasses
2. Enter, update, and delete marks (scores) for these students
3. Filter marks by academic year, term, exam sequence, class, subclass, and subject

## API Workflow

The typical marks management workflow follows these steps:

### 1. Selection Context (Filtering)

First, the user needs to select the context for marks management:

1. **Select Academic Year** - Get the list of academic years and let the user select one
2. **Select Class** - Get the list of classes and let the user select one
3. **Select Subclass** - Based on the selected class, get its subclasses and let the user select one
4. **Select Term** - Based on the selected academic year, get its terms and let the user select one
5. **Select Exam Sequence** - Based on the selected term and academic year, get exam sequences and let the user select one
6. **Select Subject** - Get subjects for the selected subclass and let the user select one

### 2. Get Students and Existing Marks

Once the context is fully selected, retrieve both:

1. **Enrolled Students** - Get all students enrolled in the selected subclass for the selected academic year
2. **Existing Marks** - Get any existing marks for the context (if any have been recorded already)

### 3. Mark Entry/Update Functionality

With the list of students and any existing marks:

1. **Display a Table** - Show a list of students with input fields for marks
2. **Pre-populate** - If a student already has a mark for this context, pre-populate the input
3. **Create/Update/Delete** - Allow creating new marks, updating existing ones, or deleting marks

## API Reference

### Selection Context APIs

#### 1. Get Academic Years
```http
GET /api/v1/academic-years
Authorization: Bearer your-token
```

Response structure:
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "2023-2024",
      "startDate": "2023-09-04T00:00:00.000Z",
      "endDate": "2024-06-15T00:00:00.000Z"
    },
    // ... more academic years
  ]
}
```

#### 2. Get Classes
```http
GET /api/v1/classes
Authorization: Bearer your-token
```

#### 3. Get Subclasses for a Class
```http
GET /api/v1/classes/{classId}/sub-classes
Authorization: Bearer your-token
```

#### 4. Get Terms for an Academic Year
```http
GET /api/v1/academic-years/{academicYearId}/terms
Authorization: Bearer your-token
```

#### 5. Get Exam Sequences
```http
GET /api/v1/exams?termId={termId}&academicYearId={academicYearId}
Authorization: Bearer your-token
```

#### 6. Get Subjects for a Subclass
```http
GET /api/v1/classes/sub-classes/{subclassId}/subjects?includeSubjects=true
Authorization: Bearer your-token
```

### Students and Marks APIs

#### 7. Get Enrolled Students
```http
GET /api/v1/students?subclassId={subclassId}&academicYearId={academicYearId}&status=ENROLLED
Authorization: Bearer your-token
```

Response structure:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "matricule": "STD001",
      // ... other student properties
    },
    // ... more students
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

#### 8. Get Existing Marks
```http
GET /api/v1/marks?subClassId={subclassId}&examSequenceId={examSequenceId}&academicYearId={academicYearId}&subjectId={subjectId}
Authorization: Bearer your-token
```

Response structure:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "studentId": 5,
      "score": 15.5,
      "comment": "Good effort",
      // ... other mark properties
    },
    // ... more marks
  ]
}
```

### Mark Management APIs

#### 9. Create a Mark
```http
POST /api/v1/marks
Authorization: Bearer your-token
Content-Type: application/json

{
  "studentId": 5,
  "subjectId": 3,
  "examId": 2,
  "teacherId": 1, // Usually the ID of the logged-in user
  "mark": 15.5,
  "comment": null // Optional
}
```

#### 10. Update a Mark
```http
PUT /api/v1/marks/{markId}
Authorization: Bearer your-token
Content-Type: application/json

{
  "mark": 16.0,
  "comment": "Good improvement" // Optional
}
```

#### 11. Delete a Mark
```http
DELETE /api/v1/marks/{markId}
Authorization: Bearer your-token
```

## Frontend Implementation Strategy

1. **Create a Multi-Select Filter Component**:
   - Implement cascading dropdowns for the selection context
   - Each selection should filter the next dropdown's options

2. **Create a Marks Entry Table**:
   - Once all filters are selected, display the student list with mark entry fields
   - Include validation for mark values (0-20)
   - Consider batch operations for efficiency (save all changes at once)

3. **Implement Optimistic Updates**:
   - Update UI immediately on user input
   - Send API requests in the background
   - Handle success/failure responses appropriately

4. **Add User Feedback**:
   - Show loading states during API calls
   - Display success/error messages
   - Implement confirmation dialogs for destructive actions (like delete)

## Common Challenges and Solutions

1. **Missing Filter Parameters**:
   - Ensure all required parameters (subClassId, examSequenceId, academicYearId, subjectId) are provided when fetching marks
   - The absence of any parameter will lead to empty results

2. **Case Conversion Awareness**:
   - The frontend should use camelCase for field names (e.g., `subClassId`, `examSequenceId`)
   - The backend automatically converts these to snake_case internally

3. **Authentication/Authorization**:
   - All APIs require a valid JWT token in the Authorization header
   - Ensure the user has appropriate permissions (SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, or TEACHER)

## Sample Frontend Code Structure

```typescript
// marks-management.component.ts
async function loadMarks() {
  // 1. Ensure all filters are selected
  if (!academicYearId || !classId || !subclassId || !termId || !examSequenceId || !subjectId) {
    return;
  }

  // 2. Get students for the selected subclass and academic year
  const studentsResponse = await api.get(
    `/students?subclassId=${subclassId}&academicYearId=${academicYearId}&status=ENROLLED`
  );
  const students = studentsResponse.data.data;

  // 3. Get any existing marks
  const marksResponse = await api.get(
    `/marks?subClassId=${subclassId}&examSequenceId=${examSequenceId}&academicYearId=${academicYearId}&subjectId=${subjectId}`
  );
  const marks = marksResponse.data.data;

  // 4. Combine students with their marks (if any)
  const studentsWithMarks = students.map(student => {
    const studentMark = marks.find(mark => mark.studentId === student.id);
    return {
      ...student,
      markId: studentMark?.id,
      score: studentMark?.score || null
    };
  });

  // 5. Set state for rendering
  setStudentMarks(studentsWithMarks);
}

async function saveOrUpdateMark(student, newScore) {
  // If student already has a mark, update it
  if (student.markId) {
    await api.put(`/marks/${student.markId}`, {
      mark: newScore
    });
  } 
  // Otherwise create a new mark
  else {
    await api.post('/marks', {
      studentId: student.id,
      subjectId: subjectId,
      examId: examSequenceId,
      teacherId: currentUser.id, // From auth context
      mark: newScore
    });
  }

  // Refresh the marks list
  await loadMarks();
}
```

## Best Practices

1. **Error Handling**: Implement comprehensive error handling for API calls
2. **Validation**: Validate mark values on the frontend (0-20 range)
3. **Caching**: Consider caching frequently used data (like academic years, classes)
4. **Real-time Updates**: Consider implementing real-time updates if multiple users might be editing marks simultaneously
5. **Permissions**: Respect user role permissions in the UI
6. **Accessibility**: Ensure the marks entry form is accessible (keyboard navigation, screen readers)

---

For more information or troubleshooting, please contact the backend team. 