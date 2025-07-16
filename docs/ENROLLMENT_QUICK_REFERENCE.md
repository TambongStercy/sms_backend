# Student Enrollment System - Quick Reference

## 🎯 Key Concepts

| Level | Status | Endpoint | Purpose |
|-------|--------|----------|---------|
| **Level 1** | `ASSIGNED_TO_CLASS` | `POST /students/:id/assign-class` | Class assignment only |
| **Level 2** | `ENROLLED` | `POST /students/:id/enroll` | Subclass assignment (final) |

## 🔄 Status Flow

```
NOT_ENROLLED → ASSIGNED_TO_CLASS → ENROLLED
```

## 📡 API Endpoints

### Class Assignment (Level 1)
```bash
POST /api/v1/students/:id/assign-class
```
```json
{
  "classId": 1,
  "academicYearId": 2,
  "photo": "optional",
  "repeater": false
}
```

### Subclass Enrollment (Level 2)
```bash
POST /api/v1/students/:id/enroll
```
```json
{
  "subClassId": 5,
  "academicYearId": 2,
  "photo": "optional",
  "repeater": false
}
```

## 🚨 Important Rules

1. **Cannot reassign class-only** if student already has subclass
2. **Unique constraint**: One enrollment per student per academic year
3. **Auto-creates fees** for new enrollments
4. **Status updates** happen automatically

## 💡 Common Use Cases

### New Student Workflow
```javascript
// 1. Create student
const student = await createStudent(data);

// 2. Assign to class (after registration)
await assignStudentToClass(student.id, { class_id: 1 });
// Status: ASSIGNED_TO_CLASS

// 3. Assign to subclass (after interview)
await enrollStudentInSubclass(student.id, { sub_class_id: 2 });
// Status: ENROLLED
```

### Direct Enrollment (Returning Students)
```javascript
// Skip intermediate step for known students
await enrollStudentInSubclass(student.id, { sub_class_id: 8 });
// Status: ENROLLED
```

## 🔧 Service Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `assignStudentToClass()` | Class assignment | `Enrollment & { fee_id }` |
| `enrollStudentInSubclass()` | Subclass assignment | `Enrollment & { fee_id }` |
| `enrollStudent()` | Legacy (calls subclass) | `Enrollment & { fee_id }` |

## ❌ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Already assigned to subclass" | Trying class-only on enrolled student | Use subclass endpoint |
| "Class not found" | Invalid class_id | Verify class exists |
| "Unique constraint failed" | Duplicate enrollment | Check existing enrollment |

## 🔍 Quick Debug

```sql
-- Check student enrollment status
SELECT s.name, s.status, e.class_id, e.sub_class_id, 
       c.name as class_name, sc.name as subclass_name
FROM Student s
LEFT JOIN Enrollment e ON s.id = e.student_id
LEFT JOIN Class c ON e.class_id = c.id
LEFT JOIN SubClass sc ON e.sub_class_id = sc.id
WHERE s.id = :student_id;
```

## 🎯 Authorization

- **Required Roles**: `SUPER_MANAGER`, `MANAGER`, `PRINCIPAL`, `VICE_PRINCIPAL`, `BURSAR`
- **Teachers**: Can only view students in their assigned subclasses

## 📚 Full Documentation

See [STUDENT_ENROLLMENT_SYSTEM.md](./STUDENT_ENROLLMENT_SYSTEM.md) for complete details. 