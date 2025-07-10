# School Management System - Complete API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Parent Portal](#parent-portal)
3. [Quiz System](#quiz-system)
4. [Vice Principal (Student Management)](#vice-principal-student-management)
5. [Bursar (Financial Management)](#bursar-financial-management)
6. [Discipline Master/SDM](#discipline-mastersдm)
7. [Teacher Portal](#teacher-portal)
8. [HOD (Head of Department)](#hod-head-of-department)
9. [Timetable Management](#timetable-management)
10. [Academic Year Management](#academic-year-management)
11. [Student Management](#student-management)
12. [User Management](#user-management)
13. [Exam and Marks Management](#exam-and-marks-management)
14. [Class and Subject Management](#class-and-subject-management)
15. [Dashboard Endpoints](#dashboard-endpoints)
16. [Authorization Testing](#authorization-testing)

---

## Authentication

### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```typescript
{
  email?: string;      // Optional if matricule provided
  matricule?: string;  // Optional if email provided
  password: string;    // Required
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  data: {
    token: string;
    expiresIn: string; // "24h"
    user: {
      id: number;
      name: string;
      email: string;
      matricule: string;
      gender: "MALE" | "FEMALE";
      dateOfBirth: string;
      phone: string;
      address: string;
      idCardNum?: string;
      photo?: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      userRoles: Array<{
        id: number;
        userId: number;
        role: "SUPER_MANAGER" | "MANAGER" | "PRINCIPAL" | "VICE_PRINCIPAL" | "BURSAR" | "DISCIPLINE_MASTER" | "TEACHER" | "HOD" | "PARENT" | "STUDENT";
        academicYearId?: number;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  };
}
```

**Error Response (401):**
```typescript
{
  success: false;
  error: "Invalid credentials";
}
```

### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```typescript
{
  name: string;
  email: string;
  password: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string; // "YYYY-MM-DD"
  phone: string;
  address: string;
  idCardNum?: string;
  photo?: string;
  status?: string;
}
```

### Get Profile
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

---

## Parent Portal

### Parent Dashboard
```http
GET /api/v1/parents/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number; // Optional
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalChildren: number;
    childrenEnrolled: number;
    pendingFees: number;
    totalFeesOwed: number;
    latestGrades: number;
    disciplineIssues: number;
    unreadMessages: number;
    upcomingEvents: number;
    children: Array<{
      id: number;
      name: string;
      className?: string;
      subclassName?: string;
      enrollmentStatus: string;
      photo?: string;
      attendanceRate: number;
      latestMarks: Array<{
        subjectName: string;
        latestMark: number;
        sequence: string;
        date: string;
      }>;
      pendingFees: number;
      disciplineIssues: number;
      recentAbsences: number;
    }>;
  };
}
```

### Get Child Details
```http
GET /api/v1/parents/children/:studentId
Authorization: Bearer <token>
```

**Path Parameters:**
- `studentId` (number): Student ID

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    id: number;
    name: string;
    matricule: string;
    dateOfBirth: string;
    classInfo?: {
      className: string;
      subclassName: string;
      classMaster?: string;
    };
    attendance: {
      presentDays: number;
      absentDays: number;
      lateDays: number;
      attendanceRate: number;
    };
    academicPerformance: {
      subjects: Array<{
        subjectName: string;
        teacherName: string;
        marks: Array<{
          sequence: string;
          mark: number;
          total: number;
          date: string;
        }>;
        average: number;
      }>;
      overallAverage: number;
      positionInClass?: number;
    };
    fees: {
      totalExpected: number;
      totalPaid: number;
      outstandingBalance: number;
      lastPaymentDate?: string;
      paymentHistory: Array<{
        id: number;
        amount: number;
        paymentDate: string;
        paymentMethod: string;
        receiptNumber?: string;
        recordedBy: string;
      }>;
    };
    discipline: {
      totalIssues: number;
      recentIssues: Array<{
        id: number;
        type: string;
        description: string;
        dateOccurred: string;
        status: string;
        resolvedAt?: string;
      }>;
    };
    reports: {
      availableReports: Array<{
        id: number;
        sequenceName: string;
        academicYear: string;
        generatedAt: string;
        downloadUrl: string;
      }>;
    };
  };
}
```

### Send Message to Staff
```http
POST /api/v1/parents/message-staff
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  recipientId: number;    // Required - Staff member ID
  subject: string;         // Required
  message: string;         // Required
  priority?: "LOW" | "MEDIUM" | "HIGH";
  studentId?: number;     // Optional - If message is about specific child
}
```

### Get Child Quiz Results
```http
GET /api/v1/parents/children/:studentId/quiz-results
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

### Get Child Analytics
```http
GET /api/v1/parents/children/:studentId/analytics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    studentInfo: {
      id: number;
      name: string;
      classInfo: object;
    };
    performanceAnalytics: {
      overallAverage: number;
      grade: string;
      classRank?: number;
      improvementTrend: "IMPROVING" | "DECLINING" | "STABLE";
      subjectsAboveAverage: number;
      subjectsBelowAverage: number;
      recommendation: string;
    };
    attendanceAnalytics: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      attendanceRate: number;
      status: string;
      monthlyTrends: Array<{
        month: string;
        attendanceRate: number;
      }>;
    };
    quizAnalytics: {
      totalQuizzes: number;
      completedQuizzes: number;
      averageScore: number;
      highestScore: number;
      completionRate: number;
      recentQuizzes: Array<object>;
    };
    subjectTrends: Array<{
      subjectName: string;
      currentAverage: number;
      trend: "IMPROVING" | "DECLINING" | "STABLE";
      bestMark: number;
      lowestMark: number;
    }>;
    comparativeAnalytics: {
      studentAverage: number;
      classAverage: number;
      aboveClassAverage: boolean;
      percentileRank?: number;
    };
  };
}
```

### Get All Children Quiz Results
```http
GET /api/v1/parents/children/quiz-results
Authorization: Bearer <token>
```

### Get School Announcements
```http
GET /api/v1/parents/announcements
Authorization: Bearer <token>
```

---

## Quiz System

### Create Quiz (Teachers/Admin)
```http
POST /api/v1/quiz
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  title: string;
  description?: string;
  subjectId: number;
  classIds: number[];    // Array of class IDs
  timeLimit?: number;    // Minutes
  totalMarks?: number;   // Defaults to 10
  startDate?: string;    // "YYYY-MM-DD"
  endDate?: string;      // "YYYY-MM-DD"
  questions: Array<{
    questionText: string;
    questionType?: "MCQ" | "LONG_ANSWER"; // Defaults to MCQ
    options?: string[];   // For MCQ questions
    correctAnswer: string;
    marks?: number;       // Defaults to 1
    explanation?: string;
  }>;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Quiz created successfully";
  data: {
    id: number;
    title: string;
    description?: string;
    subjectId: number;
    classIds: string;    // JSON string
    timeLimit?: number;
    totalMarks: number;
    startDate?: string;
    endDate?: string;
    createdById: number;
    academicYearId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    questions: Array<{
      id: number;
      quizId: number;
      questionText: string;
      questionType: "MCQ" | "LONG_ANSWER";
      options?: string;   // JSON string for MCQ
      correctAnswer: string;
      marks: number;
      orderIndex: number;
      explanation?: string;
    }>;
    subject: {
      id: number;
      name: string;
      // ... other subject fields
    };
    createdBy: {
      id: number;
      name: string;
      matricule: string;
    };
  };
}
```

### Get Available Quizzes for Student
```http
GET /api/v1/quiz/student/:studentId/available
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    title: string;
    description?: string;
    subject: string;
    timeLimit?: number;
    totalMarks: number;
    questionCount: number;
    startDate?: string;
    endDate?: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    lastAttempt?: {
      score: number;
      percentage: number;
    };
  }>;
}
```

### Start Quiz
```http
POST /api/v1/quiz/start
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  quizId: number;
  studentId: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Quiz started successfully";
  data: {
    id: number;
    quizId: number;
    studentId: number;
    parentId: number;
    status: "IN_PROGRESS";
    startedAt: string;
    // ... submission details
  };
}
```

### Submit Quiz
```http
POST /api/v1/quiz/submissions/:submissionId/submit
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  responses: Array<{
    questionId: number;
    selectedAnswer: string;
    timeSpent?: number; // Seconds
  }>;
}
```

### Get Quiz Results
```http
GET /api/v1/quiz/student/:studentId/results
Authorization: Bearer <token>
```

### Get Detailed Quiz Results
```http
GET /api/v1/quiz/submissions/:submissionId/detailed
Authorization: Bearer <token>
```

### Get Quiz Statistics (Teachers)
```http
GET /api/v1/quiz/:quizId/statistics
Authorization: Bearer <token>
```

### Get All Quizzes (Teachers/Admin)
```http
GET /api/v1/quiz
Authorization: Bearer <token>
```

---

## Vice Principal (Enhanced Student Management)

### Get Vice Principal Dashboard
```http
GET /api/v1/vice-principal/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    studentsAssigned: number;
    pendingInterviews: number;
    completedInterviews: number;
    awaitingAssignment: number;
    recentDisciplineIssues: number;
    classesWithPendingReports: number;
    teacherAbsences: number;
    enrollmentTrends: {
      thisMonth: number;
      lastMonth: number;
      trend: "INCREASING" | "DECREASING" | "STABLE";
    };
    subclassCapacityUtilization: Array<{
      subclassName: string;
      className: string;
      currentCapacity: number;
      maxCapacity: number;
      utilizationRate: number;
    }>;
    urgentTasks: Array<{
      type: "INTERVIEW_OVERDUE" | "ASSIGNMENT_PENDING" | "CAPACITY_EXCEEDED";
      description: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      count: number;
    }>;
  };
}
```

### Get Student Management Overview
```http
GET /api/v1/vice-principal/student-management
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    byStatus: {
      notEnrolled: number;
      interviewPending: number;
      interviewCompleted: number;
      assignedToClass: number;
      enrolled: number;
    };
    interviewMetrics: {
      totalConducted: number;
      averageScore: number;
      passRate: number;
      pendingInterviews: number;
      overdueInterviews: number;
    };
    classAssignmentMetrics: {
      totalAssigned: number;
      awaitingAssignment: number;
      classCapacityIssues: number;
      recentAssignments: number;
    };
  };
}
```

### Get Interview Management Data
```http
GET /api/v1/vice-principal/interviews
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  status?: "PENDING" | "COMPLETED" | "OVERDUE";
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    studentId: number;
    studentName: string;
    studentMatricule: string;
    className: string;
    interviewStatus: "PENDING" | "COMPLETED" | "OVERDUE";
    scheduledDate?: string;
    completedDate?: string;
    score?: number;
    comments?: string;
    interviewerName?: string;
    daysOverdue?: number;
    registrationDate: string;
  }>;
  count: number;
}
```

### Get Subclass Optimization
```http
GET /api/v1/vice-principal/subclass-optimization
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    classId: number;
    className: string;
    subclasses: Array<{
      id: number;
      name: string;
      currentEnrollment: number;
      maxCapacity: number;
      utilizationRate: number;
      availableSpots: number;
      status: "OPTIMAL" | "UNDERUTILIZED" | "OVERLOADED" | "FULL";
      recommendations: Array<string>;
    }>;
    overallUtilization: number;
    recommendations: Array<{
      type: "BALANCE_ENROLLMENT" | "CREATE_SUBCLASS" | "MERGE_SUBCLASS";
      description: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
    }>;
  }>;
}
```

### Get Student Progress Tracking
```http
GET /api/v1/vice-principal/student-progress/:studentId
Authorization: Bearer <token>
```

**Path Parameters:**
- `studentId` (number): Student ID

**Response (200):**
```typescript
{
  success: true;
  data: {
    studentId: number;
    studentName: string;
    matricule: string;
    enrollmentJourney: Array<{
      stage: "REGISTERED" | "INTERVIEWED" | "ASSIGNED" | "ENROLLED";
      date: string;
      details: string;
      completedBy?: string;
    }>;
    currentStatus: string;
    nextAction: string;
    daysInCurrentStage: number;
    alerts: Array<string>;
  };
}
```

### Bulk Schedule Interviews
```http
POST /api/v1/vice-principal/bulk-schedule-interviews
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentIds: number[];
  scheduledDate: string; // "YYYY-MM-DD"
  academicYearId?: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Successfully scheduled X interviews";
  data: {
    scheduled: number;
    errors: Array<{
      studentId: number;
      error: string;
    }>;
  };
}
```

### Get Enrollment Analytics
```http
GET /api/v1/vice-principal/enrollment-analytics
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    enrollmentTrends: Array<{
      date: string;
      count: number;
    }>;
    genderDistribution: Array<{
      gender: "MALE" | "FEMALE";
      count: number;
    }>;
    ageDistribution: Array<{
      ageRange: string;
      count: number;
    }>;
    classDistribution: Array<{
      classId: number;
      enrollmentCount: number;
      lastEnrollment: string;
    }>;
  };
}
```

### Get Students Requiring Attention
```http
GET /api/v1/vice-principal/students-requiring-attention
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    pendingInterviews: {
      count: number;
      students: Array<object>; // Limited to 10
    };
    overdueInterviews: {
      count: number;
      students: Array<object>;
    };
    awaitingAssignment: {
      count: number;
      students: Array<object>;
    };
    totalRequiringAttention: number;
  };
}
```

### Get Class Capacity Analysis
```http
GET /api/v1/vice-principal/class-capacity-analysis
Authorization: Bearer <token>
```

### Get Quick Statistics
```http
GET /api/v1/vice-principal/quick-stats
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    studentsAssigned: number;
    pendingInterviews: number;
    awaitingAssignment: number;
    completionRate: number;
    interviewCompletionRate: number;
    urgentTasksCount: number;
    enrollmentTrend: "INCREASING" | "DECREASING" | "STABLE";
    averageInterviewScore: number;
  };
}
```

---

## Enrollment Workflow (Basic Operations)

### Register Student to Class (Bursar Function)
```http
POST /api/v1/enrollment/register
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  dateOfBirth: string;     // "YYYY-MM-DD"
  placeOfBirth: string;
  gender: "MALE" | "FEMALE";
  residence: string;
  formerSchool?: string;
  classId: number;          // Required
  academicYearId?: number; // Optional, defaults to current
  isNewStudent?: boolean;  // Defaults to true
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Student registered successfully. Awaiting VP interview.";
  data: {
    student: {
      id: number;
      matricule: string;
      name: string;
      dateOfBirth: string;
      placeOfBirth: string;
      gender: "MALE" | "FEMALE";
      residence: string;
      formerSchool?: string;
      isNewStudent: boolean;
      status: "NOT_ENROLLED";
      // ... other fields
    };
    enrollment: {
      id: number;
      studentId: number;
      classId: number;
      subClassId?: number; // null until VP assigns
      academicYearId: number;
      // ... other enrollment fields
    };
  };
}
```

### Record Interview Mark
```http
POST /api/v1/enrollment/interview
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  score: number;             // Interview score
  comments?: string;
  academicYearId?: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Interview mark recorded successfully. Student ready for subclass assignment.";
  data: {
    id: number;
    studentId: number;
    interviewerId: number;
    score: number;
    comments?: string;
    academicYearId: number;
    interviewDate: string;
  };
}
```

### Assign Student to Subclass
```http
POST /api/v1/enrollment/assign-subclass
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  subClassId: number;
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Student successfully assigned to subclass. Enrollment complete.";
  data: {
    enrollment: {
      id: number;
      studentId: number;
      classId: number;
      subClassId: number;
      academicYearId: number;
      status: "ASSIGNED_TO_CLASS";
      // ... updated enrollment
    };
  };
}
```

### Get Unassigned Students
```http
GET /api/v1/enrollment/unassigned
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Unassigned students retrieved successfully";
  data: Array<{
    id: number;
    name: string;
    matricule: string;
    dateOfBirth: string;
    className: string;
    interviewStatus: "PENDING" | "COMPLETED";
    interviewScore?: number;
    registrationDate: string;
  }>;
  count: number;
}
```

### Get Available Subclasses
```http
GET /api/v1/enrollment/available-subclasses/:classId
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Available subclasses retrieved successfully";
  data: Array<{
    id: number;
    name: string;
    capacity: number;
    currentEnrollment: number;
    availableSpots: number;
    classId: number;
    className: string;
  }>;
}
```

### Get Enrollment Statistics
```http
GET /api/v1/enrollment/stats
Authorization: Bearer <token>
```

### Get Student Enrollment Status
```http
GET /api/v1/enrollment/student/:studentId/status
Authorization: Bearer <token>
```

---

## Bursar (Financial Management)

### Create Student with Parent Account (NEW - Parent Creation Workflow)
```http
POST /api/v1/bursar/create-parent-with-student
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentName: string;
  dateOfBirth: string;     // "YYYY-MM-DD"
  placeOfBirth: string;
  gender: "MALE" | "FEMALE";
  residence: string;
  formerSchool?: string;
  classId: number;
  isNewStudent?: boolean;  // Defaults to true
  academicYearId?: number; // Optional, defaults to current
  parentName: string;
  parentPhone: string;
  parentWhatsapp?: string;
  parentEmail?: string;
  parentAddress: string;
  relationship?: string;   // Defaults to "PARENT"
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Student and parent created successfully";
  data: {
    student: {
      id: number;
      matricule: string;
      name: string;
      dateOfBirth: string;
      placeOfBirth: string;
      gender: "MALE" | "FEMALE";
      residence: string;
      formerSchool?: string;
      isNewStudent: boolean;
      status: "NOT_ENROLLED";
      // ... other student fields
    };
    parent: {
      id: number;
      matricule: string;      // Generated parent matricule
      name: string;
      email?: string;
      phone: string;
      tempPassword: string;   // Temporary password for parent
      // ... other parent fields
    };
    enrollment?: {
      id: number;
      studentId: number;
      classId: number;
      academicYearId: number;
      // ... enrollment details
    };
  };
}
```

### Get Available Parents for Linking
```http
GET /api/v1/bursar/available-parents
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  search?: string;        // Search by name, phone, or email
  page?: number;
  limit?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    matricule: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    childrenCount: number;
    children: Array<{
      id: number;
      name: string;
      className?: string;
    }>;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Link Existing Parent to Student
