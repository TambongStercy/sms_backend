# SUPER_MANAGER Role - Complete Workflow & UX Design

*Note: SUPER_MANAGER has system-wide administrative access and oversight of all operations*

## Post-Login Super Manager Dashboard (`/super-manager/dashboard`)

### **Comprehensive Admin Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ [🏠] School Management System    [🔔] [👤] [⚙️] [🚪]    │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [Admin Name] | System Administrator       │
│ Complete System Access | Current Year: 2024-2025        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── System Overview ───┐                              │
│ │ 🏫 Academic Years: 3     👥 Total Personnel: 52      │
│ │ 👨‍🎓 Total Students: 1,245  🏫 Total Classes: 24        │
│ │ 📚 Subclasses: 48        💰 Total Fees: 95M FCFA      │
│ │ 📊 Collection Rate: 78%   🚨 System Alerts: 5         │
│ │ 📄 Report Cards: 1,156/1,245 (93%) Generated         │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Quick Actions ───┐   ┌─── Recent Activity ───┐    │
│ │ [➕ Add Academic Year]   │ │ • VP assigned 5 students   │
│ │ [👤 Create User]         │ │ • Bursar recorded 20 fees  │
│ │ [🏫 Manage Classes]      │ │ • Teacher entered marks    │
│ │ [📊 System Reports]      │ │ • 3 discipline issues      │
│ │ [📄 Report Card Status]  │ │ • Parent sent message      │
│ │ [⚙️ System Settings]     │ │ • 67 reports generating    │
│ └─────────────────────────┘ └─────────────────────────┘ │
│                                                         │
│ ┌─── Critical Alerts ───┐                              │
│ │ ⚠️ 5 students awaiting VP assignment                  │
│ │ 💰 12 fee payment conflicts need review               │
│ │ ❌ 22 report cards failed generation - needs review   │
│ │ 📊 Sequence 3 reports pending for 3 classes          │
│ │ 🔧 System backup scheduled in 2 hours                │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **API Integration:**
```http
GET /api/v1/manager/dashboard
Authorization: Bearer {token}

Query Parameters:
?role=SUPER_MANAGER&academicYearId=all  // SUPER_MANAGER can see all years

Success Response (200):
{
  "success": true,
  "data": {
    "systemOverview": {
      "academicYears": 3,
      "totalPersonnel": 52,
      "totalStudents": 1245,
      "totalClasses": 24,
      "totalSubclasses": 48,
      "totalFees": "95000000 FCFA",
      "collectionRate": 78,
      "systemAlerts": 5
    },
    "criticalAlerts": [
      {
        "priority": "HIGH",
        "message": "5 students awaiting VP assignment",
        "type": "ACADEMIC",
        "actionRequired": true
      },
      {
        "priority": "MEDIUM",
        "message": "12 fee payment conflicts need review",
        "type": "FINANCIAL",
        "actionRequired": true
      }
    ],
    "recentActivity": [
      {
        "action": "VP assigned 5 students",
        "user": "Vice Principal",
        "timestamp": "2024-01-22T10:30:00Z",
        "type": "ACADEMIC"
      }
    ],
    "quickActions": [
      {
        "action": "ADD_ACADEMIC_YEAR",
        "label": "Add Academic Year",
        "enabled": true
      },
      {
        "action": "CREATE_USER", 
        "label": "Create User",
        "enabled": true
      }
    ]
  }
}
```

---

## Main Navigation Menu

### **Sidebar Navigation**
```
┌─ SYSTEM ADMINISTRATION ─┐
├─ 📊 Dashboard
├─ 📅 Academic Years
├─ 👥 User Management  
├─ 🏫 School Structure
├─ 💰 Financial Overview
├─ 📚 Academic Management
├─ 🚨 Discipline Overview
├─ 📄 Report Card Management
├─ 📈 Reports & Analytics
├─ ⚙️ System Settings
└─ 🔧 System Maintenance
```

---

## 1. Academic Year Management (`/super-manager/academic-years`)

### **Academic Years Page**
```
┌─────────────────────────────────────────────────────────┐
│ Academic Year Management                [➕ New Year]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Academic Years List ───┐                          │
│ │ 🟢 2024-2025 (Current)     [📊] [⚙️] [Set Current]    │
│ │    Sep 1, 2024 - Jul 31, 2025                        │
│ │    Students: 1,245 | Personnel: 52                   │
│ │                                                       │
│ │ ⚪ 2023-2024 (Previous)     [📊] [⚙️] [Archive]       │
│ │    Sep 1, 2023 - Jul 31, 2024                        │
│ │    Students: 1,180 | Personnel: 48                   │
│ │                                                       │
│ │ ⚪ 2022-2023 (Archived)     [📊] [⚙️] [Delete]        │
│ │    Sep 1, 2022 - Jul 31, 2023                        │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Create New Academic Year Modal**
- **Form Fields:**
  - Name (e.g., "2025-2026")
  - Start Date
  - End Date
  - Set as Current checkbox

#### **API Integration:**
```http
GET /api/v1/academic-years
Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "data": {
    "academicYears": [
      {
        "id": 1,
        "name": "2024-2025",
        "startDate": "2024-09-01",
        "endDate": "2025-07-31",
        "isCurrent": true,
        "status": "ACTIVE",
        "studentCount": 1245,
        "personnelCount": 52,
        "classCount": 24,
        "createdAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "name": "2023-2024", 
        "startDate": "2023-09-01",
        "endDate": "2024-07-31",
        "isCurrent": false,
        "status": "COMPLETED",
        "studentCount": 1180,
        "personnelCount": 48,
        "classCount": 22,
        "createdAt": "2023-01-01T00:00:00Z"
      }
    ],
    "summary": {
      "totalYears": 3,
      "currentYear": "2024-2025",
      "activeStudents": 1245,
      "archivedYears": 1
    }
  }
}

