# Student Status System Documentation

## Overview

The Student Status System provides a comprehensive way to track whether a student is new to the school, an old (returning) student, or a repeater. This system is crucial for proper fee calculation and student management.

## Student Status Types

### 1. NEW Student
- **Definition**: A student who is enrolling in the school for the first time
- **Characteristics**:
  - No previous enrollments in any academic year
  - `first_enrollment_year_id` is set to their current enrollment year
  - Pays **new student fees** (additional fees for new students)

### 2. OLD Student  
- **Definition**: A student who has been in the school before and is returning
- **Characteristics**:
  - Has previous enrollments in earlier academic years
  - `first_enrollment_year_id` points to their original enrollment year
  - Pays **old student fees** (reduced additional fees)
  - Not currently repeating a class

### 3. REPEATER Student
- **Definition**: A student who is repeating the same class level
- **Characteristics**:
  - Has the `repeater` flag set to `true` in their current enrollment
  - May be new or old to the school overall
  - Pays **old student fees** (since they're not new to the school system)

## Database Schema Changes

### Student Model
```prisma
model Student {
  // ... existing fields
  first_enrollment_year_id Int?             // NEW: Track when student first joined
  first_enrollment_year    AcademicYear?    // Relation to first enrollment year
}
```

### Fee Calculation Logic
The system now uses enhanced logic to determine fees:

```typescript
// OLD Logic (limited)
if (enrollment.repeater) {
    feeAmount += classInfo.old_student_add_fee;
} else {
    feeAmount += classInfo.new_student_add_fee;
}

// NEW Logic (comprehensive)
const shouldPayNewFees = await shouldPayNewStudentFees(student_id, academic_year_id);
if (shouldPayNewFees) {
    feeAmount += classInfo.new_student_add_fee;
} else {
    feeAmount += classInfo.old_student_add_fee;
}
```

## API Endpoints

### 1. Get Student Status
```
GET /api/v1/students/:id/status?academic_year_id=123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "academic_year_id": 123,
    "status": "NEW|OLD|REPEATER",
    "isNewToSchool": true,
    "isRepeater": false,
    "firstEnrollmentYear": {
      "id": 123,
      "name": "2023-2024",
      "start_date": "2023-09-01",
      "end_date": "2024-06-30"
    },
    "yearsInSchool": 1,
    "previousEnrollments": 0
  }
}
```

### 2. Get Students with Status Summary
```
GET /api/v1/students/status/summary?academic_year_id=123&sub_class_id=456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "academic_year_id": 123,
    "sub_class_id": 456,
    "summary": {
      "total": 30,
      "new_students": 10,
      "old_students": 15,
      "repeaters": 5
    },
    "students": [
      {
        "id": 1,
        "name": "John Doe",
        "matricule": "SS23STU001",
        "statusInfo": {
          "status": "NEW",
          "isNewToSchool": true,
          "isRepeater": false,
          "yearsInSchool": 1,
          "previousEnrollments": 0
        }
      }
      // ... more students
    ]
  }
}
```

## Utility Functions

### Core Functions

1. **`getStudentStatus(studentId, academicYearId)`**
   - Returns comprehensive status information for a student
   - Determines NEW/OLD/REPEATER status

2. **`shouldPayNewStudentFees(studentId, academicYearId)`**
   - Returns boolean indicating if student should pay new student fees
   - Used in fee calculation logic

3. **`setFirstEnrollmentYear(studentId, academicYearId)`**
   - Sets the first enrollment year for a student (if not already set)
   - Called automatically during student enrollment

4. **`getStudentsWithStatus(academicYearId, subClassId?)`**
   - Returns all students with their status information
   - Supports filtering by sub-class

### Migration Function

**`migrateExistingStudentsFirstEnrollmentYear()`**
- Migrates existing students by setting their `first_enrollment_year_id`
- Sets it to their earliest enrollment year
- Should be run once after implementing the new system

## Implementation Steps

### 1. Database Migration
```bash
# Apply the schema changes
npx prisma migrate dev --name add_first_enrollment_year_to_student

# Or apply the migration file directly
psql -d your_database -f prisma/migrations/20241220_add_first_enrollment_year_to_student/migration.sql
```

### 2. Data Migration
```bash
# Run the migration script to update existing data
npx ts-node scripts/migrate-student-status.ts
```

### 3. Testing
```bash
# Test the new endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/students/1/status?academic_year_id=1"

curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/students/status/summary?academic_year_id=1"
```

## Fee Calculation Examples

### Example 1: New Student
- Student: John Doe (first time in school)
- Class: Form 1 (base_fee: 75000, new_student_add_fee: 10000)
- **Total Fee**: 75000 + 10000 = 85000

### Example 2: Old Student (Returning)
- Student: Jane Smith (was in school last year)
- Class: Form 2 (base_fee: 80000, old_student_add_fee: 5000)
- **Total Fee**: 80000 + 5000 = 85000

### Example 3: Repeater
- Student: Bob Wilson (repeating Form 1)
- Class: Form 1 (base_fee: 75000, old_student_add_fee: 5000)
- **Total Fee**: 75000 + 5000 = 80000 (pays old student fees)

## Backward Compatibility

The new system maintains backward compatibility:

1. **Existing `repeater` field**: Still used to identify students repeating a class
2. **Existing fee structure**: `new_student_add_fee` and `old_student_add_fee` fields remain unchanged
3. **Gradual migration**: Existing students without `first_enrollment_year_id` are handled gracefully

## Benefits

1. **Accurate Fee Calculation**: Proper differentiation between new and returning students
2. **Better Student Tracking**: Historical view of student enrollment patterns
3. **Reporting Capabilities**: Easy generation of new vs. old student reports
4. **Administrative Insights**: Understanding of student retention and new admissions

## Troubleshooting

### Common Issues

1. **Student shows as NEW when they should be OLD**
   - Check if `first_enrollment_year_id` is set correctly
   - Run the migration script if needed

2. **Incorrect fee calculation**
   - Verify the student's status using the status endpoint
   - Check class fee configuration

3. **Migration script fails**
   - Ensure database connectivity
   - Check for any constraint violations
   - Review error logs for specific issues

### Debugging Commands

```typescript
// Check student's enrollment history
const student = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    enrollments: {
      include: { academic_year: true },
      orderBy: { academic_year: { start_date: 'asc' } }
    },
    first_enrollment_year: true
  }
});

// Get detailed status information
const status = await getStudentStatus(studentId, academicYearId);
console.log('Student Status:', status);
```