```http
POST /api/v1/bursar/link-existing-parent
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  parentId: number;
  relationship?: string;   // Defaults to "PARENT"
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Parent linked to student successfully";
  data: {
    id: number;
    studentId: number;
    parentId: number;
    relationship: string;
    createdAt: string;
  };
}
```

### Get Bursar Dashboard
```http
GET /api/v1/bursar/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalFeesExpected: number;
    totalFeesCollected: number;
    pendingPayments: number;
    collectionRate: number;
    recentTransactions: number;
    newStudentsThisMonth: number;
    studentsWithParents: number;
    studentsWithoutParents: number;
    paymentMethods: Array<{
      method: string;
      count: number;
      totalAmount: number;
    }>;
    recentRegistrations: Array<{
      studentName: string;
      parentName: string;
      registrationDate: string;
      className: string;
    }>;
  };
}
```

### Create Fee
```http
POST /api/v1/fees
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  enrollmentId: number;
  amountExpected: number;
  feeType?: string;
  description?: string;
  dueDate?: string;       // "YYYY-MM-DD"
  academicYearId?: number;
}
```

### Record Payment
```http
POST /api/v1/fees/:feeId/payments
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  amount: number;
  paymentDate: string;    // "YYYY-MM-DD" (from receipt)
  paymentMethod: "EXPRESS_UNION" | "CCA" | "3DC";
  receiptNumber?: string;
  recordedById?: number; // Auto-set from auth
  notes?: string;
}
```