POST /api/v1/academic-years
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "2025-2026",
  "startDate": "2025-09-01",
  "endDate": "2026-07-31",
  "isCurrent": false,
  "description": "Academic year 2025-2026"
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": 3,
    "name": "2025-2026",
    "status": "CREATED",
    "message": "Academic year created successfully"
  }
}

PUT /api/v1/academic-years/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "2025-2026 Updated",
  "isCurrent": false,
  "description": "Updated academic year description"
}

POST /api/v1/academic-years/:id/set-current
Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "data": {
    "message": "Academic year set as current",
    "previousCurrent": "2024-2025",
    "newCurrent": "2025-2026",
    "affectedRecords": {
      "users": 52,
      "enrollments": 0
    }
  }
}
```

---

## 2. User Management (`/super-manager/users`)

### **User Management Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│ User Management                         [➕ Create User] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Filter & Search ───┐                              │
│ │ [🔍 Search Name/Email] [📋 Role Filter] [📅 Year]     │
│ │ [🟢 Active] [🔴 Inactive] [⭐ Recent]                  │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Users List ───┐                                   │
│ │ 👤 John Principal (PRINCIPAL)           [👁️] [✏️] [🗑️] │
│ │    📧 john@school.com | 📱 +237123456789              │
│ │    🟢 Active | Created: Jan 15, 2024                 │
│ │                                                       │
│ │ 👩 Mary Bursar (BURSAR)                 [👁️] [✏️] [🗑️] │
│ │    📧 mary@school.com | 📱 +237987654321              │
│ │    🟢 Active | Last Login: 2 hours ago               │
│ │                                                       │
│ │ 👨 Paul Teacher (TEACHER, HOD-MATH)     [👁️] [✏️] [🗑️] │
│ │    📧 paul@school.com | 📱 +237456789123              │
│ │    🟢 Active | Multiple Roles                        │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Create User Form**
- **Personal Information:**
  - Name, Email, Phone, Gender
  - Date of Birth, Address, ID Card Number
  - Profile Photo Upload

- **Role Assignment:**
  - Multiple role selection
  - Academic year context for roles
  - Permission preview

#### **API Integration:**
```http
GET /api/v1/users
Authorization: Bearer {token}

Query Parameters:
?role=TEACHER&status=ACTIVE&page=1&limit=50&search=john&academicYearId=1

Success Response (200):
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Principal",
        "email": "john@school.com",
        "phone": "+237123456789",
        "status": "ACTIVE",
        "roles": [
          {
            "role": "PRINCIPAL",
            "academicYearId": 1,
            "academicYearName": "2024-2025"
          }
        ],
        "lastLogin": "2024-01-22T08:00:00Z",
        "createdAt": "2024-01-15T00:00:00Z",
        "profilePhoto": "/uploads/profiles/john.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 298,
      "totalPages": 6
    },
    "summary": {
      "totalUsers": 298,
      "byRole": {
        "PRINCIPAL": 1,
        "VICE_PRINCIPAL": 2,
        "TEACHER": 45,
        "HOD": 8,
        "BURSAR": 2,
        "PARENT": 201,
        "STUDENT": 39
      },
      "byStatus": {
        "ACTIVE": 285,
        "INACTIVE": 13
      }
    }
  }
}

POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "New Principal",
  "email": "principal@school.com", 
  "phone": "+237987654321",
  "gender": "FEMALE",
  "dateOfBirth": "1980-03-15",
  "address": "456 School Road",
  "idCardNumber": "ID987654321",
  "profilePhoto": "base64_encoded_image_data",
  "roles": [
    {
      "role": "PRINCIPAL",
      "academicYearId": 1
    },
    {
      "role": "TEACHER", 
      "academicYearId": 1
    }
  ],
  "password": "SecurePassword123!",
  "sendCredentials": true
}

Success Response (201):
{
  "success": true,
  "data": {
    "userId": 299,
    "name": "New Principal",
    "status": "CREATED",
    "rolesAssigned": 2,
    "credentialsSent": true
  }
}

PUT /api/v1/users/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Updated Name",
  "phone": "+237111222333",
  "status": "ACTIVE",
  "address": "Updated Address"
}

DELETE /api/v1/users/:id
Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "data": {
    "message": "User deleted successfully",
    "affectedRecords": {
      "enrollments": 0,
      "marks": 0,
      "messages": 5
    }
  }
}

POST /api/v1/users/:id/roles
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "roles": [
    {
      "role": "HOD",
      "academicYearId": 1
    }
  ]
}

DELETE /api/v1/users/:id/roles
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "role": "TEACHER",
  "academicYearId": 1
}
```

---

## 3. School Structure (`/super-manager/structure`)

### **School Structure Management**
```
┌─────────────────────────────────────────────────────────┐
│ School Structure Management                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Classes & Subclasses ───┐   ┌─── Subjects ───┐    │
│ │ 🏫 FORM 1 (120 students)     │   │ 📚 Mathematics    │
│ │   ├─ FORM 1A (30/30)        │   │ 📖 English        │
│ │   ├─ FORM 1B (30/30)        │   │ 🧪 Physics        │
│ │   ├─ FORM 1C (30/30)        │   │ 🔬 Chemistry      │
│ │   └─ FORM 1D (30/30)        │   │ 🌍 Geography      │
│ │                              │   │ 📜 History        │
│ │ 🏫 FORM 2 (135 students)     │   │ [➕ Add Subject]  │
│ │   ├─ FORM 2A (30/30)        │   │                   │
│ │   ├─ FORM 2B (30/30)        │   └─────────────────  │
│ │   ├─ FORM 2C (30/30)        │                       │
│ │   ├─ FORM 2D (30/30)        │                       │
│ │   └─ FORM 2E (15/30)        │                       │
│ │                              │                       │
│ │ [➕ Add Class/Subclass]      │                       │
│ └──────────────────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

