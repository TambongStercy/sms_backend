# School Management System - Complete Role Documentation

## Overview
This document provides comprehensive documentation for all user roles in the School Management System, their specific functions, dashboard endpoints, and access permissions.

## Matricule System
- **CEO**: Super Manager (Super Administrator)
- **SA**: Administrators (Manager, Principal, Vice Principal, Bursar)  
- **SO**: Others (Discipline Master/SDM, Guidance Counselor, Parents)
- **ST**: Teachers and HODs

## Authentication
- **Login Method**: Matricule + Password (username removed)
- **Matricule**: Auto-generated based on role

---

## 1. SUPER MANAGER (CEO Prefix)

### Role Description
The Super Manager has the highest access level and can perform all functions in the system. They oversee the entire school operation and have administrative control over all features.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=SUPER_MANAGER
```

### Core Functions

#### 1.1 School Overview
- **Finance Management**
  - View total fees collected vs expected
  - Monitor payment transactions
  - Track outstanding fees across all classes
  - Generate financial reports

- **Discipline Management**
  - View system-wide discipline statistics
  - Monitor pending discipline issues
  - Track resolution times
  - Oversee discipline policies

- **Teacher Management**
  - View all teacher profiles
  - Monitor total hours per week per teacher
  - Track teacher attendance
  - Manage teacher assignments

#### 1.2 Reports & Analytics
- **Deadline Management**
  - Set deadlines for academic reports
  - Monitor report generation status
  - Receive notifications when reports are overdue
  - Track who submitted/modified reports

- **System Analytics**
  - Student enrollment statistics
  - Academic performance trends
  - Financial analytics
  - Operational efficiency metrics

#### 1.3 Form Creation & Management
- **Dynamic Form Builder**
  - Create custom forms for different purposes
  - Assign forms to specific roles
  - Set form deadlines
  - Track form submissions
  - Design tabular-friendly layouts

- **Question Management**
  - Create question banks
  - Design different question types (MCQ, Long Answer)
  - Manage form templates

#### 1.4 Administrative Controls
- **User Management**
  - Create/modify all user types
  - Assign roles and permissions
  - Manage academic years
  - Set system-wide policies

- **Audit Trail**
  - Track all system modifications
  - View who made changes and when
  - Monitor user activities
  - Generate audit reports

### Dashboard Data Structure
```typescript
interface SuperManagerDashboard {
  academicYearCount: number;
  personnelCount: number;
  studentCount: number;
  classCount: number;
  subClassCount: number;
  totalFeesCollected: number;
  pendingReports: number;
  systemModifications: AuditLog[];
  upcomingDeadlines: Deadline[];
}
```

---

## 2. MANAGER (SA Prefix)

### Role Description
Managers perform comprehensive school management functions similar to Super Manager but simplified for ease of use. They are designed for experienced administrators who need full operational control without the most complex system-level features. This role is perfect for "old people" who want all the core management capabilities in a more accessible format.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=MANAGER
```

### Core Functions

#### 2.1 School Overview (Same as Super Manager)
- **Finance Management**
  - View total fees collected vs expected
  - Monitor payment transactions and collection rates
  - Track outstanding fees across all classes
  - Generate financial reports and summaries
  - Record and manage payments

- **Discipline Management**
  - View system-wide discipline statistics
  - Monitor pending discipline issues
  - Track resolution times and patterns
  - Record discipline issues and attendance
  - Oversee discipline policies

- **Teacher Management**
  - View all teacher profiles with complete details
  - Monitor total hours per week per teacher
  - Track teacher attendance and performance
  - Manage teacher assignments to subjects and classes
  - View teacher analytics and statistics

#### 2.2 Class Profiles & Analytics
- **Class Management**
  - View class utilization rates and capacity
  - Monitor student distribution across subclasses
  - Manage class and subclass creation/updates
  - Track average class sizes and optimization
  - Assign class masters and manage assignments

- **Student Overview**
  - View all students across the system
  - Monitor enrollment status and academic progress
  - Manage student records and assignments
  - Track student-parent relationships