**Response (201):**
```typescript
{
  success: true;
  data: {
    id: number;
    feeId: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    receiptNumber?: string;
    recordedById: number;
    notes?: string;
    createdAt: string;
  };
}
```

### Get Student Fees
```http
GET /api/v1/fees/student/:studentId
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

### Get Subclass Fees Summary
```http
GET /api/v1/fees/subclass/:subClassId/summary
Authorization: Bearer <token>
```

### Get All Fees
```http
GET /api/v1/fees
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

### Get Fee by ID
```http
GET /api/v1/fees/:id
Authorization: Bearer <token>
```

### Update Fee
```http
PUT /api/v1/fees/:id
Authorization: Bearer <token>
```

### Delete Fee
```http
DELETE /api/v1/fees/:id
Authorization: Bearer <token>
```

### Get Fee Payments
```http
GET /api/v1/fees/:feeId/payments
Authorization: Bearer <token>
```

### Export Fee Reports
```http
GET /api/v1/fees/reports
Authorization: Bearer <token>
```

---

## Discipline Master/SDM

### Get All Discipline Issues
```http
GET /api/v1/discipline
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  studentId?: number;
  classId?: number;
  subClassId?: number;
  startDate?: string;     // "YYYY-MM-DD"
  endDate?: string;       // "YYYY-MM-DD"
  description?: string;    // Search term
  includeAssignedBy?: boolean;
  includeReviewedBy?: boolean;
  includeStudent?: boolean;
  academicYearId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

### Record Discipline Issue
```http
POST /api/v1/discipline
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  issueType: string;       // e.g., "MISCONDUCT", "MORNING_LATENESS", "CLASS_ABSENCE", "OTHER"
  description: string;
  dateOccurred?: string;  // Defaults to today
  severity?: "LOW" | "MEDIUM" | "HIGH";
  actionTaken?: string;
  academicYearId?: number;
}
```

### Get Discipline History
```http
GET /api/v1/discipline/:studentId
Authorization: Bearer <token>
```

### Record Morning Lateness
```http
POST /api/v1/discipline/lateness
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  date?: string;           // Defaults to today
  arrivalTime: string;    // "HH:mm"
  reason?: string;
  academicYearId?: number;
}
```

### Record Bulk Morning Lateness
```http
POST /api/v1/discipline/lateness/bulk
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  students: Array<{
    studentId: number;
    arrivalTime: string;  // "HH:mm"
    reason?: string;
  }>;
  date?: string;           // Defaults to today
  academicYearId?: number;
}
```

### Get Lateness Statistics
```http
GET /api/v1/discipline/lateness/statistics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  startDate?: string;
  endDate?: string;
  classId?: number;
  subClassId?: number;
  academicYearId?: number;
}
```

### Get Daily Lateness Report
```http
GET /api/v1/discipline/lateness/daily-report
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  date?: string;           // Defaults to today
  academicYearId?: number;
}
```

---

## Enhanced Messaging System

### Get Messaging Dashboard
```http
GET /api/v1/messaging/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalThreads: number;
    unreadMessages: number;
    urgentMessages: number;
    activeThreads: number;
    recentActivity: number;
    messagesByCategory: Array<{
      category: string;
      count: number;
      unreadCount: number;
    }>;
    quickStats: {
      sentToday: number;
      receivedToday: number;
      pendingResponses: number;
      resolvedToday: number;
    };
    recentThreads: Array<MessageThread>;
    urgentAlerts: Array<{
      id: number;
      subject: string;
      sender: string;
      priority: string;
      sentAt: string;
      category: string;
    }>;
  };
}
```

### Get Message Threads
```http
GET /api/v1/messaging/threads
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  category?: string;     // "GENERAL" | "ACADEMIC" | "DISCIPLINARY" | "FINANCIAL" | "ADMINISTRATIVE" | "EMERGENCY"
  priority?: string;     // "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status?: string;       // "ACTIVE" | "RESOLVED" | "ARCHIVED"
  search?: string;       // Search in subject, preview, tags
  page?: number;         // Default: 1
  limit?: number;        // Default: 20
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    subject: string;
    participants: Array<{
      userId: number;
      userName: string;
      userRole: string;
      isActive: boolean;
      lastReadAt?: string;
    }>;
    messageCount: number;
    lastMessageAt: string;
    lastMessagePreview: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    category: "GENERAL" | "ACADEMIC" | "DISCIPLINARY" | "FINANCIAL" | "ADMINISTRATIVE" | "EMERGENCY";
    status: "ACTIVE" | "RESOLVED" | "ARCHIVED";
    tags: Array<string>;
    createdAt: string;
    createdBy: {
      id: number;
      name: string;
      role: string;
    };
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Create Message Thread
```http
POST /api/v1/messaging/threads
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  subject: string;
  participants: Array<number>;
  category?: string;     // Default: "GENERAL"
  priority?: string;     // Default: "MEDIUM"
  initialMessage: string;
  tags?: Array<string>;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Message thread created successfully";
  data: MessageThread;
}
```

### Get Thread Messages
```http
GET /api/v1/messaging/threads/:threadId/messages
Authorization: Bearer <token>
```

**Path Parameters:**
- `threadId` (number): Thread ID

**Query Parameters:**
```typescript
{
  page?: number;         // Default: 1
  limit?: number;        // Default: 50
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    threadId: number;
    senderId: number;
    senderName: string;
    senderRole: string;
    content: string;
    messageType: "TEXT" | "ANNOUNCEMENT" | "ALERT" | "REMINDER" | "URGENT";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    isRead: boolean;
    readAt?: string;
    readBy: Array<{
      userId: number;
      userName: string;
      readAt: string;
    }>;
    attachments: Array<{
      id: number;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      uploadedAt: string;
    }>;
    reactions: Array<{
      userId: number;
      userName: string;
      reaction: "👍" | "👎" | "❤️" | "😂" | "😮" | "😢" | "😡";
      reactedAt: string;
    }>;
    mentions: Array<{
      userId: number;
      userName: string;
      position: number;
    }>;
    deliveryStatus: "SENT" | "DELIVERED" | "READ" | "FAILED";
    sentAt: string;
    editedAt?: string;
    isEdited: boolean;
  }>;
  meta: PaginationMeta;
}
```

### Send Message to Thread
```http
POST /api/v1/messaging/threads/:threadId/messages
Authorization: Bearer <token>
```

**Path Parameters:**
- `threadId` (number): Thread ID

**Request Body:**
```typescript
{
  content: string;
  messageType?: string;          // Default: "TEXT"
  priority?: string;             // Default: "MEDIUM"
  mentions?: Array<number>;      // User IDs to mention
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Message sent successfully";
  data: Message;
}
```

### Archive Message Thread
```http
PUT /api/v1/messaging/threads/:threadId/archive
Authorization: Bearer <token>
```

**Path Parameters:**
- `threadId` (number): Thread ID

**Response (200):**
```typescript
{
  success: true;
  message: "Thread archived successfully";
  data: {
    threadId: number;
    status: "ARCHIVED";
    archivedAt: string;
  };
}
```

### Unarchive Message Thread
```http
PUT /api/v1/messaging/threads/:threadId/unarchive
Authorization: Bearer <token>
```

**Path Parameters:**
- `threadId` (number): Thread ID

**Response (200):**
```typescript
{
  success: true;
  message: "Thread unarchived successfully";
  data: {
    threadId: number;
    status: "ACTIVE";
    unarchivedAt: string;
  };
}
```

### Get Cross-Role Communication Rules
```http
GET /api/v1/messaging/communication-rules
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    availableRoles: Array<{
      role: string;
      userCount: number;
      canReceiveMessages: boolean;
      canSendBroadcast: boolean;
    }>;
    communicationMatrix: Array<{
      fromRole: string;
      toRole: string;
      allowed: boolean;
      requiresApproval: boolean;
      restrictions: Array<string>;
    }>;
    broadcastCapabilities: Array<{
      role: string;
      canBroadcastTo: Array<string>;
      maxRecipients: number;
      requiresApproval: boolean;
    }>;
  };
}
```

### Get Notification Preferences
```http
GET /api/v1/messaging/preferences
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    userId: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    priority: {
      low: boolean;
      medium: boolean;
      high: boolean;
      urgent: boolean;
    };
    categories: {
      general: boolean;
      academic: boolean;
      disciplinary: boolean;
      financial: boolean;
      administrative: boolean;
      emergency: boolean;
    };
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    digestFrequency: "IMMEDIATE" | "HOURLY" | "DAILY" | "WEEKLY" | "DISABLED";
  };
}
```

### Update Notification Preferences
```http
PUT /api/v1/messaging/preferences
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  priority?: {
    low?: boolean;
    medium?: boolean;
    high?: boolean;
    urgent?: boolean;
  };
  categories?: {
    general?: boolean;
    academic?: boolean;
    disciplinary?: boolean;
    financial?: boolean;
    administrative?: boolean;
    emergency?: boolean;
  };
  quietHours?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
  };
  digestFrequency?: "IMMEDIATE" | "HOURLY" | "DAILY" | "WEEKLY" | "DISABLED";
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Notification preferences updated successfully";
  data: NotificationPreferences;
}
```

### Mark Messages as Read
```http
POST /api/v1/messaging/mark-read
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  messageIds: Array<number>;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "X messages marked as read";
  data: {
    success: boolean;
    markedCount: number;
  };
}
```

### Search Messages
```http
GET /api/v1/messaging/search
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  q: string;             // Search query (minimum 3 characters)
  category?: string;
  priority?: string;
  dateFrom?: string;     // "YYYY-MM-DD"
  dateTo?: string;       // "YYYY-MM-DD"
  senderId?: number;
  page?: number;         // Default: 1
  limit?: number;        // Default: 20
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    threadId: number;
    threadSubject: string;
    content: string;
    senderName: string;
    sentAt: string;
    category: string;
    priority: string;
    relevanceScore: number;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query: string;
    filters: object;
  };
}
```