#### **API Integration:**
```http
GET /api/v1/classes
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&includeSubclasses=true&includeEnrollments=true

Success Response (200):
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": 1,
        "name": "FORM 1",
        "level": 1,
        "academicYearId": 1,
        "capacity": 120,
        "enrolledCount": 120,
        "subclasses": [
          {
            "id": 1,
            "name": "FORM 1A",
            "capacity": 30,
            "enrolledCount": 30,
            "classTeacherId": 15,
            "classTeacher": "Mrs. Johnson"
          },
          {
            "id": 2,
            "name": "FORM 1B",
            "capacity": 30,
            "enrolledCount": 30,
            "classTeacherId": 16,
            "classTeacher": "Mr. Brown"
          }
        ]
      }
    ],
    "summary": {
      "totalClasses": 6,
      "totalSubclasses": 24,
      "totalCapacity": 720,
      "totalEnrolled": 645,
      "utilizationRate": 89.6
    }
  }
}

GET /api/v1/subjects
Authorization: Bearer {token}

Query Parameters:
?category=CORE&level=1

Success Response (200):
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": 1,
        "name": "Mathematics",
        "code": "MTH", 
        "category": "CORE",
        "coefficient": 4,
        "level": "ALL",
        "description": "Core mathematics curriculum",
        "teacherCount": 8,
        "classCount": 24
      },
      {
        "id": 2,
        "name": "English Language",
        "code": "ENG",
        "category": "CORE", 
        "coefficient": 4,
        "level": "ALL",
        "description": "English language and literature",
        "teacherCount": 6,
        "classCount": 24
      }
    ],
    "summary": {
      "totalSubjects": 12,
      "byCategory": {
        "CORE": 6,
        "ELECTIVE": 4,
        "PRACTICAL": 2
      }
    }
  }
}

POST /api/v1/classes
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "FORM 7",
  "level": 7,
  "capacity": 60,
  "academicYearId": 1,
  "description": "Advanced level class",
  "subclasses": [
    {
      "name": "FORM 7A",
      "capacity": 30
    },
    {
      "name": "FORM 7B", 
      "capacity": 30
    }
  ]
}

Success Response (201):
{
  "success": true,
  "data": {
    "classId": 7,
    "name": "FORM 7",
    "subclassesCreated": 2,
    "message": "Class and subclasses created successfully"
  }
}

POST /api/v1/subjects
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Computer Science",
  "code": "CSC",
  "category": "ELECTIVE",
  "coefficient": 3,
  "level": "UPPER",
  "description": "Introduction to computer science and programming"
}

Success Response (201):
{
  "success": true,
  "data": {
    "subjectId": 13,
    "name": "Computer Science",
    "code": "CSC",
    "message": "Subject created successfully"
  }
}
```

---

## 4. Financial Overview (`/super-manager/finances`)

### **Financial Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│ Financial Overview - Academic Year 2024-2025           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Financial Summary ───┐                            │
│ │ 💰 Total Expected: 95,500,000 FCFA                   │
│ │ 💵 Total Collected: 75,200,000 FCFA                  │
│ │ 📊 Collection Rate: 78.7%                            │
│ │ 📈 This Month: +12,500,000 FCFA                      │
│ │ ⏰ Outstanding: 20,300,000 FCFA                       │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Payment Methods Breakdown ───┐                    │
│ │ 🏦 EXPRESS_UNION: 45,200,000 FCFA (60%)              │
│ │ 💳 CCA: 20,500,000 FCFA (27%)                        │
│ │ 🔢 3DC: 9,500,000 FCFA (13%)                         │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Class-wise Collection Status ───┐                 │
│ │ FORM 1: 85% collected ████████████▓░░                │
│ │ FORM 2: 82% collected ████████████▓░░                │
│ │ FORM 3: 75% collected █████████▓░░░░                 │
│ │ FORM 4: 70% collected ████████▓░░░░░                 │
│ │ FORM 5: 68% collected ████████▓░░░░░                 │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **API Integration:**
```http
GET /api/v1/bursar/financial-overview
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&includeBreakdown=true

Success Response (200):
{
  "success": true,
  "data": {
    "financialSummary": {
      "totalExpected": 95500000,
      "totalCollected": 75200000,
      "collectionRate": 78.7,
      "thisMonthCollection": 12500000,
      "outstanding": 20300000,
      "currency": "FCFA"
    },
    "paymentMethodBreakdown": [
      {
        "method": "EXPRESS_UNION",
        "amount": 45200000,
        "percentage": 60,
        "transactionCount": 892
      },
      {
        "method": "CCA", 
        "amount": 20500000,
        "percentage": 27,
        "transactionCount": 405
      },
      {
        "method": "3DC",
        "amount": 9500000,
        "percentage": 13,
        "transactionCount": 187
      }
    ],
    "classWiseCollection": [
      {
        "className": "FORM 1",
        "expected": 18000000,
        "collected": 15300000,
        "collectionRate": 85,
        "outstanding": 2700000
      },
      {
        "className": "FORM 2",
        "expected": 19200000,
        "collected": 15744000,
        "collectionRate": 82,
        "outstanding": 3456000
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "collected": 8500000,
        "target": 10000000
      }
    ]
  }
}

GET /api/v1/bursar/reports/financial-performance
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&period=monthly&format=JSON

Success Response (200):
{
  "success": true,
  "data": {
    "reportMetadata": {
      "reportId": "FIN_2024_01",
      "period": "monthly",
      "academicYear": "2024-2025",
      "generatedAt": "2024-01-22T10:00:00Z"
    },
    "performanceMetrics": {
      "totalRevenue": 75200000,
      "collectionEfficiency": 78.7,
      "paymentMethodDiversity": 3,
      "averageTransactionSize": 84375,
      "onTimePaymentRate": 65.3
    },
    "alerts": [
      {
        "type": "LOW_COLLECTION",
        "message": "FORM 5 collection rate below 70%",
        "severity": "MEDIUM"
      }
    ]
  }
}
```