#### 2.3 Reports & Analytics (Full Access)
- **Report Management**
  - Set deadlines for academic reports
  - Monitor report generation status and completion rates
  - Receive notifications when reports are overdue
  - Track who submitted/modified reports with timestamps
  - View recent report submissions and their status

- **Academic Analytics**
  - Student enrollment and performance statistics
  - Academic performance trends across classes
  - Financial analytics and collection patterns
  - Operational efficiency metrics

#### 2.4 Form Creation & Management (Full Access)
- **Dynamic Form Builder**
  - Create custom forms for different purposes
  - Assign forms to specific roles and users
  - Set form deadlines and track submissions
  - Monitor form completion rates
  - Design forms suitable for administrative use

- **Question Management**
  - Create question banks and templates
  - Design different question types
  - Manage form workflows and approvals

#### 2.5 Audit Trail & Accountability
- **System Monitoring**
  - Track all system modifications with user attribution
  - View who made changes and when with complete details
  - Monitor user activities across the system
  - Generate accountability reports
  - Track data input and modification patterns

#### 2.6 User Management (Limited)
- **Staff Management**
  - Create and manage all user types except deletion
  - Assign roles and permissions to users
  - Manage teacher assignments and responsibilities
  - Update user profiles and information
  - View comprehensive user directories

### Dashboard Data Structure
```typescript
interface ManagerDashboard {
  // School Overview
  schoolOverview: {
    financial: {
      totalFeesCollected: number;
      totalFeesExpected: number;
      collectionRate: number;
      pendingPayments: number;
      outstandingAmount: number;
    };
    academic: {
      totalStudents: number;
      totalClasses: number;
      totalSubClasses: number;
      averageStudentsPerClass: number;
    };
    personnel: {
      totalTeachers: number;
      totalStaff: number;
      teacherAttendanceRate: number;
      presentToday: number;
    };
  };

  // Teacher Analytics
  teacherAnalytics: {
    totalTeachers: number;
    teacherProfiles: Array<{
      id: number;
      name: string;
      matricule: string;
      subjects: string[];
      totalHoursPerWeek: number;
      attendanceRate: number;
    }>;
    attendanceStats: {
      averageAttendance: number;
      presentToday: number;
      totalTeachers: number;
    };
    averageHoursPerWeek: number;
  };

  // Class Profiles
  classProfiles: {
    totalClasses: number;
    averageUtilization: number;
    classDetails: Array<{
      id: number;
      name: string;
      className: string;
      currentStudents: number;
      maxStudents: number;
      utilizationRate: number;
    }>;
    underutilizedClasses: number;
    fullClasses: number;
  };

  // Discipline Management
  disciplineManagement: {
    pendingIssues: number;
    disciplineBreakdown: Record<string, number>;
    totalIssuesThisMonth: number;
  };

  // Reports Analytics
  reportsAnalytics: {
    pendingReports: number;
    overdueReports: number;
    completionRate: number;
    recentSubmissions: Array<{
      id: number;
      type: string;
      submittedBy: string;
      submittedAt: string;
      status: string;
    }>;
  };

  // Form Management
  formManagement: {
    activeForms: number;
    recentSubmissions: number;
    formsNeedingReview: number;
  };

  // Audit Trail
  auditTrail: {
    recentModifications: Array<{
      id: number;
      action: string;
      modifiedBy: string;
      userMatricule: string;
      timestamp: string;
      details: any;
    }>;
    modificationsToday: number;
  };

  // System Statistics
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    systemUptime: number;
    lastDataUpdate: string;
  };

  // Summary
  summary: {
    studentsEnrolled: number;
    teachersActive: number;
    classesRunning: number;
    feesCollected: number;
    pendingTasks: number;
    systemHealth: string;
  };

  lastUpdated: string;
}
```

---

## MANAGER vs SUPER_MANAGER - Permissions Matrix