### Get Message Statistics
```http
GET /api/v1/messaging/statistics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalThreads: number;
    totalMessages: number;
    unreadMessages: number;
    sentMessages: number;
    receivedMessages: number;
    averageResponseTime: string;
    mostActiveCategory: string;
    messagesByCategory: object;
    messagesByPriority: object;
    weeklyActivity: Array<{
      day: string;
      sent: number;
      received: number;
    }>;
  };
}
```

### Add Message Reaction
```http
POST /api/v1/messaging/messages/:messageId/reactions
Authorization: Bearer <token>
```

**Path Parameters:**
- `messageId` (number): Message ID

**Request Body:**
```typescript
{
  reaction: "👍" | "👎" | "❤️" | "😂" | "😮" | "😢" | "😡";
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Reaction added successfully";
  data: {
    messageId: number;
    userId: number;
    reaction: string;
    reactedAt: string;
  };
}
```

### Remove Message Reaction
```http
DELETE /api/v1/messaging/messages/:messageId/reactions
Authorization: Bearer <token>
```

**Path Parameters:**
- `messageId` (number): Message ID

**Request Body:**
```typescript
{
  reaction: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Reaction removed successfully";
  data: {
    messageId: number;
    userId: number;
    reaction: string;
    removedAt: string;
  };
}
```

---

## Enhanced Manager Operations

### Get Manager Dashboard
```http
GET /api/v1/manager/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStaff: number;
    totalStudents: number;
    totalParents: number;
    activeClasses: number;
    pendingTasks: number;
    todaysSchedule: Array<{
      id: number;
      time: string;
      activity: string;
      location: string;
      attendees: Array<string>;
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    }>;
    operationalMetrics: {
      attendanceRate: number;
      disciplineIssues: number;
      feeCollection: number;
      maintenanceRequests: number;
    };
    staffOverview: {
      present: number;
      absent: number;
      onLeave: number;
      newRequests: number;
    };
    recentActivities: Array<{
      id: number;
      activity: string;
      user: string;
      timestamp: string;
      category: "ACADEMIC" | "ADMINISTRATIVE" | "OPERATIONAL" | "FINANCIAL";
      priority: "LOW" | "MEDIUM" | "HIGH";
    }>;
    alerts: Array<{
      id: number;
      type: "WARNING" | "INFO" | "URGENT";
      message: string;
      timestamp: string;
      actionRequired: boolean;
    }>;
  };
}
```

### Get Staff Management Overview
```http
GET /api/v1/manager/staff-management
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStaff: number;
    staffByRole: Array<{
      role: string;
      count: number;
      present: number;
      absent: number;
    }>;
    attendanceOverview: {
      presentToday: number;
      absentToday: number;
      onLeaveToday: number;
      attendanceRate: number;
    };
    leaveRequests: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
    staffPerformance: Array<{
      staffId: number;
      staffName: string;
      role: string;
      department: string;
      performanceScore: number;
      attendanceRate: number;
      punctualityScore: number;
      tasksCompleted: number;
      feedback: string;
    }>;
    upcomingLeaves: Array<{
      staffId: number;
      staffName: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      status: string;
    }>;
  };
}
```

### Get Operational Support Overview
```http
GET /api/v1/manager/operational-support
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    maintenanceRequests: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      urgent: number;
    };
    facilityStatus: Array<{
      facility: string;
      status: "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_ORDER";
      lastChecked: string;
      nextMaintenance: string;
      urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    }>;
    inventoryAlerts: Array<{
      item: string;
      currentStock: number;
      minimumRequired: number;
      status: "LOW_STOCK" | "OUT_OF_STOCK" | "REORDER_NEEDED";
      supplier: string;
      lastOrdered: string;
    }>;
    transportManagement: {
      totalVehicles: number;
      operational: number;
      maintenance: number;
      routesActive: number;
      studentsTransported: number;
    };
    securityOverview: {
      incidentsToday: number;
      visitorsRegistered: number;
      securityAlerts: number;
      accessControlStatus: "NORMAL" | "ALERT" | "LOCKDOWN";
    };
  };
}
```

### Get Administrative Support Overview
```http
GET /api/v1/manager/administrative-support
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    documentManagement: {
      pendingApprovals: number;
      expiringSoon: number;
      renewalsNeeded: number;
      totalDocuments: number;
    };
    communicationSummary: {
      noticesSent: number;
      messagesUnread: number;
      urgentCommunications: number;
      broadcastsScheduled: number;
    };
    eventCoordination: {
      upcomingEvents: number;
      eventsThisWeek: number;
      pendingApprovals: number;
      resourcesNeeded: number;
    };
    complianceTracking: {
      regulatoryCompliance: number;
      pendingAudits: number;
      policiesUpdated: number;
      trainingRequired: number;
    };
  };
}
```

### Generate Operational Report
```http
GET /api/v1/manager/reports/operational
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  period?: string;           // "weekly" | "monthly" | "quarterly" | "yearly"
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    generatedAt: string;
    period: string;
    summary: {
      totalStaff: number;
      totalStudents: number;
      attendanceRate: number;
      disciplineIncidents: number;
      academicPerformance: number;
    };
    keyMetrics: Array<{
      metric: string;
      value: number | string;
      trend: "IMPROVING" | "DECLINING" | "STABLE";
      comparison: string;
    }>;
    recommendations: Array<string>;
  };
}
```

### Process Maintenance Request
```http
PUT /api/v1/manager/maintenance-requests/:requestId
Authorization: Bearer <token>
```

**Path Parameters:**
- `requestId` (number): Maintenance request ID

**Request Body:**
```typescript
{
  action: "APPROVE" | "REJECT" | "ASSIGN";
  assignedTo?: string;
  priority?: string;
  notes?: string;
  estimatedCompletion?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Maintenance request [action] successfully";
  data: {
    requestId: number;
    action: string;
    processedAt: string;
    assignedTo?: string;
    priority?: string;
    notes?: string;
    estimatedCompletion?: string;
  };
}
```

### Update Facility Status
```http
PUT /api/v1/manager/facilities/:facilityId/status
Authorization: Bearer <token>
```

**Path Parameters:**
- `facilityId` (number): Facility ID

**Request Body:**
```typescript
{
  status: "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_ORDER";
  notes?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Facility status updated successfully";
  data: {
    facilityId: number;
    status: string;
    updatedAt: string;
    notes?: string;
  };
}
```

### Process Leave Request
```http
PUT /api/v1/manager/leave-requests/:requestId
Authorization: Bearer <token>
```

**Path Parameters:**
- `requestId` (number): Leave request ID

**Request Body:**
```typescript
{
  action: "APPROVE" | "REJECT";
  notes?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Leave request [action] successfully";
  data: {
    requestId: number;
    action: string;
    processedAt: string;
    processorNotes?: string;
  };
}
```

### Create Task Assignment
```http
POST /api/v1/manager/tasks
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  title: string;
  description: string;
  assignedTo: Array<number>;    // User IDs
  priority?: string;            // "LOW" | "MEDIUM" | "HIGH" | "URGENT", default: "MEDIUM"
  dueDate: string;              // "YYYY-MM-DD"
  category?: string;            // "GENERAL" | "ADMINISTRATIVE" | "MAINTENANCE" | "ACADEMIC"
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Task assigned successfully";
  data: {
    id: number;
    title: string;
    description: string;
    assignedTo: Array<number>;
    priority: string;
    dueDate: string;
    category: string;
    status: "PENDING";
    createdAt: string;
    createdBy: string;
  };
}
```

### Get Staff Attendance Summary
```http
GET /api/v1/manager/staff-attendance
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  startDate?: string;        // "YYYY-MM-DD"
  endDate?: string;          // "YYYY-MM-DD"
  departmentId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    period: {
      startDate: string;
      endDate: string;
    };
    summary: {
      totalStaff: number;
      averageAttendance: number;
      totalAbsences: number;
      punctualityRate: number;
    };
    byDepartment: Array<{
      department: string;
      attendance: number;
      staff: number;
    }>;
    trends: {
      thisWeek: number;
      lastWeek: number;
      trend: "IMPROVING" | "DECLINING" | "STABLE";
    };
    topPerformers: Array<{
      name: string;
      attendance: number;
      department: string;
    }>;
  };
}
```

### Get Facility Maintenance Schedule
```http
GET /api/v1/manager/maintenance-schedule
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  facilityType?: string;
  status?: string;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    upcomingMaintenance: Array<{
      id: number;
      facility: string;
      type: string;
      scheduledDate: string;
      assignedTeam: string;
      priority: string;
      estimatedDuration: string;
    }>;
    overdueMaintenance: Array<{
      id: number;
      facility: string;
      type: string;
      originalDate: string;
      daysPastDue: number;
      priority: string;
    }>;
    maintenanceHistory: Array<{
      facility: string;
      completedDate: string;
      type: string;
      cost: number;
      technician: string;
    }>;
    totalFacilities: number;
    needingMaintenance: number;
    maintenanceCompliance: number;
  };
}
```

### Get Inventory Status
```http
GET /api/v1/manager/inventory
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  category?: string;
  alertsOnly?: boolean;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    overview: {
      totalItems: number;
      lowStock: number;
      outOfStock: number;
      wellStocked: number;
    };
    categories: Array<{
      category: string;
      totalItems: number;
      alerts: number;
      value: number;
    }>;
    criticalItems: Array<{
      item: string;
      currentStock: number;
      minimumRequired: number;
      status: "OUT_OF_STOCK" | "LOW_STOCK";
      lastOrdered: string;
      supplier: string;
    }>;
    reorderSuggestions: Array<{
      item: string;
      suggestedQuantity: number;
      estimatedCost: number;
      urgency: "LOW" | "MEDIUM" | "HIGH";
    }>;
  };
}
```

---

## Discipline Master Enhanced (Behavioral Management)