---

## 5. Academic Management (`/super-manager/academics`)

### **Academic Overview**
```
┌─────────────────────────────────────────────────────────┐
│ Academic Management                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Current Exam Sequences ───┐                       │
│ │ 📝 Sequence 1 (Sept - Nov 2024)                      │
│ │    Status: ACTIVE | Progress: 75%                    │
│ │    [View Details] [Generate Reports]                 │
│ │                                                       │
│ │ 📝 Sequence 2 (Dec 2024 - Feb 2025)                  │
│ │    Status: PLANNED | Progress: 0%                    │
│ │    [Configure] [Set Dates]                           │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Marks Entry Status ───┐                           │
│ │ ✅ Mathematics: 100% complete                         │
│ │ ✅ English: 100% complete                            │
│ │ ⏳ Physics: 85% complete                             │
│ │ ⏳ Chemistry: 70% complete                           │
│ │ ❌ History: 45% complete                             │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **API Integration:**
```http
GET /api/v1/exam-sequences
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&status=ACTIVE

Success Response (200):
{
  "success": true,
  "data": {
    "examSequences": [
      {
        "id": 1,
        "name": "Sequence 1",
        "academicYearId": 1,
        "startDate": "2024-09-01",
        "endDate": "2024-11-30",
        "status": "ACTIVE",
        "progress": 75,
        "totalSubjects": 12,
        "completedSubjects": 9,
        "marksEntryDeadline": "2024-12-05"
      },
      {
        "id": 2,
        "name": "Sequence 2", 
        "academicYearId": 1,
        "startDate": "2024-12-01",
        "endDate": "2025-02-28",
        "status": "PLANNED",
        "progress": 0,
        "totalSubjects": 12,
        "completedSubjects": 0
      }
    ],
    "summary": {
      "activeSequences": 1,
      "plannedSequences": 1,
      "completedSequences": 0,
      "overallProgress": 37.5
    }
  }
}

GET /api/v1/marks/entry-status
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&sequenceId=1

Success Response (200):
{
  "success": true,
  "data": {
    "sequenceInfo": {
      "sequenceId": 1,
      "name": "Sequence 1",
      "academicYear": "2024-2025"
    },
    "marksEntryStatus": [
      {
        "subjectId": 1,
        "subjectName": "Mathematics",
        "totalClasses": 6,
        "completedClasses": 6,
        "completionRate": 100,
        "status": "COMPLETED",
        "deadline": "2024-12-05",
        "marksEntered": 245,
        "totalStudents": 245
      },
      {
        "subjectId": 2,
        "subjectName": "English",
        "totalClasses": 6,
        "completedClasses": 6,
        "completionRate": 100,
        "status": "COMPLETED",
        "marksEntered": 245,
        "totalStudents": 245
      },
      {
        "subjectId": 3,
        "subjectName": "Physics",
        "totalClasses": 6,
        "completedClasses": 5,
        "completionRate": 85,
        "status": "IN_PROGRESS",
        "marksEntered": 208,
        "totalStudents": 245
      },
      {
        "subjectId": 4,
        "subjectName": "History", 
        "totalClasses": 6,
        "completedClasses": 3,
        "completionRate": 45,
        "status": "DELAYED",
        "marksEntered": 110,
        "totalStudents": 245
      }
    ],
    "overallStats": {
      "totalSubjects": 12,
      "completedSubjects": 6,
      "inProgressSubjects": 4,
      "delayedSubjects": 2,
      "overallCompletionRate": 72.5
    }
  }
}

POST /api/v1/exam-sequences
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Sequence 3",
  "academicYearId": 1,
  "startDate": "2025-03-01",
  "endDate": "2025-05-31",
  "marksEntryDeadline": "2025-06-05",
  "subjects": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "classLevels": [1, 2, 3, 4, 5, 6]
}