| Function Category | Feature | MANAGER | SUPER_MANAGER | Notes |
|-------------------|---------|---------|---------------|-------|
| **User Management** | View all users | ✅ | ✅ | Full access |
| | Create users | ✅ | ✅ | Full access |
| | Update users | ✅ | ✅ | Full access |
| | Delete users | ❌ | ✅ | Only SUPER_MANAGER |
| | Assign roles | ✅ | ✅ | Full access |
| | Remove roles | ✅ | ✅ | Full access |
| **Academic Years** | Create academic years | ✅ | ✅ | Full access |
| | Update academic years | ✅ | ✅ | Full access |
| | Set current year | ✅ | ✅ | Full access |
| | Delete academic years | ✅ | ✅ | Full access |
| **Student Management** | View all students | ✅ | ✅ | Full access |
| | Create students | ✅ | ✅ | Full access |
| | Update students | ✅ | ✅ | Full access |
| | Enroll students | ✅ | ✅ | Full access |
| | Link parents | ✅ | ✅ | Full access |
| **Class Management** | Create classes | ✅ | ✅ | Full access |
| | Update classes | ✅ | ✅ | Full access |
| | Create subclasses | ✅ | ✅ | Full access |
| | Assign class masters | ✅ | ✅ | Full access |
| | Delete subclasses | ✅ | ✅ | Full access |
| **Subject Management** | Create subjects | ✅ | ✅ | Full access |
| | Update subjects | ✅ | ✅ | Full access |
| | Delete subjects | ✅ | ✅ | Full access |
| | Assign teachers | ✅ | ✅ | Full access |
| **Financial Management** | View financial overview | ✅ | ✅ | Full access |
| | Create fees | ✅ | ✅ | Full access |
| | Record payments | ✅ | ✅ | Full access |
| | Generate reports | ✅ | ✅ | Full access |
| | Delete fees | ✅ | ✅ | Full access |
| **Communication** | Create announcements | ✅ | ✅ | Full access |
| | Send notifications | ✅ | ✅ | Full access |
| | Update announcements | ✅ | ✅ | Full access |
| **Discipline Management** | View discipline issues | ✅ | ✅ | Full access |
| | Record discipline issues | ✅ | ✅ | Full access |
| | Record attendance | ✅ | ✅ | Full access |
| | Track lateness | ✅ | ✅ | Full access |
| **Quiz Management** | Create quizzes | ✅ | ✅ | Full access |
| | View quiz statistics | ✅ | ✅ | Full access |
| | Manage quiz content | ✅ | ✅ | Full access |
| **Reports & Analytics** | Set report deadlines | ✅ | ✅ | Full access |
| | Monitor report status | ✅ | ✅ | Full access |
| | Generate analytics | ✅ | ✅ | Full access |
| | Access audit trail | ✅ | ✅ | Full access |
| **Form Management** | Create forms | ✅ | ✅ | Full access |
| | Assign forms to roles | ✅ | ✅ | Full access |
| | Track submissions | ✅ | ✅ | Full access |
| **System Administration** | Advanced system settings | ❌ | ✅ | SUPER_MANAGER only |
| | Database maintenance | ❌ | ✅ | SUPER_MANAGER only |
| | System-level configurations | ❌ | ✅ | SUPER_MANAGER only |
| **Enhanced Features** | Form Builder (Advanced) | ✅ | ✅ | Simplified for MANAGER |
| | Complex analytics | ✅ | ✅ | Simplified interface |
| | Multi-system integration | ❌ | ✅ | SUPER_MANAGER only |

### Key Differences:
1. **User Deletion**: Only SUPER_MANAGER can permanently delete users
2. **System Administration**: SUPER_MANAGER has access to advanced system settings and configurations
3. **Interface Complexity**: MANAGER gets simplified, user-friendly interfaces for complex features
4. **Advanced Integration**: SUPER_MANAGER handles complex system integrations and advanced technical features

Both roles have access to all core school management functions, with MANAGER providing a more accessible interface for comprehensive school administration.

---

## 3. PRINCIPAL (SA Prefix)