### Get Discipline Master Enhanced Dashboard
```http
GET /api/v1/discipline-master/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalActiveIssues: number;
    resolvedThisWeek: number;
    pendingResolution: number;
    studentsWithMultipleIssues: number;
    averageResolutionTime: number;
    attendanceRate: number;
    latenessIncidents: number;
    absenteeismCases: number;
    interventionSuccess: number;
    criticalCases: number;
    behavioralTrends: {
      thisMonth: number;
      lastMonth: number;
      trend: "IMPROVING" | "DECLINING" | "STABLE";
    };
    urgentInterventions: Array<{
      studentId: number;
      studentName: string;
      issueCount: number;
      riskLevel: "HIGH" | "MEDIUM" | "LOW";
      lastIncident: string;
      recommendedAction: string;
    }>;
    issuesByType: Array<{
      type: string;
      count: number;
      trend: "INCREASING" | "DECREASING" | "STABLE";
      resolution_rate: number;
    }>;
  };
}
```

### Get Behavioral Analytics
```http
GET /api/v1/discipline-master/behavioral-analytics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    studentsWithIssues: number;
    behaviorScore: number;
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
      none: number;
    };
    monthlyTrends: Array<{
      month: string;
      incidents: number;
      resolved: number;
      newCases: number;
    }>;
    issueTypeAnalysis: Array<{
      issueType: string;
      frequency: number;
      averageResolutionTime: number;
      recurrenceRate: number;
      effectiveInterventions: Array<string>;
    }>;
    classroomHotspots: Array<{
      subClassName: string;
      className: string;
      incidentCount: number;
      riskScore: number;
      primaryIssues: Array<string>;
    }>;
  };
}
```

### Get Student Behavior Profile
```http
GET /api/v1/discipline-master/student-profile/:studentId
Authorization: Bearer <token>
```

**Path Parameters:**
- `studentId` (number): Student ID

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    studentId: number;
    studentName: string;
    matricule: string;
    className: string;
    subClassName: string;
    riskLevel: "HIGH" | "MEDIUM" | "LOW" | "NONE";
    behaviorScore: number;
    totalIncidents: number;
    recentIncidents: number;
    interventionsReceived: number;
    lastIncidentDate?: string;
    behaviorPattern: {
      mostCommonIssues: Array<string>;
      triggerFactors: Array<string>;
      improvementAreas: Array<string>;
      strengths: Array<string>;
    };
    interventionHistory: Array<{
      id: number;
      type: string;
      date: string;
      description: string;
      outcome: "SUCCESSFUL" | "PARTIALLY_SUCCESSFUL" | "UNSUCCESSFUL" | "ONGOING";
      followUpDate?: string;
    }>;
    recommendedActions: Array<{
      priority: "HIGH" | "MEDIUM" | "LOW";
      action: string;
      timeline: string;
      responsible: string;
    }>;
  };
}
```

### Get Early Warning System
```http
GET /api/v1/discipline-master/early-warning
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    criticalStudents: Array<{
      studentId: number;
      studentName: string;
      warningLevel: "CRITICAL" | "HIGH" | "MODERATE";
      riskFactors: Array<string>;
      triggerEvents: Array<string>;
      recommendedActions: Array<string>;
      urgency: "IMMEDIATE" | "WITHIN_WEEK" | "MONITOR";
    }>;
    riskIndicators: Array<{
      indicator: string;
      studentsAffected: number;
      severity: "HIGH" | "MEDIUM" | "LOW";
      trendDirection: "INCREASING" | "STABLE" | "DECREASING";
    }>;
    preventiveRecommendations: Array<{
      category: string;
      recommendation: string;
      targetStudents: number;
      priority: "HIGH" | "MEDIUM" | "LOW";
      implementationTimeline: string;
    }>;
  };
}
```

### Get Discipline Statistics
```http
GET /api/v1/discipline-master/statistics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  startDate?: string;    // "YYYY-MM-DD"
  endDate?: string;      // "YYYY-MM-DD"
  classId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    overview: {
      totalStudents: number;
      studentsWithIssues: number;
      behaviorScore: number;
      riskDistribution: object;
    };
    trends: Array<object>;
    issueAnalysis: Array<object>;
    classroomHotspots: Array<object>;
    filters: {
      academicYearId?: number;
      startDate?: string;
      endDate?: string;
      classId?: number;
    };
  };
}
```

### Get Intervention Tracking
```http
GET /api/v1/discipline-master/interventions
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  status?: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  studentId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    studentId: number;
    studentName: string;
    interventionType: string;
    description: string;
    startDate: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
    outcome?: "SUCCESSFUL" | "PARTIALLY_SUCCESSFUL" | "UNSUCCESSFUL";
    effectiveness: number;
    followUpRequired: boolean;
    nextReviewDate?: string;
    assignedTo: string;
    notes: Array<{
      date: string;
      note: string;
      recordedBy: string;
    }>;
  }>;
  meta: {
    total: number;
    filters: object;
  };
}
```

### Create Intervention Plan
```http
POST /api/v1/discipline-master/interventions
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  interventionType: string;
  description: string;
  expectedEndDate?: string;  // "YYYY-MM-DD"
  assignedTo: string;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Intervention plan created successfully";
  data: {
    id: number;
    studentId: number;
    interventionType: string;
    description: string;
    startDate: string;
    expectedEndDate?: string;
    status: "PLANNED";
    assignedTo: string;
    createdAt: string;
    createdBy: string;
  };
}
```

### Update Intervention Status
```http
PUT /api/v1/discipline-master/interventions/:interventionId
Authorization: Bearer <token>
```

**Path Parameters:**
- `interventionId` (number): Intervention ID

**Request Body:**
```typescript
{
  status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  outcome?: "SUCCESSFUL" | "PARTIALLY_SUCCESSFUL" | "UNSUCCESSFUL";
  notes?: string;
  effectiveness?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Intervention updated successfully";
  data: {
    id: number;
    status: string;
    outcome?: string;
    effectiveness?: number;
    updatedAt: string;
    updatedBy: string;
  };
}
```

### Get Risk Assessment
```http
GET /api/v1/discipline-master/risk-assessment
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  riskLevel?: "CRITICAL" | "HIGH" | "MODERATE";
  classId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudentsAssessed: number;
    riskLevelBreakdown: {
      critical: number;
      high: number;
      moderate: number;
    };
    studentsAtRisk: Array<object>;
    riskIndicators: Array<object>;
    recommendations: Array<object>;
    filters: object;
  };
}
```

### Generate Discipline Report
```http
GET /api/v1/discipline-master/reports
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  reportType?: string;      // Default: "comprehensive"
  startDate?: string;       // "YYYY-MM-DD"
  endDate?: string;         // "YYYY-MM-DD"
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    reportInfo: {
      type: string;
      generatedAt: string;
      generatedBy: string;
      academicYearId?: number;
      dateRange: {
        startDate?: string;
        endDate?: string;
      };
    };
    executiveSummary: {
      totalActiveIssues: number;
      studentsWithIssues: number;
      behaviorScore: number;
      criticalCases: number;
      resolutionRate: number;
    };
    detailedAnalysis: {
      dashboard: object;
      behavioralAnalytics: object;
      earlyWarning: object;
    };
    recommendations: Array<string>;
    actionItems: Array<{
      priority: "HIGH" | "MEDIUM" | "LOW";
      action: string;
      responsible: string;
      deadline: string;
    }>;
  };
}
```

---

## Teacher Portal

### Get My Subjects
```http
GET /api/v1/teachers/me/subjects
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    code: string;
    category: string;
    coefficient: number;
    // ... other subject details
    subclasses: Array<{
      id: number;
      name: string;
      className: string;
      studentCount: number;
    }>;
  }>;
}
```

### Get My Students
```http
GET /api/v1/teachers/me/students
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  subClassId?: number;
  subjectId?: number;
  academicYearId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

### Get My Subclasses
```http
GET /api/v1/teachers/me/subclasses
Authorization: Bearer <token>
```

### Get My Dashboard
```http
GET /api/v1/teachers/me/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    subjectsTeaching: number;
    totalStudentsTeaching: number;
    marksToEnter: number;
    classesTaught: number;
    upcomingPeriods: number;
    weeklyHours: number;
    attendanceRate: number;
    totalHoursPerWeek: number;
  };
}
```

### Check My Access
```http
GET /api/v1/teachers/me/access-check
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  subjectId?: number;
  subClassId?: number;
  academicYearId?: number;
}
```

### Get My Subject IDs
```http
GET /api/v1/teachers/me/subject-ids
Authorization: Bearer <token>
```

### Get My Subclass IDs
```http
GET /api/v1/teachers/me/subclass-ids
Authorization: Bearer <token>
```

### Get My Attendance Records (NEW - Teacher Attendance Management)
```http
GET /api/v1/teachers/me/attendance
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  startDate?: string;    // "YYYY-MM-DD"
  endDate?: string;      // "YYYY-MM-DD"
  academicYearId?: number;
  page?: number;
  limit?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "SICK_LEAVE" | "AUTHORIZED_LEAVE";
    reason?: string;
    periodId?: number;
    periodName?: string;
    recordedBy: string;
    createdAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Record Student Attendance (NEW - Teacher Attendance Management)
```http
POST /api/v1/teachers/attendance/record
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  studentId: number;
  subClassId: number;
  subjectId: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  reason?: string;
  periodId?: number;
  date?: string;         // "YYYY-MM-DD", defaults to today
  academicYearId?: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Student attendance recorded successfully";
  data: {
    id: number;
    studentId: number;
    studentName: string;
    studentMatricule: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    reason?: string;
    periodId?: number;
    periodName?: string;
    subClassName: string;
    subjectName: string;
  };
}
```

### Get Attendance Statistics (NEW - Teacher Attendance Management)
```http
GET /api/v1/teachers/attendance/statistics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  subClassId?: number;
  subjectId?: number;
  startDate?: string;    // "YYYY-MM-DD"
  endDate?: string;      // "YYYY-MM-DD"
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    attendanceRate: number;
    weeklyTrends: Array<{
      date: string;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      attendanceRate: number;
    }>;
    subClassBreakdown: Array<{
      subClassId: number;
      subClassName: string;
      totalStudents: number;
      attendanceRate: number;
      absentStudents: number;
    }>;
  };
}
```

### Get SubClass Attendance (NEW - Teacher Attendance Management)
```http
GET /api/v1/teachers/attendance/subclass/:id
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (number): SubClass ID