Success Response (201):
{
  "success": true,
  "data": {
    "sequenceId": 3,
    "name": "Sequence 3",
    "status": "CREATED",
    "subjectsConfigured": 12,
    "classesIncluded": 6
  }
}
```

---

## 6. Discipline Overview (`/super-manager/discipline`)

### **System-wide Discipline Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│ Discipline Management Overview                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Discipline Statistics ───┐                        │
│ │ 🚨 Active Issues: 23                                 │
│ │ ✅ Resolved This Week: 45                            │
│ │ ⚠️ Students with Multiple Issues: 8                   │
│ │ ⏱️ Average Resolution Time: 3.2 days                 │
│ │ 📊 Overall Behavior Trend: IMPROVING                 │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Issue Types Breakdown ───┐                        │
│ │ ⏰ Morning Lateness: 45%                             │
│ │ 📚 Class Absence: 25%                               │
│ │ 😤 Misconduct: 20%                                  │
│ │ 📱 Phone Usage: 10%                                 │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Repeat Offenders Alert ───┐                       │
│ │ 👤 Student A123 - 5 incidents this month             │
│ │ 👤 Student B456 - 4 incidents this month             │
│ │ 👤 Student C789 - 3 incidents this month             │
│ │ [View All] [Generate Report]                         │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **API Used:**
```http
GET /api/v1/discipline?academicYearId={id}
GET /api/v1/discipline/lateness/statistics
```

---

## 7. Report Card Management (`/super-manager/report-cards`)

### **System-Wide Report Card Administration**

#### **API Integration**

#### **Get System Report Card Overview**
**Endpoint:** `GET /api/v1/super-manager/report-cards/system-overview`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number; // Optional, defaults to current year - super manager can see all
    sequenceId?: number;     // Optional, filter by specific sequence
    includeHistorical?: boolean; // Include data from previous academic years
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      systemSummary: {
        totalAcademicYears: number;
        activeAcademicYears: number;
        totalStudents: number;
        totalReportsGenerated: number;
        overallSuccessRate: number; // Percentage across all years
        systemEfficiency: number;   // Generation speed metrics
        totalStorageUsed: string;   // e.g., "2.3 GB"
      };
      currentAcademicYear: {
        academicYearId: number;
        academicYearName: string;
        totalStudents: number;
        completedReports: number;
        generatingReports: number;
        failedReports: number;
        pendingReports: number;
        successRate: number;
        parentAccessRate: number;
        averageGenerationTime: string;
      };
      sequences: Array<{
        sequenceId: number;
        sequenceName: string;
        status: "OPEN" | "REPORTS_GENERATING" | "REPORTS_AVAILABLE" | "REPORTS_FAILED";
        totalStudents: number;
        completedReports: number;
        failedReports: number;
        generationDate?: string;
        approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
      }>;
      systemHealth: {
        generationQueueStatus: "IDLE" | "PROCESSING" | "OVERLOADED";
        activeJobs: number;
        failureRate: number; // Last 30 days
        averageResponseTime: string;
        storageHealth: "GOOD" | "WARNING" | "CRITICAL";
      };
      crossYearAnalytics: {
        historicalTrends: Array<{
          academicYear: string;
          totalReports: number;
          successRate: number;
          averageGenerationTime: string;
        }>;
        improvementMetrics: {
          successRateImprovement: number; // Percentage improvement
          speedImprovement: number;       // Time reduction percentage
          parentEngagementTrend: "INCREASING" | "DECREASING" | "STABLE";
        };
      };
    };
  }
  ```