### Role Description
Principals oversee the academic and administrative operations of the school, including staff management and academic oversight.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=PRINCIPAL
```

### Core Functions

#### 3.1 Academic Oversight
- Monitor student enrollment and performance
- Oversee exam sequences and results
- Review academic reports
- Manage academic calendar

#### 3.2 Staff Management
- Monitor teacher performance
- Review discipline issues
- Oversee attendance tracking
- Manage staff assignments

#### 3.3 Administrative Functions
- Create academic years and terms
- Approve major academic decisions
- Monitor school-wide statistics
- Handle escalated issues

### Dashboard Data Structure
```typescript
interface PrincipalDashboard {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeExamSequences: number;
  pendingDisciplineIssues: number;
  averageAttendanceRate: number;
}
```

---

## 4. VICE PRINCIPAL (SA Prefix)

### Role Description
Vice Principals focus on student management, particularly new student interviews and subclass assignments. They also track teacher performance.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=VICE_PRINCIPAL
```

### Core Functions

#### 4.1 Student Management
- **Unassigned Students Dashboard**
  ```
  GET /api/v1/enrollment/unassigned-students
  ```
  - View all students not assigned to subclasses
  - Filter by class and academic year
  - Track interview status

- **Interview Process**
  ```
  POST /api/v1/enrollment/record-interview
  ```
  - Record interview marks for new students
  - Add interview notes and recommendations
  - Track interview completion

- **Subclass Assignment**
  ```
  POST /api/v1/enrollment/assign-to-subclass
  ```
  - Assign students to subclasses after interviews
  - Enforce 80-student maximum per class
  - Validate subclass capacity

#### 4.2 Teacher Tracking
- Monitor teacher attendance
- Track teaching hours
- Review teacher performance
- Handle teacher-related issues

#### 4.3 Class Management
- Manage subclass assignments
- Monitor class capacity (max 80 students)
- Oversee class-level discipline

### Available Endpoints
```typescript
// Student Management
GET    /api/v1/enrollment/unassigned-students
POST   /api/v1/enrollment/record-interview
POST   /api/v1/enrollment/assign-to-subclass
GET    /api/v1/enrollment/stats

// Subclass Management  
GET    /api/v1/enrollment/available-subclasses
```

### Dashboard Data Structure
```typescript
interface VicePrincipalDashboard {
  assignedSubClasses: number;
  totalStudentsUnderSupervision: number;
  studentsAwaitingAssignment: number;
  completedInterviews: number;
  pendingInterviews: number;
  recentDisciplineIssues: number;
  classesWithPendingReports: number;
  teacherAbsences: number;
}
```

---

## 5. BURSAR (SA Prefix)

### Role Description
Bursars handle all financial operations, student enrollment, fee management, and parent communications.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=BURSAR
```

### Core Functions

#### 5.1 Student Enrollment
- **Student Registration**
  ```
  POST /api/v1/enrollment/register-student
  ```
  - Create new student records
  - Assign students to classes (not subclasses)
  - Set initial enrollment status
  - Generate student matricules

#### 5.2 Fee Management
- **Record Payment**
  ```
  POST /api/v1/fees/record-payment
  ```
  - Payment methods: Express Union, CCA, 3DC
  - Mandatory receipt date
  - Amount validation
  - Payment history tracking
  - Feedback system for successful payments

- **Fee Structure**
  - Input: Name/Matricule, Amount, Bank, Payment Date (from receipt)
  - Auto-populated: Class, Academic Year
  - Optional: Score/Grade

#### 5.3 Parent Management
- **Parent Registration**
  ```
  POST /api/v1/parents/register
  ```
  - Add parents with WhatsApp/phone numbers
  - Link parents to students
  - Manage parent communications

#### 5.4 Financial Reporting
- Track fee collection rates
- Generate payment reports
- Monitor outstanding balances
- Handle fee inquiries

### Available Endpoints
```typescript
// Student Management
POST   /api/v1/enrollment/register-student

// Fee Management
POST   /api/v1/fees/create
POST   /api/v1/fees/record-payment
GET    /api/v1/fees/student/:studentId
GET    /api/v1/fees/subclass/:subclassId/summary