**Query Parameters:**
```typescript
{
  date?: string;         // "YYYY-MM-DD" - specific date filter
  subjectId?: number;
  academicYearId?: number;
  page?: number;
  limit?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    studentId: number;
    studentName: string;
    studentMatricule: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    reason?: string;
    periodId?: number;
    periodName?: string;
    subClassName: string;
    subjectName: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## HOD (Head of Department)

### Get HOD Dashboard
```http
GET /api/v1/hod/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalSubjects: number;
    totalTeachers: number;
    totalStudents: number;
    totalClasses: number;
    departmentAverage: number;
    overallPassRate: number;
    subjectsManaged: Array<{
      id: number;
      name: string;
      category: string;
    }>;
  };
}
```

### Get Department Overview
```http
GET /api/v1/hod/department-overview
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    subjectId: number;
    subjectName: string;
    subjectCategory: string;
    totalTeachers: number;
    totalStudents: number;
    totalClasses: number;
    averagePerformance: number;
    teachersAssigned: Array<{
      id: number;
      name: string;
      email: string;
      matricule: string;
      classesTeaching: number;
      studentsTeaching: number;
      averageMarks: number;
    }>;
  }>;
}
```

### Get Teachers in Department
```http
GET /api/v1/hod/teachers-in-department
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  search?: string;      // Search by name, email, or matricule
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    email: string;
    matricule: string;
    phone: string;
    totalHoursPerWeek: number;
    subjectsTeaching: Array<{
      id: number;
      name: string;
      classCount: number;
      studentCount: number;
      averageMarks: number;
    }>;
    classesTeaching: Array<{
      id: number;
      name: string;
      className: string;
      studentCount: number;
      averageMarks: number;
    }>;
    performanceMetrics: {
      totalStudents: number;
      averageMarks: number;
      passRate: number;
      excellentRate: number;
    };
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Get Subject Performance
```http
GET /api/v1/hod/subject-performance
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  subjectId?: number;   // Optional filter for specific subject
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    subjectId: number;
    subjectName: string;
    totalStudents: number;
    totalClasses: number;
    averageMarks: number;
    passRate: number;
    excellentRate: number;
    classBreakdown: Array<{
      subClassId: number;
      subClassName: string;
      className: string;
      studentCount: number;
      averageMarks: number;
      teacherName: string;
      teacherId: number;
    }>;
    performanceTrends: Array<{
      sequenceNumber: number;
      termName: string;
      averageMarks: number;
      passRate: number;
    }>;
  }>;
}
```

### Assign Teacher to Subject
```http
POST /api/v1/hod/assign-teacher-subject
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  subjectId: number;
  teacherId: number;
}
```

**Response (201):**
```typescript
{
  success: true;
  message: "Teacher successfully assigned to subject";
  data: {
    id: number;
    subjectId: number;
    teacherId: number;
    teacher: {
      id: number;
      name: string;
      email: string;
      matricule: string;
    };
    subject: {
      id: number;
      name: string;
      category: string;
    };
    createdAt: string;
  };
}
```

### Get Department Analytics
```http
GET /api/v1/hod/department-analytics
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    subjectId: number;
    subjectName: string;
    totalTeachers: number;
    totalStudents: number;
    totalClasses: number;
    overallAverage: number;
    overallPassRate: number;
    topPerformingClass: {
      subClassName: string;
      averageMarks: number;
    } | null;
    lowestPerformingClass: {
      subClassName: string;
      averageMarks: number;
    } | null;
    teacherPerformanceRanking: Array<{
      teacherId: number;
      teacherName: string;
      averageMarks: number;
      studentsCount: number;
      classesCount: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      averageMarks: number;
      studentsEvaluated: number;
    }>;
  }>;
}
```

### Get Teacher Performance
```http
GET /api/v1/hod/teacher-performance/:teacherId
Authorization: Bearer <token>
```

**Path Parameters:**
- `teacherId` (number): Teacher ID

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    teacher: {
      id: number;
      name: string;
      email: string;
      matricule: string;
    };
    overallPerformance: {
      totalMarks: number;
      averageScore: number;
      passRate: number;
      excellentRate: number;
    };
    subjectPerformance: Array<{
      subjectId: number;
      subjectName: string;
      totalMarks: number;
      averageScore: number;
      passRate: number;
    }>;
    classPerformance: Array<{
      subClassId: number;
      subClassName: string;
      className: string;
      totalMarks: number;
      averageScore: number;
      passRate: number;
    }>;
  };
}
```

### Get My Subjects
```http
GET /api/v1/hod/my-subjects
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    category: string;
    totalTeachers: number;
    totalClasses: number;
    totalStudents: number;
  }>;
}
```

---

## Timetable Management

### Get Subclass Timetable
```http
GET /api/v1/timetables/subclass/:subclassId
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

### Bulk Update Timetable
```http
POST /api/v1/timetables/subclass/:subclassId/bulk-update
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  academicYearId?: number;
  slots: Array<{
    periodId: number;
    subjectId: number | null;  // null to clear assignment
    teacherId: number | null;  // null to clear assignment
  }>;
}
```

**Response (200/207):**
```typescript
{
  success: boolean;
  data: {
    created: number;
    updated: number;
    deleted: number;
    errors: Array<{
      periodId: number;
      error: string;
    }>;
  };
}
```

---

## Academic Year Management

### Get All Academic Years
```http
GET /api/v1/academic-years
Authorization: Bearer <token>
```

### Create Academic Year
```http
POST /api/v1/academic-years
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;            // e.g., "2024-2025"
  startDate: string;      // "YYYY-MM-DD"
  endDate: string;        // "YYYY-MM-DD"
  isCurrent?: boolean;    // Defaults to false
}
```

### Get Academic Year by ID
```http
GET /api/v1/academic-years/:id
Authorization: Bearer <token>
```

### Update Academic Year
```http
PUT /api/v1/academic-years/:id
Authorization: Bearer <token>
```

### Delete Academic Year
```http
DELETE /api/v1/academic-years/:id
Authorization: Bearer <token>
```

### Set Current Academic Year
```http
POST /api/v1/academic-years/:id/set-current
Authorization: Bearer <token>
```

### Get Current Academic Year
```http
GET /api/v1/academic-years/current
Authorization: Bearer <token>
```

---

## Student Management

### Get All Students
```http
GET /api/v1/students
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  enrollmentStatus?: "enrolled" | "not_enrolled" | "all";
  name?: string;           // Search by name
  matricule?: string;      // Search by matricule
  gender?: "MALE" | "FEMALE";
  subClassId?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "matricule" | "dateOfBirth" | "createdAt";
  sortOrder?: "asc" | "desc";
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    matricule: string;
    name: string;
    dateOfBirth: string;
    placeOfBirth: string;
    gender: "MALE" | "FEMALE";
    residence: string;
    formerSchool?: string;
    isNewStudent: boolean;
    status: "NOT_ENROLLED" | "ENROLLED" | "ASSIGNED_TO_CLASS" | "GRADUATED" | "TRANSFERRED" | "SUSPENDED";
    enrollments: Array<{
      id: number;
      classId: number;
      subClassId?: number;
      academicYearId: number;
      repeater: boolean;
      photo?: string;
      subClass?: {
        id: number;
        name: string;
        class: {
          id: number;
          name: string;
        };
      };
    }>;
    parents: Array<{
      id: number;
      parent: {
        id: number;
        name: string;
        email: string;
        phone: string;
      };
    }>;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Create Student
```http
POST /api/v1/students
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  matricule?: string;      // Auto-generated if not provided
  name: string;
  dateOfBirth: string;   // "YYYY-MM-DD"
  placeOfBirth: string;
  gender: "MALE" | "FEMALE";
  residence: string;
  formerSchool?: string;
  isNewStudent?: boolean; // Defaults to true
  status?: "NOT_ENROLLED" | "ENROLLED" | "ASSIGNED_TO_CLASS" | "GRADUATED" | "TRANSFERRED" | "SUSPENDED";
}
```

### Get Student by ID
```http
GET /api/v1/students/:id
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

### Update Student
```http
PUT /api/v1/students/:id
Authorization: Bearer <token>
```

### Enroll Student
```http
POST /api/v1/students/:id/enroll
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  subClassId: number;
  academicYearId?: number;
  photo?: string;
  repeater?: boolean;      // Defaults to false
}
```

### Link Parent
```http
POST /api/v1/students/:id/link-parent
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  parentId: number;
}
```

### Unlink Parent
```http
DELETE /api/v1/students/:studentId/parents/:parentId
Authorization: Bearer <token>
```

### Get Students by Subclass
```http
GET /api/v1/students/subclass/:subClassId
Authorization: Bearer <token>
```

### Get Students by Parent
```http
GET /api/v1/students/parent/:parentId
Authorization: Bearer <token>
```

### Get Parents by Student
```http
GET /api/v1/students/:studentId/parents
Authorization: Bearer <token>
```

---

## User Management

### Get All Users
```http
GET /api/v1/users
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  name?: string;
  email?: string;
  role?: "SUPER_MANAGER" | "MANAGER" | "PRINCIPAL" | "VICE_PRINCIPAL" | "BURSAR" | "DISCIPLINE_MASTER" | "TEACHER" | "HOD" | "PARENT" | "STUDENT";
  status?: string;
  academicYearId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

### Create User
```http
POST /api/v1/users
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  email: string;
  password: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;   // "YYYY-MM-DD"
  phone: string;
  address: string;
  idCardNum?: string;
  photo?: string;
  roles: Array<{
    role: "SUPER_MANAGER" | "MANAGER" | "PRINCIPAL" | "VICE_PRINCIPAL" | "BURSAR" | "DISCIPLINE_MASTER" | "TEACHER" | "HOD" | "PARENT" | "STUDENT";
    academicYearId?: number; // null for global roles
  }>;
}
```

### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
```