#### **Get Template Management**
**Endpoint:** `GET /api/v1/super-manager/report-cards/templates`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      activeTemplates: Array<{
        id: number;
        name: string;
        version: string;
        isDefault: boolean;
        academicYears: string[];
        lastModified: string;
        modifiedBy: string;
        status: "ACTIVE" | "DRAFT" | "DEPRECATED";
      }>;
      templateHistory: Array<{
        templateId: number;
        version: string;
        changeDescription: string;
        modifiedAt: string;
        modifiedBy: string;
      }>;
    };
  }
  ```

#### **Approve Report Release**
**Endpoint:** `POST /api/v1/super-manager/report-cards/approve-release`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```typescript
  {
    sequenceId: number;
    academicYearId: number;
    approvalStatus: "APPROVED" | "REJECTED";
    approvalNotes?: string;
    releaseToParents: boolean;
    notificationSettings: {
      notifyParents: boolean;
      notifyTeachers: boolean;
      notifyPrincipal: boolean;
    };
  }
  ```

#### **System Maintenance Operations**
**Endpoint:** `POST /api/v1/super-manager/report-cards/maintenance`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```typescript
  {
    operation: "CLEANUP_FAILED" | "REBUILD_QUEUE" | "OPTIMIZE_STORAGE" | "REFRESH_CACHE";
    parameters?: {
      academicYearId?: number;
      sequenceId?: number;
      retentionDays?: number; // For cleanup operations
    };
  }
  ```

### **System Administration Dashboard**
```
┌─── Report Card System Administration ───┐
│ [System Overview] [Templates] [Approval Queue] [Maintenance] [Analytics] │
│                                                                           │
│ ┌─── System Health & Performance ───┐                                    │
│ │ 🏫 Academic Years: 3 | Active: 1                                       │
│ │ 👨‍🎓 Total Students: 1,245 | All Years: 3,670                           │
│ │ 📄 Reports Generated: 1,156/1,245 (93%) Current Year                   │
│ │ 📊 Overall Success Rate: 96.2% (All Time)                              │
│ │ ⚡ System Efficiency: 98.5% | Avg Generation: 2.1 min                  │
│ │ 💾 Storage Used: 2.3 GB / 50 GB Available                              │
│ │                                                                         │
│ │ Generation Queue: 🟢 IDLE (0 jobs) | Health: 🟢 EXCELLENT              │
│ │ [System Diagnostics] [Performance Report] [Storage Management]          │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Current Academic Year (2024-2025) ───┐                              │
│ │ Status: 📊 Sequence 3 Reports Available                                │
│ │ ✅ Completed: 1,156 (93%) | ⏳ Generating: 67 (5%)                     │
│ │ ❌ Failed: 22 (2%) | ⏸️ Pending: 0 (0%)                                │
│ │ 👨‍👩‍👧‍👦 Parent Access: 902/1,156 (78%) reports downloaded                │
│ │                                                                         │
│ │ Approval Status: ⏳ Pending Review                                       │
│ │ [📋 Review for Approval] [📧 Notify Stakeholders] [📊 Detailed View]   │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Sequence Approval Queue ───┐                                        │
│ │ Sequence 3 (January 2025): ⏳ Awaiting Final Approval                  │
│ │ │ • Generation: ✅ 93% Complete                                         │
│ │ │ • Quality Check: ✅ Passed                                            │
│ │ │ • Principal Review: ✅ Approved                                       │
│ │ │ • Parent Notification: ⏸️ Pending Super Manager Approval             │
│ │ │ [✅ Approve & Release] [❌ Reject] [📝 Add Notes] [🔍 Quality Review] │
│ │                                                                         │
│ │ Sequence 2 (November 2024): ✅ Approved & Released                     │
│ │ │ • Released: Nov 25, 2024 | Parent Access: 89%                       │
│ │ │ [📊 View Analytics] [📋 Download Summary]                             │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Template Management ───┐                                            │
│ │ Active Templates: 3 | Draft Templates: 1                               │
│ │                                                                         │
│ │ 📄 Standard Report Template v2.1 (Default)                             │
│ │ │ Used by: All classes | Last Modified: Jan 15, 2025                   │
│ │ │ Status: ✅ Active | Academic Years: 2024-2025, 2023-2024             │
│ │ │ [📝 Edit] [📋 Clone] [📊 Usage Stats] [🔒 Version History]            │
│ │                                                                         │
│ │ 📄 Enhanced Analytics Template v1.0                                     │
│ │ │ Used by: Form 4-5 only | Status: ✅ Active                            │
│ │ │ Features: Advanced charts, comparative analysis                       │
│ │ │ [📝 Edit] [📋 Apply to All] [🎯 Target Classes]                       │
│ │                                                                         │
│ │ 📄 New Template v3.0 (Draft)                                           │
│ │ │ Status: 🔶 Draft | Created: Jan 20, 2025                             │
│ │ │ Changes: New layout, improved mobile support                          │
│ │ │ [📝 Continue Editing] [🧪 Test Generate] [✅ Publish]                 │
│ │                                                                         │
│ │ [➕ Create New Template] [📥 Import Template] [📤 Export All]           │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── System Maintenance & Operations ───┐                                │
│ │ Last Maintenance: Jan 20, 2025 | Next Scheduled: Feb 1, 2025          │
│ │                                                                         │
│ │ Quick Maintenance Actions:                                              │
│ │ [🧹 Cleanup Failed Reports] [🔄 Rebuild Generation Queue]              │
│ │ [🗜️ Optimize Storage] [🔄 Refresh System Cache]                        │
│ │ [📊 Run System Diagnostics] [📈 Generate Health Report]                │
│ │                                                                         │
│ │ Storage Management:                                                     │
│ │ • Current Year Reports: 1.2 GB                                         │
│ │ • Archived Reports: 1.1 GB                                             │
│ │ • Templates & Assets: 50 MB                                            │
│ │ • System Backups: 200 MB                                               │
│ │ [📁 Archive Old Reports] [🗑️ Cleanup Temporary Files]                  │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Cross-Year Analytics ───┐                                           │
│ │ Historical Performance Trends (Last 3 Academic Years)                  │
│ │                                                                         │
│ │ 📈 Success Rate Trend: 94.1% → 95.7% → 96.2% (Improving)              │
│ │ ⚡ Speed Improvement: 3.2min → 2.7min → 2.1min (35% faster)            │
│ │ 👨‍👩‍👧‍👦 Parent Engagement: 71% → 75% → 78% (Increasing)                  │
│ │ 💾 Storage Efficiency: 85% → 91% → 94% (Better compression)            │
│ │                                                                         │
│ │ Predictive Analytics:                                                   │
│ │ • Next Sequence ETA: Feb 15-20, 2025                                   │
│ │ • Expected Success Rate: 96.5%                                         │
│ │ • Storage Projection: 3.1 GB by year end                               │
│ │                                                                         │
│ │ [📊 Detailed Analytics] [📈 Trend Analysis] [🔮 Predictive Models]     │
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### **Template Management Interface**
When clicking "Template Management":
```
┌─── Report Card Template Management ───┐
│ [Active] [Draft] [Deprecated] [Create New] [Import/Export]               │
│                                                                           │
│ ┌─── Template Editor ───┐                                                │
│ │ Template Name: [Standard Report Template v2.1]                         │
│ │ Version: [2.1] Status: [Active ▼] [Draft/Active/Deprecated]           │
│ │                                                                         │
│ │ ┌─── Layout Configuration ───┐                                         │
│ │ │ Page Size: [A4 ▼] Orientation: [Portrait ●] [Landscape ○]           │
│ │ │ Header Style: [School Logo & Info ▼]                                 │
│ │ │ Footer Style: [Principal Signature ▼]                                │
│ │ │ Color Scheme: [Blue Professional ▼]                                  │
│ │ └─────────────────────────────────────────────────────────────────────┘│
│ │                                                                         │
│ │ ┌─── Content Sections ───┐                                             │
│ │ │ [☑️] Student Information Header                                        │
│ │ │ [☑️] Academic Performance Table                                        │
│ │ │ [☑️] Subject-wise Analysis                                             │
│ │ │ [☑️] Attendance Summary                                                │
│ │ │ [☑️] Behavioral Comments                                               │
│ │ │ [☑️] Class Position & Rankings                                         │
│ │ │ [☑️] Teacher Remarks Section                                           │
│ │ │ [☑️] Principal's Comments                                              │
│ │ │ [☐] Parent Feedback Section (Optional)                                │
│ │ │ [☑️] Next Term Guidelines                                              │
│ │ └─────────────────────────────────────────────────────────────────────┘│
│ │                                                                         │
│ │ ┌─── Advanced Features ───┐                                            │
│ │ │ [☑️] QR Code for Digital Verification                                  │
│ │ │ [☑️] Watermark Security                                                │
│ │ │ [☑️] Mobile-Responsive View                                            │
│ │ │ [☑️] Multi-language Support                                            │
│ │ │ [☐] Interactive Charts (Beta)                                         │
│ │ │ [☐] Parent Portal Integration                                          │
│ │ └─────────────────────────────────────────────────────────────────────┘│
│ │                                                                         │
│ │ Academic Year Scope: [☑️] 2024-2025 [☑️] 2025-2026 [☐] All Years      │
│ │ Class Scope: [☑️] All Classes [☐] Specific Classes                     │
│ │                                                                         │
│ │ [🧪 Test Generate] [👁️ Preview] [💾 Save Draft] [✅ Publish Template]  │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Template Usage Statistics ───┐                                      │
│ │ Reports Generated: 15,670 (All Time)                                   │
│ │ Success Rate: 97.8%                                                     │
│ │ Average Generation Time: 2.1 minutes                                   │
│ │ Parent Satisfaction: 4.6/5.0 (Based on feedback)                      │
│ │ [📊 Detailed Stats] [📋 Usage Report] [🔍 Error Analysis]              │
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### **Approval Workflow Interface**
When clicking "Sequence Approval":
```
┌─── Report Card Approval Workflow ───┐
│ Sequence 3 (January 2025) - Approval Review                              │
│                                                                           │
│ ┌─── Generation Summary ───┐                                             │
│ │ Total Students: 1,245                                                   │
│ │ ✅ Successfully Generated: 1,156 reports (92.8%)                       │
│ │ ❌ Failed Generation: 22 reports (1.8%)                                │
│ │ ⏳ Currently Generating: 67 reports (5.4%)                             │
│ │                                                                         │
│ │ Quality Metrics:                                                        │
│ │ • Data Completeness: 98.9%                                             │
│ │ • Template Compliance: 100%                                            │
│ │ • PDF Integrity: 99.7%                                                 │
│ │ • Performance Standards: ✅ Met                                         │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Approval Checklist ───┐                                             │
│ │ ✅ Academic Data Verification (Completed: Jan 22, 2025)                │
│ │ ✅ Quality Assurance Review (Completed: Jan 23, 2025)                  │
│ │ ✅ Principal Approval (Approved: Jan 24, 2025)                         │
│ │ ✅ Template Compliance Check (Passed: Jan 24, 2025)                    │
│ │ ⏳ Super Manager Final Approval (Pending)                               │
│ │ ⏸️ Parent Notification (Awaiting Approval)                             │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Review Comments ───┐                                                │
│ │ Principal (Jan 24, 2025): "Sequence 3 reports look excellent.          │
│ │ Academic performance data is accurate and complete. Recommend           │
│ │ immediate release to parents."                                          │
│ │                                                                         │
│ │ Quality Assurance (Jan 23, 2025): "All quality checks passed.          │
│ │ Template rendering is consistent across all reports. No data            │
│ │ anomalies detected."                                                    │
│ │                                                                         │
│ │ Super Manager Notes: [Text Area for approval notes]                    │
│ └───────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│ ┌─── Approval Actions ───┐                                               │
│ │ Release Settings:                                                       │
│ │ [☑️] Notify Parents via Email                                           │
│ │ [☑️] Notify Parents via SMS                                             │
│ │ [☑️] Notify Class Masters                                               │
│ │ [☑️] Notify Principal                                                   │
│ │ [☐] Schedule Release (Date/Time Picker)                                │
│ │                                                                         │
│ │ Approval Decision:                                                      │
│ │ [✅ Approve & Release Immediately] [⏰ Approve & Schedule Release]       │
│ │ [❌ Reject (Specify Reasons)] [⏸️ Request Additional Review]           │
│ │                                                                         │
│ │ [📧 Send Notifications] [📋 Generate Approval Report] [🔙 Back]         │
│ └───────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Reports & Analytics (`/super-manager/reports`)

