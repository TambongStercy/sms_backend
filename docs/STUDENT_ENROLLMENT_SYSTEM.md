# Student Enrollment System Documentation

## Overview

The School Management System implements a **two-level enrollment system** that reflects the real-world process of student registration and assignment. This system ensures proper workflow management and prevents enrollment conflicts.

## Enrollment Levels

### Level 1: Class Assignment
- **Purpose**: Initial assignment of a student to a class
- **Status**: `ASSIGNED_TO_CLASS`
- **Database**: `enrollment.sub_class_id = null`
- **When**: Used for new students who need to go through interview/assessment process

### Level 2: Subclass Enrollment (Final)
- **Purpose**: Final assignment to a specific subclass within the class
- **Status**: `ENROLLED`
- **Database**: `enrollment.sub_class_id = specific_subclass_id`
- **When**: After VP interview, assessment, or direct assignment for returning students

## Student Status Flow

```
NOT_ENROLLED → ASSIGNED_TO_CLASS → ENROLLED
     ↑               ↑                ↑
New student    Class assigned    Subclass assigned
registration   (Level 1)        (Level 2 - Final)
```

## API Endpoints

### 1. Assign Student to Class (Level 1)

**Endpoint**: `POST /api/v1/students/:id/assign-class`

**Purpose**: Creates an enrollment record with class assignment only

**Request Body**:
```json
{
  "classId": 1,
  "academicYearId": 2,
  "photo": "student_photo.jpg",
  "repeater": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "student_id": 45,
    "class_id": 1,
    "sub_class_id": null,
    "academic_year_id": 2,
    "repeater": false,
    "photo": "student_photo.jpg",
    "fee_id": 789
  }
}
```

**Business Logic**:
- Creates new enrollment if none exists
- Updates existing enrollment if no subclass assigned
- **Error**: Returns 409 if student already assigned to a subclass
- Sets student status to `ASSIGNED_TO_CLASS`
- Creates fee record automatically

### 2. Enroll Student in Subclass (Level 2)

**Endpoint**: `POST /api/v1/students/:id/enroll`

**Purpose**: Assigns student to a specific subclass (final enrollment)

**Request Body**:
```json
{
  "subClassId": 5,
  "academicYearId": 2,
  "photo": "student_photo.jpg",
  "repeater": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "student_id": 45,
    "class_id": 1,
    "sub_class_id": 5,
    "academic_year_id": 2,
    "repeater": false,
    "photo": "student_photo.jpg",
    "fee_id": 789
  }
}
```

**Business Logic**:
- Updates existing enrollment with subclass assignment
- Creates new enrollment with subclass (for direct enrollment scenarios)
- Sets student status to `ENROLLED`
- Reuses existing fee or creates new one

### 3. Legacy Endpoint

**Endpoint**: `POST /api/v1/students/:id/assign-subclass`

**Purpose**: Legacy endpoint that calls the subclass enrollment function

## Service Functions

### `assignStudentToClass(student_id, data)`

**Parameters**:
- `student_id`: Number - Student ID
- `data.class_id`: Number - Class ID to assign
- `data.academic_year_id`: Number (optional) - Academic year
- `data.photo`: String (optional) - Student photo
- `data.repeater`: Boolean (optional) - Repeater status

**Returns**: `Enrollment & { fee_id: number }`

**Behavior**:
```javascript
// Check if enrollment exists
const existingEnrollment = await findEnrollment(student_id, academic_year_id);

if (existingEnrollment) {
  // Error if already has subclass
  if (existingEnrollment.sub_class_id) {
    throw new Error("Student is already assigned to a subclass");
  }
  // Update with class assignment
  return updateEnrollment(existingEnrollment.id, { class_id });
} else {
  // Create new enrollment with class only
  return createEnrollment({ 
    student_id, 
    class_id, 
    sub_class_id: null 
  });
}
```

### `enrollStudentInSubclass(student_id, data)`

**Parameters**:
- `student_id`: Number - Student ID
- `data.sub_class_id`: Number - Subclass ID to assign
- `data.academic_year_id`: Number (optional) - Academic year
- `data.photo`: String (optional) - Student photo
- `data.repeater`: Boolean (optional) - Repeater status

**Returns**: `Enrollment & { fee_id: number }`

**Behavior**:
```javascript
// Check if enrollment exists
const existingEnrollment = await findEnrollment(student_id, academic_year_id);

if (existingEnrollment) {
  // Update with subclass assignment
  return updateEnrollment(existingEnrollment.id, { 
    sub_class_id, 
    class_id: subclass.class_id 
  });
} else {
  // Create new enrollment with subclass (direct enrollment)
  return createEnrollment({ 
    student_id, 
    class_id: subclass.class_id,
    sub_class_id 
  });
}
```

## Use Cases

### Case 1: New Student Registration
```javascript
// Step 1: Create student
const student = await createStudent({
  name: "John Doe",
  dateOfBirth: "2008-05-15",
  // ... other details
});

// Step 2: Assign to class (after registration)
const enrollment = await assignStudentToClass(student.id, {
  class_id: 1 // Form 1
});
// Student status: ASSIGNED_TO_CLASS

// Step 3: Assign to subclass (after VP interview)
const finalEnrollment = await enrollStudentInSubclass(student.id, {
  sub_class_id: 2 // Form 1A
});
// Student status: ENROLLED
```

### Case 2: Returning Student Direct Enrollment
```javascript
// Direct enrollment for known students
const enrollment = await enrollStudentInSubclass(student.id, {
  sub_class_id: 8 // Form 3B
});
// Student status: ENROLLED (skip intermediate step)
```

### Case 3: Transfer Student
```javascript
// Transfer from one subclass to another
const enrollment = await enrollStudentInSubclass(student.id, {
  sub_class_id: 9 // New subclass
});
// Updates existing enrollment
```