// Parent Management
POST   /api/v1/parents/register
GET    /api/v1/parents/by-student/:studentId
```

### Dashboard Data Structure
```typescript
interface BursarDashboard {
  totalFeesExpected: number;
  totalFeesCollected: number;
  pendingPayments: number;
  collectionRate: number;
  recentTransactions: number;
  newStudentsThisMonth: number;
  paymentMethods: PaymentMethodStats[];
}
```

---

## 6. DISCIPLINE MASTER/SDM (SO Prefix)

### Role Description
Discipline Masters (renamed to SDM) handle all student discipline issues, particularly morning lateness and class absences.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=DISCIPLINE_MASTER
```

### Core Functions

#### 6.1 Discipline Tracking
- **Morning Lateness**
  - Record students arriving late
  - Track lateness patterns
  - Generate lateness reports

- **Class Absences**
  - Record class-specific absences
  - Track absence patterns
  - Monitor chronic absenteeism

#### 6.2 Discipline Management
- **Issue Recording**
  ```
  POST /api/v1/discipline/create-issue
  ```
  - Record discipline incidents
  - Categorize by type (lateness, absence, misconduct)
  - Add detailed descriptions and notes

- **Issue Resolution**
  - Track resolution progress
  - Monitor resolution times
  - Generate discipline reports

### Dashboard Data Structure
```typescript
interface DisciplineMasterDashboard {
  pendingDisciplineIssues: number;
  resolvedThisWeek: number;
  studentsWithMultipleIssues: number;
  averageResolutionTime: number;
  attendanceRate: number;
  latenessIncidents: number;
  absenteeismCases: number;
}
```

---

## 7. TEACHER (ST Prefix)

### Role Description
Teachers handle instruction, period tracking, timetable management, and student assessment.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=TEACHER
```
```
GET /api/v1/teachers/me/dashboard
```

### Core Functions

#### 7.1 Teaching Management
- **Subject Teaching**
  - Manage assigned subjects
  - Track teaching hours per week
  - Monitor class schedules

#### 7.2 Period Tracking
- **Timetable Management**
  ```
  GET /api/v1/timetable/teacher/:teacherId
  ```
  - View personal timetable
  - Track teaching periods
  - Export timetable data
  - Auto-save timetable changes

#### 7.3 Student Assessment
- **Mark Entry**
  - Enter student marks
  - Track exam results
  - Generate grade reports

#### 7.4 Attendance Tracking
- Record student attendance
- Monitor class participation
- Report attendance issues

### Available Endpoints
```typescript
// Teaching Management
GET    /api/v1/teachers/me/profile
GET    /api/v1/teachers/me/subjects
GET    /api/v1/teachers/me/dashboard

// Timetable
GET    /api/v1/timetable/teacher/:teacherId
POST   /api/v1/timetable/auto-save
GET    /api/v1/timetable/export/:teacherId

// Assessment
POST   /api/v1/marks/create
GET    /api/v1/marks/subject/:subjectId
```

### Dashboard Data Structure
```typescript
interface TeacherDashboard {
  subjectsTeaching: number;
  totalStudentsTeaching: number;
  marksToEnter: number;
  classesTaught: number;
  upcomingPeriods: number;
  weeklyHours: number;
  attendanceRate: number;
  totalHoursPerWeek: number;
}
```

---

## 8. HOD - HEAD OF DEPARTMENT (ST Prefix)

### Role Description
HODs manage subject departments while maintaining teaching responsibilities.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=HOD
```

### Core Functions
- All Teacher functions
- Department management
- Subject coordination
- Teacher supervision within department

### Dashboard Data Structure
```typescript
interface HODDashboard extends TeacherDashboard {
  departmentTeachers: number;
  subjectsInDepartment: number;
  departmentPerformance: number;
}
```

---

## 9. PARENT (SO Prefix)