### **Comprehensive Reports Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│ System Reports & Analytics                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Academic Reports ───┐   ┌─── Financial Reports ───┐│
│ │ 📊 Student Performance   │   │ 💰 Fee Collection       │
│ │ 📈 Class Analytics       │   │ 📋 Payment History      │
│ │ 📝 Exam Statistics       │   │ 📊 Revenue Analysis     │
│ │ 🎯 Subject Analysis      │   │ 💳 Payment Methods      │
│ └─────────────────────────┘   └─────────────────────────┘│
│                                                         │
│ ┌─── Operational Reports ───┐  ┌─── System Reports ───┐ │
│ │ 👥 Staff Performance     │   │ 🔐 User Activity       │
│ │ 📅 Attendance Summary    │   │ 🔧 System Logs         │
│ │ 🚨 Discipline Summary    │   │ 📊 Usage Statistics    │
│ │ 🏫 Enrollment Trends     │   │ ⚡ Performance Metrics │
│ └─────────────────────────┘   └─────────────────────────┘│
│                                                         │
│ ┌─── Custom Report Builder ───┐                        │
│ │ Select Data: [Dropdown] Time Range: [Picker]         │
│ │ Filters: [Multi-select] Format: [PDF/Excel]          │
│ │ [Generate Report] [Schedule Report]                   │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 8. System Settings (`/super-manager/settings`)