## Error Handling

### Common Errors

1. **Already Assigned to Subclass**
   ```json
   {
     "success": false,
     "error": "Student is already assigned to a subclass. Cannot reassign to class only."
   }
   ```

2. **Class/Subclass Not Found**
   ```json
   {
     "success": false,
     "error": "Class with ID 999 not found"
   }
   ```

3. **Unique Constraint Violation**
   ```json
   {
     "success": false,
     "error": "Student already enrolled in this academic year"
   }
   ```

## Database Schema

### Enrollment Table
```sql
CREATE TABLE Enrollment (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,        -- Always required
  sub_class_id INTEGER,             -- NULL for class-only assignment
  academic_year_id INTEGER NOT NULL,
  repeater BOOLEAN DEFAULT FALSE,
  photo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, academic_year_id)  -- One enrollment per year
);
```

### Student Status Values
```sql
CREATE TYPE StudentStatus AS ENUM (
  'NOT_ENROLLED',      -- No enrollment record
  'ASSIGNED_TO_CLASS', -- Has class but no subclass
  'ENROLLED',          -- Has both class and subclass
  'GRADUATED',
  'TRANSFERRED',
  'SUSPENDED'
);
```

## Integration Points

### Fee Management
- Fee records are automatically created during enrollment
- Existing fees are reused when updating enrollments
- Fee calculation considers student type (new/old) and class structure

### Academic Year Management
- Defaults to current academic year if not specified
- Validates academic year exists and is accessible
- Supports cross-year operations for administrators

### Authentication & Authorization
- **Class Assignment**: Requires MANAGER+ roles
- **Subclass Enrollment**: Requires MANAGER+ roles
- **Teachers**: Can only view students in their assigned subclasses

## Best Practices

### 1. Workflow Management
```javascript
// ✅ Correct workflow
await assignStudentToClass(studentId, { class_id: 1 });
// ... VP interview process ...
await enrollStudentInSubclass(studentId, { sub_class_id: 2 });

// ❌ Avoid skipping levels for new students
await enrollStudentInSubclass(newStudentId, { sub_class_id: 2 });
```

### 2. Error Handling
```javascript
try {
  await assignStudentToClass(studentId, data);
} catch (error) {
  if (error.message.includes('already assigned to a subclass')) {
    // Handle reassignment error
    console.log('Student already fully enrolled');
  }
}
```

### 3. Status Checking
```javascript
// Check student status before operations
const student = await getStudentById(studentId);
if (student.status === 'ENROLLED') {
  // Student is fully enrolled
} else if (student.status === 'ASSIGNED_TO_CLASS') {
  // Can proceed with subclass assignment
}
```

## Testing

### Test Scenarios

1. **New Student Flow**
   - Create student → Assign class → Assign subclass
   - Verify status transitions

2. **Direct Enrollment**
   - Create student → Direct subclass enrollment
   - Verify proper class assignment

3. **Error Cases**
   - Try to assign class to already enrolled student
   - Invalid class/subclass IDs
   - Duplicate enrollments

4. **Edge Cases**
   - Cross-academic-year operations
   - Fee handling during updates
   - Photo and repeater flag management

### Sample Test Data
The `comprehensive-test-seed.ts` provides realistic test data with:
- 10 fully enrolled students (`ENROLLED` status)
- 2 not enrolled students (`NOT_ENROLLED` status)
- 1 class-assigned student (`ASSIGNED_TO_CLASS` status)

## Migration Notes

### From Single-Level to Two-Level System

If migrating from a simpler enrollment system:

1. **Data Migration**
   ```sql
   -- Update existing enrollments with subclass to ENROLLED
   UPDATE Student 
   SET status = 'ENROLLED' 
   WHERE id IN (
     SELECT student_id FROM Enrollment 
     WHERE sub_class_id IS NOT NULL
   );
   
   -- Update existing enrollments without subclass to ASSIGNED_TO_CLASS
   UPDATE Student 
   SET status = 'ASSIGNED_TO_CLASS' 
   WHERE id IN (
     SELECT student_id FROM Enrollment 
     WHERE sub_class_id IS NULL
   );
   ```

2. **API Updates**
   - Replace old enrollment endpoints
   - Update client applications to use two-step process
   - Add proper error handling for new constraints

## Troubleshooting

### Common Issues

1. **"Already assigned to subclass" Error**
   - **Cause**: Trying to assign class-only to a fully enrolled student
   - **Solution**: Use subclass enrollment endpoint instead

2. **Fee Creation Failures**
   - **Cause**: Missing class fee structure or invalid enrollment data
   - **Solution**: Ensure class has proper fee configuration

3. **Status Inconsistencies**
   - **Cause**: Manual database updates bypassing service layer
   - **Solution**: Always use service functions for enrollment operations

### Debug Queries

```sql
-- Check enrollment status
SELECT s.name, s.status, e.class_id, e.sub_class_id, c.name as class_name, sc.name as subclass_name
FROM Student s
LEFT JOIN Enrollment e ON s.id = e.student_id
LEFT JOIN Class c ON e.class_id = c.id
LEFT JOIN SubClass sc ON e.sub_class_id = sc.id
WHERE s.id = :student_id;

-- Find orphaned enrollments
SELECT * FROM Enrollment e
LEFT JOIN Student s ON e.student_id = s.id
WHERE s.id IS NULL;
```

## Future Enhancements

- **Batch Enrollment**: Support for bulk student assignments
- **Enrollment History**: Track historical enrollment changes
- **Conditional Logic**: Rule-based automatic subclass assignment
- **Integration**: Webhook support for enrollment events
- **Analytics**: Enrollment pattern analysis and reporting 