### Delete User
```http
DELETE /api/v1/users/:id
Authorization: Bearer <token>
```

### Get User Profile
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/v1/users/me
Authorization: Bearer <token>
```

### Assign Role
```http
POST /api/v1/users/:id/roles
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  role: string;
  academicYearId?: number; // null for global roles
}
```

### Remove Role
```http
DELETE /api/v1/users/:id/roles
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  role: string;
  academicYearId?: number;
}
```

---

## Exam and Marks Management

### Get All Exams
```http
GET /api/v1/exams
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  subjectId?: number;
  page?: number;
  limit?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    subjectId: number;
    academicYearId: number;
    examDate: string;
    duration: number;
    // ... other exam fields
  }>;
}
```

### Get Student Marks
```http
GET /api/v1/marks
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  studentId?: number;
  subjectId?: number;
  examSequenceId?: number;
  academicYearId?: number;
  page?: number;
  limit?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    enrollmentId: number;
    teacherId: number;
    examSequenceId: number;
    score: number;
    subClassSubjectId: number;
    createdAt: string;
    updatedAt: string;
    // ... other mark fields
  }>;
}
```

---

## Class and Subject Management

### Get All Classes
```http
GET /api/v1/classes
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    maxStudents: number;
    // ... other class fields
  }>;
}
```

### Get Class by ID
```http
GET /api/v1/classes/:id
Authorization: Bearer <token>
```

### Get All Subjects
```http
GET /api/v1/subjects
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: number;
    name: string;
    category: string;
    // ... other subject fields
  }>;
}
```

### Get Subject by ID
```http
GET /api/v1/subjects/:id
Authorization: Bearer <token>
```

---

## Dashboard Endpoints

### Get User Dashboard
```http
GET /api/v1/users/me/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  role?: "SUPER_MANAGER" | "MANAGER" | "PRINCIPAL" | "VICE_PRINCIPAL" | "BURSAR" | "DISCIPLINE_MASTER" | "TEACHER" | "HOD" | "PARENT" | "STUDENT";
  academicYearId?: number;
}
```

**Response varies by role:**

#### Super Manager Dashboard:
```typescript
{
  success: true;
  data: {
    academicYearCount: number;
    personnelCount: number;
    studentCount: number;
    classCount: number;
    subClassCount: number;
    totalFeesCollected: number;
    pendingReports: number;
    systemModifications: Array<object>;
    upcomingDeadlines: Array<object>;
  };
}
```

#### Principal Dashboard:
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    activeExamSequences: number;
    pendingDisciplineIssues: number;
    averageAttendanceRate: number;
  };
}
```

#### Vice Principal Dashboard:
```typescript
{
  success: true;
  data: {
    assignedSubClasses: number;
    totalStudentsUnderSupervision: number;
    studentsAwaitingAssignment: number;
    completedInterviews: number;
    pendingInterviews: number;
    recentDisciplineIssues: number;
    classesWithPendingReports: number;
    teacherAbsences: number;
  };
}
```

#### Bursar Dashboard:
```typescript
{
  success: true;
  data: {
    totalFeesExpected: number;
    totalFeesCollected: number;
    pendingPayments: number;
    collectionRate: number;
    recentTransactions: number;
    newStudentsThisMonth: number;
    paymentMethods: Array<{
      method: string;
      count: number;
      totalAmount: number;
    }>;
  };
}
```

#### Discipline Master Dashboard:
```typescript
{
  success: true;
  data: {
    pendingDisciplineIssues: number;
    resolvedThisWeek: number;
    studentsWithMultipleIssues: number;
    averageResolutionTime: number;
    attendanceRate: number;
    latenessIncidents: number;
    absenteeismCases: number;
  };
}
```

#### Teacher Dashboard:
```typescript
{
  success: true;
  data: {
    subjectsTeaching: number;
    totalStudentsTeaching: number;
    marksToEnter: number;
    classesTaught: number;
    upcomingPeriods: number;
    weeklyHours: number;
    attendanceRate: number;
    totalHoursPerWeek: number;
  };
}
```

---

## Authorization Testing

### Unauthorized Access (No Token)
```http
GET /api/v1/users
```

**Response (401):**
```typescript
{
  success: false;
  error: "User not authenticated";
}
```

### Teacher Access to Admin Endpoint
```http
GET /api/v1/users
Authorization: Bearer <teacher_token>
```

**Response (403):**
```typescript
{
  success: false;
  error: "Access denied: insufficient permissions";
}
```

### Parent Access to Teacher Endpoint
```http
GET /api/v1/teachers/me/subjects
Authorization: Bearer <parent_token>
```

**Response (403):**
```typescript
{
  success: false;
  error: "Access denied: insufficient permissions";
}
```

---

## Super Manager (System Administration)

### Get System Settings
```http
GET /api/v1/system/settings
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    schoolName: string;
    schoolAddress: string;
    schoolPhone: string;
    schoolEmail: string;
    schoolLogo?: string;
    academicYearStartMonth: number; // 1-12
    defaultClassSize: number;
    enableNotifications: boolean;
    enableParentPortal: boolean;
    enableQuizSystem: boolean;
    defaultPassMark: number;
    currencySymbol: string; // "FCFA"
    timezone: string;
    backupEnabled: boolean;
    backupFrequency: "DAILY" | "WEEKLY" | "MONTHLY";
    maintenanceMode: boolean;
  };
}
```

### Update System Settings
```http
PUT /api/v1/system/settings
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolLogo?: string;
  academicYearStartMonth?: number;
  defaultClassSize?: number;
  enableNotifications?: boolean;
  enableParentPortal?: boolean;
  enableQuizSystem?: boolean;
  defaultPassMark?: number;
  currencySymbol?: string;
  timezone?: string;
  backupEnabled?: boolean;
  backupFrequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  maintenanceMode?: boolean;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "System settings updated successfully";
  data: {
    // Updated settings object (same structure as GET)
  };
}
```

### Get System Health
```http
GET /api/v1/system/health
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    status: "HEALTHY" | "WARNING" | "CRITICAL";
    uptime: number; // seconds
    databaseStatus: "CONNECTED" | "DISCONNECTED" | "ERROR";
    memoryUsage: {
      used: number; // MB
      total: number; // MB
      percentage: number;
    };
    diskUsage: {
      used: number; // MB
      total: number; // MB
      percentage: number;
    };
    activeUsers: number;
    recentErrors: number;
    lastBackup: string | null;
    systemVersion: string;
  };
}
```

### Perform System Backup
```http
POST /api/v1/system/backup
Authorization: Bearer <token>
```

**Response (201):**
```typescript
{
  success: true;
  message: "System backup completed successfully";
  data: {
    id: string;
    timestamp: string;
    type: "MANUAL" | "SCHEDULED";
    status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
    filePath?: string;
    fileSize?: number; // bytes
    duration?: number; // milliseconds
    errorMessage?: string;
  };
}
```

### Perform System Cleanup
```http
POST /api/v1/system/cleanup
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  message: "System cleanup completed. X records cleaned, Y.Z MB freed.";
  data: {
    operations: Array<{
      operation: string;
      recordsCleaned: number;
      spaceFreed: number; // bytes
      duration: number; // milliseconds
    }>;
    summary: {
      totalRecordsCleaned: number;
      totalSpaceFreed: number; // bytes
      totalSpaceFreedMB: number;
    };
  };
}
```

### Get System Logs
```http
GET /api/v1/system/logs
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  level?: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  category?: "AUTH" | "DATABASE" | "SYSTEM" | "USER_ACTION" | "ERROR";
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  userId?: number;
  search?: string;
  limit?: number; // max 1000, default 100
}
```

**Response (200):**
```typescript
{
  success: true;
  data: Array<{
    id: string;
    timestamp: string;
    level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    category: "AUTH" | "DATABASE" | "SYSTEM" | "USER_ACTION" | "ERROR";
    message: string;
    userId?: number;
    ipAddress?: string;
    details?: any;
  }>;
  meta: {
    total: number;
    limit: number;
    filters: object;
  };
}
```

### Get System Statistics
```http
GET /api/v1/system/statistics
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    userStatistics: {
      totalUsers: number;
      totalStudents: number;
      totalTeachers: number;
      totalParents: number;
      recentLogins: number;
    };
    academicStatistics: {
      totalClasses: number;
      totalSubjects: number;
      totalEnrollments: number;
      currentAcademicYear: string;
    };
    financialStatistics: {
      totalFees: number;
      totalPayments: number;
    };
    systemHealth: {
      // Same structure as /system/health
    };
  };
}
```

### Get System Dashboard
```http
GET /api/v1/system/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    // Combines statistics + health + additional dashboard data
    userStatistics: object;
    academicStatistics: object;
    financialStatistics: object;
    systemHealth: object;
    quickActions: Array<string>;
    recentActivities: Array<object>;
  };
}
```

### Get System Info
```http
GET /api/v1/system/info
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    schoolName: string;
    systemVersion: string;
    uptime: number;
    status: "HEALTHY" | "WARNING" | "CRITICAL";
    maintenanceMode: boolean;
  };
}
```

### Toggle Maintenance Mode
```http
POST /api/v1/system/maintenance-mode
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  enabled: boolean;
}
```

**Response (200):**
```typescript
{
  success: true;
  message: "Maintenance mode enabled/disabled";
  data: {
    maintenanceMode: boolean;
  };
}
```

---

## Principal (School-wide Management)