### **System Configuration**
```
┌─────────────────────────────────────────────────────────┐
│ System Settings & Configuration                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── General Settings ───┐                             │
│ │ 🏫 School Name: [Input Field]                        │
│ │ 📧 Admin Email: [Input Field]                        │
│ │ 📱 School Phone: [Input Field]                       │
│ │ 🌍 School Address: [Textarea]                        │
│ │ 🖼️ School Logo: [Upload]                             │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Academic Settings ───┐                            │
│ │ 📅 Academic Calendar Setup                           │
│ │ 📊 Grading System Configuration                      │
│ │ 💰 Fee Structure Templates                           │
│ │ 📝 Exam Sequence Settings                            │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Security Settings ───┐                            │
│ │ 🔐 Password Policy                                   │
│ │ 🕒 Session Timeout: [30 minutes ▼]                  │
│ │ 🔒 Two-Factor Authentication                         │
│ │ 📋 Audit Log Retention                               │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 9. System Maintenance (`/super-manager/maintenance`)

### **System Maintenance Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│ System Maintenance & Health                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── System Health ───┐                                │
│ │ 🟢 Database: Healthy                                 │
│ │ 🟢 Server: Running (99.8% uptime)                    │
│ │ 🟢 Storage: 45GB used / 500GB available              │
│ │ 🟡 Memory: 78% usage                                 │
│ │ 🟢 Backup: Last successful 2 hours ago               │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Maintenance Actions ───┐                          │
│ │ [🔄 Force Database Backup]                           │
│ │ [🧹 Clean Temporary Files]                           │
│ │ [📊 Generate System Report]                          │
│ │ [⚡ Optimize Database]                               │
│ │ [🔧 Run Diagnostics]                                │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Scheduled Tasks ───┐                              │
│ │ ✅ Daily backup: Last run 02:00 AM                   │
│ │ ✅ User session cleanup: Running                     │
│ │ ⏳ Weekly report generation: Due in 2 days           │
│ │ ⏳ Database optimization: Scheduled for Sunday       │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Key Super Manager Features Summary

### **Complete System Access:**
- All role functionality access
- Override capabilities for all operations
- System-wide reporting and analytics

### **User & Role Management:**
- Create/edit/delete any user
- Assign/remove any role
- Manage role permissions

### **Academic Administration:**
- Academic year lifecycle management
- System-wide academic oversight
- Exam and assessment configuration

### **Financial Administration:**
- Complete fee management oversight
- Financial reporting and analysis
- Payment method configuration

### **System Administration:**
- System configuration and settings
- Maintenance and health monitoring
- Security and backup management

### **Override Capabilities:**
- Emergency student assignment
- Financial dispute resolution
- System-wide data correction
- Academic intervention powers

The SUPER_MANAGER role represents the highest level of system access with comprehensive administrative capabilities across all aspects of the School Management System.

Perfect! We've now completed the comprehensive user workflow and UX design for all roles in the School Management System. Here's a summary of what we've covered:

## Complete Role Workflow Summary

### **Login Flow (Universal)**
1. **Login Page** - Email/Matricule + Password
2. **Role Selection** - If user has multiple roles
3. **Academic Year Selection** - Except for SUPER_MANAGER
4. **Role-specific Dashboard** - Customized for each role

### **Roles Completed:**

1. **🔐 SUPER_MANAGER** - Complete system administration
   - Academic year management, user management, financial oversight
   - System settings, maintenance, reports & analytics
   - Override capabilities for all operations

2. **👨‍💼 PRINCIPAL** - School-wide strategic oversight
   - Academic performance monitoring, staff supervision
   - Strategic planning, school-wide reporting

3. **👩‍💼 VICE_PRINCIPAL** - Student affairs & enrollment
   - Interview management, subclass assignment
   - Student registration workflow, enrollment oversight

4. **💰 BURSAR** - Financial management & registration
   - Fee collection, payment recording, parent creation
   - Student registration with automatic parent account creation
   - Financial reporting and debt management

5. **🚨 DISCIPLINE_MASTER** - Student discipline & behavior
   - Morning lateness tracking, discipline issue management
   - Behavioral analytics, attendance monitoring

6. **👨‍🏫 TEACHER** - Subject teaching & student management
   - My classes, marks entry, student progress tracking
   - Quiz creation, attendance taking

7. **📚 HOD** - Teacher + Department management
   - All teacher functionality + department oversight
   - Teacher performance monitoring, subject coordination

8. **👨‍👩‍👧‍👦 PARENT** - Child monitoring & communication
   - Child performance tracking, fee management
   - Communication with school staff, report access

9. **🎯 GUIDANCE_COUNSELOR** - Student support (limited endpoints)
   - Student academic monitoring, basic communication

10. **⚙️ MANAGER** - General administration (limited specific functionality)
    - Basic administrative oversight, user management support

## Key Design Principles Applied:

### **🎯 MVP Focus**
- Only included features supported by current API
- No over-engineering or unnecessary complexity
- Focused on core school management needs

### **🔄 Consistent UX Patterns**
- Unified navigation structure across roles
- Consistent card-based layouts
- Standardized action buttons and states

### **📱 Progressive Disclosure**
- Dashboard overview → Detailed pages → Actions
- Important information first, details on demand
- Clear navigation hierarchies

### **🔐 Role-Based Access**
- Each role sees only relevant functionality
- Appropriate permission levels maintained
- Clear role identification in UI

### **💱 FCFA Currency**
- All financial displays use FCFA as requested
- Appropriate formatting for local context