### Role Description
Parents monitor their children's academic progress, communicate with school, and manage school-related activities.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=PARENT
```

### Core Functions

#### 9.1 Student Monitoring
- **Landing Page Dashboard**
  - Child's academic overview
  - Recent activities
  - Important notifications

- **Student Page Features**
  - View absences and attendance
  - Access class information
  - Download report cards
  - Track academic progress

#### 9.2 Communication
- **Notification Management**
  - Send absence notifications
  - Send payment notifications
  - Write messages to teachers/admin
  - Receive school announcements

#### 9.3 Financial Tracking
- **School Fees**
  - View fee statements
  - Track payment history
  - Monitor outstanding balances
  - Receive payment reminders

#### 9.4 Academic Engagement
- **Quizzes & Assessments**
  - Access child's quiz results
  - Monitor assessment performance
  - Track progress over time

### Dashboard Data Structure
```typescript
interface ParentDashboard {
  totalChildren: number;
  childrenEnrolled: number;
  pendingFees: number;
  latestGrades: number;
  disciplineIssues: number;
  unreadMessages: number;
  upcomingEvents: number;
}
```

---

## 10. STUDENT (SO Prefix)

### Role Description
Students access their personal academic information and track their progress.

### Dashboard Endpoint
```
GET /api/v1/users/me/dashboard?role=STUDENT
```

### Core Functions

#### 10.1 Academic Progress
- View grades and marks
- Access report cards
- Track attendance
- Monitor academic performance

#### 10.2 Class Information
- View class schedule
- Access timetable
- See classmates (limited)
- Track assignments

### Dashboard Data Structure
```typescript
interface StudentDashboard {
  currentClass: string;
  currentSubClass: string;
  totalSubjects: number;
  completedExams: number;
  hasPendingFees: boolean;
  disciplineIssues: number;
  averageGrade: number;
  attendanceRate: number;
}
```

---

## System Features

### 1. Enhanced Matricule System
- **Auto-generation** based on role and sequence
- **Prefix mapping**: CEO, SA, SO, ST
- **Unique identification** across the system

### 2. Student Status Tracking
- **NOT_ENROLLED**: Initial status
- **ENROLLED**: Registered by Bursar
- **ASSIGNED_TO_CLASS**: Assigned by VP after interview
- **GRADUATED**: Completed studies
- **TRANSFERRED**: Moved to another school
- **SUSPENDED**: Disciplinary suspension

### 3. Payment System Enhancements
- **Supported Banks**: Express Union, CCA, 3DC
- **Mandatory Receipt Date**: From actual payment receipt
- **Payment History**: Complete transaction tracking
- **Feedback System**: Confirmation and status updates

### 4. Timetable Management
- **Auto-save functionality**
- **Export capabilities**
- **Class and general timetables**
- **Period tracking integration**

### 5. Form Creation System
- **Dynamic form builder** for Super Manager
- **Role-based assignment**
- **Tabular-friendly design**
- **Deadline management**
- **Submission tracking**

### 6. Audit Trail
- **Complete modification tracking**
- **User action logging**
- **Change history**
- **Accountability features**

---

## API Authentication & Authorization

### Role-Based Access Control
Each endpoint requires appropriate role permissions:

```typescript
// Example authentication middleware usage
router.get('/dashboard', 
  authenticate, 
  authorize(['SUPER_MANAGER', 'MANAGER']), 
  getDashboard
);
```

### Token-Based Authentication
- JWT tokens with role information
- Matricule-based login
- Session management
- Password security

---

## Implementation Status

### ✅ Completed Features
- Basic dashboard endpoints for all roles
- Student enrollment workflow
- Fee management system
- Role-based authentication
- Academic year management

### 🚧 In Progress
- Enhanced dashboard data
- Form creation system
- Advanced audit trail
- Parent portal features

### 📋 Planned Features
- Mobile app integration
- Advanced analytics
- Notification system
- Report generation automation
- Timetable export functionality

---

This documentation provides the complete framework for all user roles in the School Management System. Each role has specific responsibilities, dashboard endpoints, and access permissions tailored to their needs in the educational environment. 