### Get Principal Dashboard
```http
GET /api/v1/principal/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    schoolAnalytics: {
      totalStudents: number;
      totalTeachers: number;
      totalClasses: number;
      totalSubjects: number;
      activeExamSequences: number;
      averageAttendanceRate: number;
      overallAcademicPerformance: number;
      financialCollectionRate: number;
      disciplineIssuesThisMonth: number;
      newEnrollmentsThisMonth: number;
      teacherUtilizationRate: number;
      classCapacityUtilization: number;
    };
    performanceMetrics: {
      academicPerformance: {
        overallPassRate: number;
        averageGrade: number;
        subjectPerformance: Array<{
          subjectName: string;
          averageScore: number;
          passRate: number;
          totalStudents: number;
        }>;
        classPerformance: Array<{
          className: string;
          subClassName: string;
          averageScore: number;
          passRate: number;
          totalStudents: number;
          teacherName: string;
        }>;
      };
      attendanceMetrics: {
        overallAttendanceRate: number;
        classAttendanceRates: Array<object>;
        monthlyAttendanceTrends: Array<object>;
      };
      teacherPerformance: {
        totalTeachers: number;
        averageClassesPerTeacher: number;
        teacherEfficiency: Array<{
          teacherName: string;
          subjectsTeaching: number;
          averageStudentPerformance: number;
          classesManaged: number;
          attendanceRate: number;
        }>;
      };
    };
    financialOverview: {
      totalExpectedRevenue: number;
      totalCollectedRevenue: number;
      collectionRate: number;
      pendingPayments: number;
      paymentMethodBreakdown: Array<{
        method: string;
        amount: number;
        percentage: number;
        transactionCount: number;
      }>;
      outstandingDebts: Array<{
        studentName: string;
        className: string;
        amountOwed: number;
        daysOverdue: number;
      }>;
    };
    disciplineOverview: {
      totalIssues: number;
      resolvedIssues: number;
      pendingIssues: number;
      averageResolutionTime: number;
      issuesByType: Array<{
        issueType: string;
        count: number;
        trend: "INCREASING" | "DECREASING" | "STABLE";
      }>;
    };
    staffOverview: {
      totalStaff: number;
      teacherCount: number;
      administrativeStaff: number;
      staffUtilization: Array<{
        role: string;
        count: number;
        utilizationRate: number;
      }>;
    };
    quickActions: Array<string>;
  };
}
```

### Get School Analytics
```http
GET /api/v1/principal/analytics/school
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    activeExamSequences: number;
    averageAttendanceRate: number;
    overallAcademicPerformance: number;
    financialCollectionRate: number;
    disciplineIssuesThisMonth: number;
    newEnrollmentsThisMonth: number;
    teacherUtilizationRate: number;
    classCapacityUtilization: number;
  };
}
```

### Get Performance Metrics
```http
GET /api/v1/principal/analytics/performance
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    academicPerformance: {
      overallPassRate: number;
      averageGrade: number;
      subjectPerformance: Array<{
        subjectName: string;
        averageScore: number;
        passRate: number;
        totalStudents: number;
      }>;
      classPerformance: Array<{
        className: string;
        subClassName: string;
        averageScore: number;
        passRate: number;
        totalStudents: number;
        teacherName: string;
      }>;
    };
    attendanceMetrics: {
      overallAttendanceRate: number;
      classAttendanceRates: Array<object>;
      monthlyAttendanceTrends: Array<object>;
    };
    teacherPerformance: {
      totalTeachers: number;
      averageClassesPerTeacher: number;
      teacherEfficiency: Array<{
        teacherName: string;
        subjectsTeaching: number;
        averageStudentPerformance: number;
        classesManaged: number;
        attendanceRate: number;
      }>;
    };
  };
}
```

### Get Financial Overview
```http
GET /api/v1/principal/analytics/financial
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalExpectedRevenue: number;
    totalCollectedRevenue: number;
    collectionRate: number;
    pendingPayments: number;
    monthlyCollectionTrends: Array<{
      month: string;
      collected: number;
      expected: number;
      collectionRate: number;
    }>;
    paymentMethodBreakdown: Array<{
      method: string;
      amount: number;
      percentage: number;
      transactionCount: number;
    }>;
    outstandingDebts: Array<{
      studentName: string;
      className: string;
      amountOwed: number;
      daysOverdue: number;
    }>;
  };
}
```

### Get Discipline Overview
```http
GET /api/v1/principal/analytics/discipline
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    averageResolutionTime: number;
    issuesByType: Array<{
      issueType: string;
      count: number;
      trend: "INCREASING" | "DECREASING" | "STABLE";
    }>;
    studentsByIssueCount: Array<{
      studentName: string;
      className: string;
      issueCount: number;
      lastIssueDate: string;
    }>;
    monthlyTrends: Array<{
      month: string;
      totalIssues: number;
      resolvedIssues: number;
    }>;
  };
}
```

### Get Staff Overview
```http
GET /api/v1/principal/analytics/staff
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalStaff: number;
    teacherCount: number;
    administrativeStaff: number;
    staffUtilization: Array<{
      role: string;
      count: number;
      utilizationRate: number;
    }>;
    recentHires: Array<{
      name: string;
      role: string;
      hireDate: string;
      department: string;
    }>;
    staffPerformanceMetrics: Array<{
      staffName: string;
      role: string;
      performanceScore: number;
      responsibilities: number;
    }>;
  };
}
```

### Get Academic Performance Report
```http
GET /api/v1/principal/reports/academic-performance
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  classId?: number;
  subjectId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    academicPerformance: {
      overallPassRate: number;
      averageGrade: number;
      subjectPerformance: Array<object>; // Filtered by subjectId if provided
      classPerformance: Array<object>;   // Filtered by classId if provided
    };
    generatedAt: string;
    filters: {
      academicYearId: number | null;
      classId: number | null;
      subjectId: number | null;
    };
  };
}
```

### Get Attendance Analysis
```http
GET /api/v1/principal/reports/attendance-analysis
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
  classId?: number;
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    overallMetrics: {
      overallAttendanceRate: number;
      classAttendanceRates: Array<object>;
      monthlyAttendanceTrends: Array<object>;
    };
    dateRange: {
      startDate: string;
      endDate: string;
    };
    classFilter: number | null;
    summary: {
      totalAnalyzed: number;
      averageAttendanceRate: number;
      trendsIdentified: number;
      issuesDetected: number;
    };
    recommendations: Array<string>;
  };
}
```

### Get Teacher Performance Analysis
```http
GET /api/v1/principal/reports/teacher-performance
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  academicYearId?: number;
  departmentId?: number;
  performanceThreshold?: number; // Default: 10
}
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    summary: {
      totalTeachers: number;
      aboveThreshold: number;
      needsImprovement: number;
      averagePerformance: number;
    };
    teacherAnalysis: Array<{
      teacherName: string;
      subjectsTeaching: number;
      averageStudentPerformance: number;
      classesManaged: number;
      attendanceRate: number;
      performanceCategory: "ABOVE_THRESHOLD" | "NEEDS_IMPROVEMENT";
      recommendations: Array<string>;
    }>;
    performanceThreshold: number;
    generatedAt: string;
  };
}
```

### Get Financial Performance Analysis
```http
GET /api/v1/principal/reports/financial-performance
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    totalExpectedRevenue: number;
    totalCollectedRevenue: number;
    collectionRate: number;
    pendingPayments: number;
    paymentMethodBreakdown: Array<object>;
    outstandingDebts: Array<object>;
    performanceIndicators: {
      collectionEfficiency: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT";
      outstandingRisk: "HIGH" | "MEDIUM" | "LOW";
      diversificationIndex: "GOOD" | "LIMITED";
    };
    alerts: Array<string>;
    recommendations: Array<string>;
  };
}
```

### Get School Overview Summary
```http
GET /api/v1/principal/overview/summary
Authorization: Bearer <token>
```

**Response (200):**
```typescript
{
  success: true;
  data: {
    keyMetrics: {
      totalStudents: number;
      totalTeachers: number;
      collectionRate: number;
      overallPassRate: number;
      attendanceRate: number;
      disciplineIssues: number;
    };
    alerts: Array<string>;
    trends: {
      enrollmentTrend: "INCREASING" | "STABLE" | "DECREASING";
      performanceTrend: "IMPROVING" | "STABLE" | "DECLINING";
      financialTrend: "POSITIVE" | "STABLE" | "CONCERNING";
    };
    priorities: Array<string>;
  };
}
```

---

## Error Handling

All endpoints return standardized error responses:

### 400 Bad Request
```typescript
{
  success: false;
  error: "Descriptive error message about invalid request";
}
```

### 401 Unauthorized
```typescript
{
  success: false;
  error: "User not authenticated" | "Invalid credentials";
}
```

### 403 Forbidden
```typescript
{
  success: false;
  error: "Access denied: insufficient permissions";
}
```

### 404 Not Found
```typescript
{
  success: false;
  error: "Resource not found";
}
```

### 409 Conflict
```typescript
{
  success: false;
  error: "Resource already exists" | "Conflict with current state";
}
```

### 500 Internal Server Error
```typescript
{
  success: false;
  error: "Internal server error message";
}
```

---

## Notes on Implementation

### Authentication
- All protected endpoints require `Authorization: Bearer <token>` header
- Tokens expire in 24 hours
- Login supports both email and matricule as identifier

### Data Conversion
- **Frontend Interface**: All requests and responses use **camelCase**
- **Backend Processing**: Internal processing uses snake_case
- **Middleware**: Automatic conversion between camelCase ↔ snake_case
- **API Documentation**: Shows camelCase (what developers actually use)

### Academic Year Context
- Most operations default to current academic year if not specified
- Academic year filtering is available on most endpoints

### Pagination
- Default: page=1, limit=10
- Maximum limit: typically 100
- Includes meta information: total, page, limit, totalPages

### Role-Based Access
- Endpoints are protected by role-based middleware
- Some endpoints have specific role requirements
- Teachers have access controls based on subject/subclass assignments

### Date Formats
- All dates are in "YYYY-MM-DD" format
- DateTime fields include time component
- Times are in "HH:mm" format

This documentation reflects the actual frontend interface using camelCase. The middleware handles automatic conversion to/from the backend's snake_case implementation. 