# MANAGER Role - Complete Workflow & UX Design

*Note: Based on the current API documentation, the MANAGER role appears to have access to general administrative endpoints but lacks specific manager-focused functionality. This workflow leverages available general endpoints that a school manager would logically need.*

## Post-Login Manager Dashboard (`/manager/dashboard`)

#### **API Integration:**
```http
GET /api/v1/manager/dashboard
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1  // Optional, defaults to current year

Success Response (200):
{
  "success": true,
  "data": {
    "overview": {
      "totalStaff": 52,
      "totalClasses": 24,
      "totalStudents": 1245,
      "systemHealth": 98,
      "pendingTasks": 8,
      "issuesRequiring": 3,
      "operationalEfficiency": 94,
      "monthlyGoalsProgress": { "completed": 7, "total": 10 }
    },
    "departmentStatus": [
      {
        "name": "Academic",
        "status": "OPERATIONAL",
        "statusIcon": "✅"
      },
      {
        "name": "Discipline", 
        "status": "ISSUES",
        "statusIcon": "⚠️",
        "issueCount": 3
      }
    ],
    "recentActivities": [
      {
        "action": "User account created for new teacher",
        "timestamp": "2024-01-22T10:30:00Z",
        "type": "USER_MANAGEMENT"
      }
    ],
    "criticalAlerts": [
      {
        "priority": "HIGH",
        "message": "5 students awaiting VP assignment",
        "type": "ACADEMIC"
      }
    ]
  }
}
```

### **Main Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ [🏠] School Management System    [🔔] [👤] [⚙️] [🚪]    │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [Manager Name] | Academic Year: 2024-2025 │
│ School Manager - Administrative Operations & Support    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── School Operations Overview ───┐                    │
│ │ 👥 Total Staff: 52              🏫 Total Classes: 24   │
│ │ 👨‍🎓 Total Students: 1,245        📊 System Health: 98%  │
│ │ 📋 Pending Tasks: 8             ⚠️ Issues Requiring: 3 │
│ │ 📈 Operational Efficiency: 94%   🎯 Monthly Goals: 7/10│
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Department Status ───┐       ┌─── Recent Activities ───┐│
│ │ Academic: ✅ Operational       │ │ • User account created    ││
│ │ Finance: ✅ On Track          │ │   for new teacher         ││
│ │ Discipline: ⚠️ 3 High Issues  │ │ • System backup completed ││
│ │ Enrollment: ✅ 98% Complete   │ │ • Monthly report generated││
│ │ IT Systems: ✅ Stable         │ │ • Staff meeting scheduled ││
│ │ [Detailed View]               │ │ [View All Activities]     ││
│ └─────────────────────────────── │ └─────────────────────────┘│
│                                                         │
│ ┌─── Administrative Tasks ───┐                          │
│ │ 🚨 High Priority (3)                                  │
│ │ • Review staff leave requests (5 pending)            │
│ │ • System maintenance scheduled for weekend            │
│ │ • Parent complaint requires follow-up                │
│ │                                                       │
│ │ ⚠️ Medium Priority (5)                                │
│ │ • Update school calendar for next term               │
│ │ • Prepare monthly operations report                  │
│ │ • Coordinate with vendors for supplies               │
│ │ • Review and approve new user accounts               │
│ │ • Schedule staff training sessions                   │
│ │ [View All Tasks] [Assign Tasks] [Mark Complete]      │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## User Management (`/manager/users`)

#### **API Integration:**
```http
GET /api/v1/users
Authorization: Bearer {token}

Query Parameters:
?role=TEACHER&status=ACTIVE&page=1&limit=10&search=john

Success Response (200):
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@school.com",
        "roles": ["TEACHER", "HOD"],
        "status": "ACTIVE",
        "lastLogin": "2024-01-22T08:00:00Z",
        "department": "Mathematics",
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 298,
      "totalPages": 30
    },
    "summary": {
      "totalUsers": 298,
      "activeUsers": 285,
      "inactiveUsers": 13,
      "staffCount": 52,
      "parentCount": 201,
      "studentCount": 45,
      "newThisMonth": 12,
      "passwordResets": 8,
      "loginIssues": 3
    }
  }
}

POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "New Teacher",
  "email": "teacher@school.com",
  "phone": "+237123456789",
  "gender": "MALE",
  "dateOfBirth": "1990-05-15",
  "address": "123 Main St",
  "idCardNumber": "123456789",
  "profilePhoto": "base64_encoded_image_data",
  "roles": [
    {
      "role": "TEACHER",
      "academicYearId": 1
    }
  ],
  "autoGeneratePassword": true,
  "sendCredentials": {
    "email": true,
    "sms": true
  }
}
```

### **User Administration Dashboard**
```
┌─── User Management & Administration ───┐
│ [All Users] [Create User] [Role Management] [Permissions] │
│                                                           │
│ ┌─── User Overview ───┐                                   │
│ │ Total Users: 298                                       │
│ │ Active: 285 | Inactive: 13                            │
│ │ Staff: 52 | Parents: 201 | Students: 45              │
│ │ New This Month: 12 | Password Resets: 8               │
│ │ Last Login Issues: 3                                   │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─── Quick Filters ───┐                                   │
│ │ Role: [All ▼] [Staff] [Parents] [Students]             │
│ │ Status: [All ▼] [Active] [Inactive] [New]             │
│ │ Department: [All ▼] [Academic] [Admin] [Support]       │
│ │ Issues: [All ▼] [Login Problems] [Permission Issues]   │
│ │ [Apply] [Clear] [Export] [Bulk Actions]               │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─── Recent User Activities ───┐                          │
│ │ Name            Role          Action        Date        │
│ │ Mrs. Johnson    Teacher       Created       Jan 22     │
│ │ Mr. Smith       Parent        Password Reset Jan 21    │
│ │ Dr. Williams    HOD           Role Updated  Jan 20     │
│ │ Ms. Davis       Bursar        Login Issue   Jan 19     │
│ │ Mr. Brown       Teacher       Deactivated   Jan 18     │
│ │                                                        │
│ │ [View All] [User Details] [Quick Actions]              │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─── Pending Actions ───┐                                 │
│ │ New Account Requests: 5                                │
│ │ Role Change Requests: 3                                │
│ │ Access Issues: 2                                       │
│ │ Deactivation Requests: 1                               │
│ │ [Review Requests] [Bulk Approve] [Handle Issues]       │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Create New User** (`/manager/users/create`)
```
┌─── Create New User Account ───┐
│ ┌─── Basic Information ───┐    │
│ │ Full Name: [Text Input]     │ │
│ │ Email: [Text Input]         │ │
│ │ Phone: [Text Input]         │ │
│ │ Date of Birth: [Date Picker]│ │
│ │ Gender: [Male ●] [Female ○] │ │
│ │ Address: [Text Area]        │ │
│ │ ID Card Number: [Text Input]│ │
│ │ Photo: [File Upload]        │ │
│ └───────────────────────────┘ │
│                               │
│ ┌─── Account Settings ───┐     │
│ │ Auto-generate Password:     │ │
│ │ [Yes ●] [No ○]             │ │
│ │                            │ │
│ │ Password: [TEMP123456]      │ │
│ │ (Auto-generated)            │ │
│ │                            │ │
│ │ Account Status:             │ │
│ │ [Active ●] [Inactive ○]     │ │
│ │                            │ │
│ │ Send Credentials:           │ │
│ │ [☑️] Email  [☑️] SMS        │ │
│ └───────────────────────────┘ │
│                               │
│ ┌─── Role Assignment ───┐      │
│ │ Primary Role: [Teacher ▼]   │ │
│ │ • Teacher     • Parent      │ │
│ │ • HOD         • Bursar      │ │
│ │ • VP          • SDM         │ │
│ │ • Counselor   • Manager     │ │
│ │                            │ │
│ │ Academic Year: [2024-2025 ▼]│ │
│ │ (For year-specific roles)   │ │
│ │                            │ │
│ │ Additional Roles:           │ │
│ │ [☐] Class Master           │ │
│ │ [☐] Department HOD          │ │
│ │ [☐] Committee Member        │ │
│ └───────────────────────────┘ │
│                               │
│ ┌─── Department Assignment ───┐ │
│ │ (For Staff Only)            │ │
│ │ Department: [Mathematics ▼] │ │
│ │ Position: [Teacher ▼]       │ │
│ │ Reporting To: [Dr. Smith ▼] │ │
│ │ Start Date: [Date Picker]   │ │
│ └───────────────────────────┘ │
│                               │
│ [Create Account] [Save Draft] [Cancel] │
└─────────────────────────────────┘
```

## System Administration (`/manager/system`)

#### **API Integration:**
```http
GET /api/v1/manager/system/health
Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "data": {
    "systemHealth": {
      "overallHealth": 98,
      "databaseStatus": "OPERATIONAL",
      "apiResponseTime": 245,
      "serverLoad": 23,
      "storageUsed": 67,
      "activeSessions": 45,
      "lastBackup": "2024-01-22T03:00:00Z"
    },
    "recentActivities": [
      {
        "type": "BACKUP",
        "message": "Database backup completed successfully",
        "timestamp": "2024-01-22T03:00:00Z"
      },
      {
        "type": "USER_MANAGEMENT", 
        "message": "12 new user accounts created this week",
        "timestamp": "2024-01-21T00:00:00Z"
      }
    ],
    "dataStats": {
      "totalStudents": 1245,
      "totalUsers": 298,
      "academicData": 15670,
      "financialRecords": 3456,
      "dataIntegrity": 99.8,
      "lastValidation": "2024-01-21T00:00:00Z"
    },
    "maintenanceInfo": {
      "nextScheduled": "2024-01-28T00:00:00Z",
      "estimatedDowntime": "2 hours",
      "type": "Database optimization & security updates"
    }
  }
}

GET /api/v1/manager/staff-management
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&departmentId=1&startDate=2024-02-01&endDate=2024-02-29

Success Response (200):
{
  "success": true,
  "data": {
    "attendanceOverview": {
      "totalStaff": 52,
      "presentToday": 48,
      "onLeave": 3,
      "sickLeave": 1,
      "attendanceRate": 92.3
    },
    "departmentBreakdown": [
      {
        "departmentId": 1,
        "name": "Mathematics",
        "totalStaff": 8,
        "present": 7,
        "attendanceRate": 87.5
      }
    ]
  }
}
```

### **System Administration Dashboard**
```
┌─── System Administration ───┐
│ [User Management] [Data Management] [System Health] [Settings] │
│                                                                │
│ ⚠️ Note: Limited system admin features in current API         │
│ Advanced system management requires additional development     │
│                                                                │
│ ┌─── System Health Status ───┐                                │
│ │ Overall Health: 98% ✅                                      │
│ │ Database Status: Operational ✅                             │
│ │ API Response Time: 245ms ✅                                 │
│ │ Server Load: 23% ✅                                         │
│ │ Storage Used: 67% ⚠️                                        │
│ │ Active Sessions: 45 users ✅                                │
│ │ Last Backup: Jan 22, 03:00 AM ✅                           │
│ │ [Detailed Diagnostics] [Performance Report] [Alerts]       │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌─── Recent System Activities ───┐                             │
│ │ • Database backup completed successfully                     │
│ │ • 12 new user accounts created this week                    │
│ │ • System maintenance performed (Jan 20)                     │
│ │ • 3 user permission issues resolved                         │
│ │ • Academic year data migration completed                    │
│ │ [View Full Log] [Export Activities] [System Alerts]         │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌─── Data Management ───┐                                      │
│ │ Total Records:                                              │
│ │ • Students: 1,245 records                                   │
│ │ • Users: 298 accounts                                       │
│ │ • Academic Data: 15,670 entries                             │
│ │ • Financial Records: 3,456 transactions                     │
│ │                                                            │
│ │ Data Integrity: 99.8% ✅                                    │
│ │ Last Data Validation: Jan 21, 2024                         │
│ │ [Run Data Check] [Export Backup] [Data Cleanup]            │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌─── System Maintenance ───┐                                   │
│ │ Next Scheduled Maintenance: Jan 28, 2024 (Weekend)          │
│ │ Estimated Downtime: 2 hours                                │
│ │ Maintenance Type: Database optimization & security updates  │
│ │ [Schedule Maintenance] [Notify Users] [Maintenance Log]     │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Reports & Analytics (`/manager/reports`)

#### **API Integration:**
```http
GET /api/v1/manager/reports/operational
Authorization: Bearer {token}

Query Parameters:
?period=monthly&academicYearId=1&startDate=2024-01-01&endDate=2024-01-31

Success Response (200):
{
  "success": true,
  "data": {
    "reportMetadata": {
      "reportId": "OP_2024_01",
      "period": "monthly",
      "generatedAt": "2024-01-22T10:00:00Z",
      "generatedBy": "Manager",
      "status": "COMPLETED"
    },
    "operationalMetrics": {
      "userSatisfaction": 92,
      "systemUptime": 99.7,
      "avgResponseTime": 245,
      "dataAccuracy": 99.8,
      "staffEfficiency": 94,
      "processCompletionRate": 97
    },
    "activitySummary": {
      "newUsersCreated": 12,
      "systemMaintenance": 3,
      "issuesResolved": 15,
      "reportsGenerated": 8
    },
    "downloadUrl": "/api/v1/reports/download/OP_2024_01.pdf",
    "fileSize": "2.1MB",
    "downloadCount": 3
  }
}

GET /api/v1/manager/reports/templates
Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "exec_summary",
        "name": "Executive Summary Template",
        "description": "High-level operational overview",
        "category": "MANAGEMENT",
        "lastModified": "2024-01-15T00:00:00Z"
      },
      {
        "id": "operational_dashboard", 
        "name": "Operational Dashboard Template",
        "description": "Detailed operational metrics",
        "category": "OPERATIONS",
        "lastModified": "2024-01-10T00:00:00Z"
      }
    ]
  }
}

POST /api/v1/manager/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "templateId": "operational_dashboard",
  "period": "weekly",
  "academicYearId": 1,
  "includeMetrics": ["user_activity", "system_performance", "staff_efficiency"],
  "format": "PDF",
  "recipients": ["admin@school.com", "principal@school.com"]
}
```

### **Management Reports Dashboard**
```
┌─── Management Reports & Analytics ───┐
│ [Operational Reports] [User Analytics] [Report Cards] [System Reports] [Custom] │
│                                                                  │
│ ┌─── Quick Report Generation ───┐                                │
│ │ [Daily Operations Summary] [Weekly User Activity]              │
│ │ [Monthly System Performance] [Quarterly Overview]              │
│ │ [Annual Statistics] [Custom Date Range]                        │
│ │ [Department Analysis] [Resource Utilization]                   │
│ │ [Student Report Card Status] [Report Generation Analytics]     │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─── Recent Generated Reports ───┐                               │
│ │ 📊 Weekly Operations Report - January Week 3                   │
│ │ Generated: Jan 22, 2024 | Size: 2.1MB                         │
│ │ Status: Complete ✅ | Downloads: 3                             │
│ │ [View] [Download] [Share] [Schedule Regular]                   │
│ │ ──────────────────────────────────────────────                │
│ │ 📈 Monthly User Activity Analysis - December 2023              │
│ │ Generated: Jan 15, 2024 | Size: 1.8MB                         │
│ │ Status: Complete ✅ | Downloads: 5                             │
│ │ [View] [Download] [Share] [Archive]                            │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─── Key Performance Indicators ───┐                             │
│ │ User Satisfaction: 92%                                         │
│ │ System Uptime: 99.7%                                          │
│ │ Response Time: 245ms avg                                       │
│ │ Data Accuracy: 99.8%                                          │
│ │ Staff Efficiency: 94%                                         │
│ │ Process Completion Rate: 97%                                   │
│ │ [Detailed KPI Dashboard] [Trend Analysis] [Benchmarks]        │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─── Report Templates ───┐                                       │
│ │ 📋 Executive Summary Template                                  │
│ │ 📊 Operational Dashboard Template                              │
│ │ 📈 Performance Analysis Template                               │
│ │ 🎯 Goal Tracking Template                                      │
│ │ 📝 Incident Report Template                                    │
│ │ 📄 Report Card Status Template                                 │
│ │ [Create Template] [Edit Templates] [Import/Export]             │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─── Report Card Management ───┐                                 │
│ │ 📊 Report Card Generation Overview                             │
│ │ Total Students: 1,245 | Current Academic Year: 2024-2025      │
│ │ ──────────────────────────────────────────────────────────── │
│ │ Current Sequence: Sequence 3 (January 2025)                   │
│ │ ✅ Completed: 1,156 reports (93%)                              │
│ │ ⏳ Generating: 67 reports (5%)                                 │
│ │ ❌ Failed: 22 reports (2%)                                     │
│ │ ⏸️ Pending: 0 reports (0%)                                     │
│ │                                                                │
│ │ Generation Success Rate: 95.2% (This Sequence)                │
│ │ Average Generation Time: 2.3 minutes per report               │
│ │ Parent Access Rate: 78% (Reports downloaded)                  │
│ │                                                                │
│ │ [View by Class] [Failed Reports] [Generation Queue]           │
│ │ [Notify Parents] [Download Analytics] [Quality Report]        │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Report Card Management (`/manager/report-cards`)

### **API Integration**

#### **Get Report Card Overview**
**Endpoint:** `GET /api/v1/manager/report-cards/overview`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number; // Optional, defaults to current year
    sequenceId?: number;     // Optional, filter by specific sequence
    classId?: number;        // Optional, filter by class
    status?: "COMPLETED" | "GENERATING" | "FAILED" | "PENDING"; // Optional filter
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      summary: {
        totalStudents: number;
        totalReports: number;
        completedReports: number;
        generatingReports: number;
        failedReports: number;
        pendingReports: number;
        successRate: number; // Percentage
        averageGenerationTime: string; // e.g., "2.3 minutes"
        parentAccessRate: number; // Percentage of reports accessed
      };
      currentSequence: {
        id: number;
        name: string;
        status: "OPEN" | "REPORTS_GENERATING" | "REPORTS_AVAILABLE" | "REPORTS_FAILED";
        startDate: string;
        endDate: string;
        totalClasses: number;
        completedClasses: number;
      };
      classSummary: Array<{
        classId: number;
        className: string;
        subclasses: Array<{
          subclassId: number;
          subclassName: string;
          totalStudents: number;
          completedReports: number;
          generatingReports: number;
          failedReports: number;
          successRate: number;
        }>;
      }>;
      recentActivity: Array<{
        timestamp: string;
        activity: string;
        classId: number;
        className: string;
        status: string;
      }>;
    };
  }
  ```

#### **Get Failed Reports**
**Endpoint:** `GET /api/v1/manager/report-cards/failed`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    sequenceId?: number;
    page?: number;
    limit?: number;
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      failedReports: Array<{
        id: number;
        studentId: number;
        studentName: string;
        studentMatricule: string;
        classId: number;
        className: string;
        subclassId: number;
        subclassName: string;
        sequenceId: number;
        sequenceName: string;
        errorMessage: string;
        failedAt: string;
        attemptCount: number;
        canRetry: boolean;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }
  ```

#### **Retry Failed Reports**
**Endpoint:** `POST /api/v1/manager/report-cards/retry`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```typescript
  {
    reportIds: number[]; // Array of failed report IDs to retry
    sequenceId?: number; // Optional, retry all failed for sequence
    classId?: number;    // Optional, retry all failed for class
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      retriedReports: number;
      jobsQueued: number;
      estimatedCompletion: string;
    };
  }
  ```

#### **Get Parent Access Analytics**
**Endpoint:** `GET /api/v1/manager/report-cards/parent-access`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    sequenceId?: number;
    classId?: number;
    startDate?: string;
    endDate?: string;
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      accessSummary: {
        totalReports: number;
        accessedReports: number;
        accessRate: number; // Percentage
        averageAccessTime: string; // Time from generation to first access
        multipleAccessCount: number; // Reports accessed more than once
      };
      classBreakdown: Array<{
        classId: number;
        className: string;
        totalReports: number;
        accessedReports: number;
        accessRate: number;
      }>;
      accessTrends: Array<{
        date: string;
        accessCount: number;
        downloadCount: number;
      }>;
      unAccessedReports: Array<{
        studentId: number;
        studentName: string;
        parentName: string;
        parentContact: string;
        generatedAt: string;
        daysSinceGeneration: number;
      }>;
    };
  }
  ```

### **Report Card Management Dashboard**
```
┌─── Report Card Management & Analytics ───┐
│ [Overview] [By Class] [Failed Reports] [Parent Access] [Analytics] │
│                                                                     │
│ ┌─── Current Sequence Status ───┐                                   │
│ │ Sequence 3 (January 2025) - Reports Available                    │
│ │ 📊 Progress: ████████████████░░ 93% Complete                      │
│ │                                                                   │
│ │ ✅ Completed: 1,156 reports (93%)                                 │
│ │ ⏳ Generating: 67 reports (5%)                                    │
│ │ ❌ Failed: 22 reports (2%)                                        │
│ │ ⏸️ Pending: 0 reports (0%)                                        │
│ │                                                                   │
│ │ Success Rate: 95.2% | Avg Time: 2.3 min                          │
│ │ Parent Access: 78% downloaded                                     │
│ │ [View Details] [Download Summary] [Send Notifications]            │
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─── Class-by-Class Breakdown ───┐                                  │
│ │ Form 1A: 42/45 completed (93%) ✅                                 │
│ │ Form 1B: 38/41 completed (93%) ✅                                 │
│ │ Form 2A: 35/39 completed (90%) ⚠️ (4 failed)                     │
│ │ Form 2B: 40/43 completed (93%) ✅                                 │
│ │ Form 3A: 36/38 completed (95%) ✅                                 │
│ │ Form 3B: 41/44 completed (93%) ✅                                 │
│ │ Form 4A: 39/42 completed (93%) ✅                                 │
│ │ Form 4B: 37/40 completed (93%) ✅                                 │
│ │ Form 5A: 35/38 completed (92%) ✅                                 │
│ │ Form 5B: 38/41 completed (93%) ✅                                 │
│ │                                                                   │
│ │ Classes with Issues: 1 | Total Issues: 4 failed reports          │
│ │ [View Class Details] [Retry Failed] [Contact Teachers]            │
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─── Failed Reports Management ───┐                                 │
│ │ Total Failed: 22 reports requiring attention                      │
│ │                                                                   │
│ │ Common Failure Reasons:                                           │
│ │ • Missing marks data: 12 reports                                 │
│ │ • PDF generation error: 6 reports                                │
│ │ • Student data incomplete: 3 reports                             │
│ │ • System timeout: 1 report                                       │
│ │                                                                   │
│ │ Auto-retry Status: 15 eligible for retry                         │
│ │ Manual intervention needed: 7 reports                            │
│ │ [Retry All Eligible] [View Details] [Contact Support]            │
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─── Parent Access Analytics ───┐                                   │
│ │ Reports Available: 1,156 | Accessed: 902 (78%)                  │
│ │ Not Yet Accessed: 254 reports (22%)                              │
│ │ Average Access Time: 1.2 days after generation                   │
│ │                                                                   │
│ │ Classes with Low Access Rates:                                   │
│ │ • Form 2A: 65% access rate (needs follow-up)                    │
│ │ • Form 3B: 71% access rate                                      │
│ │                                                                   │
│ │ [Send Reminders] [Export Contact List] [Access Trends]           │
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─── Quick Actions ───┐                                             │
│ │ [📧 Notify Parents] [🔄 Retry Failed Reports]                     │
│ │ [📊 Export Analytics] [📞 Contact Class Masters]                  │
│ │ [⚙️ Report Settings] [📋 Quality Review]                           │
│ └─────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### **Failed Reports Detail View**
When clicking "Failed Reports":
```
┌─── Failed Report Cards - Detailed View ───┐
│ [All Failed] [By Error Type] [By Class] [Retry Options]             │
│                                                                      │
│ Total Failed Reports: 22 | Eligible for Retry: 15                   │
│                                                                      │
│ ┌─── Error Categories ───┐                                           │
│ │ 📊 Missing Marks Data (12 reports)                                │
│ │ Student   Class    Issue                           Action          │
│ │ John Doe  Form 2A  No marks for Mathematics       [Contact HOD]   │
│ │ Mary Jane Form 2A  Missing Chemistry scores       [Contact HOD]   │
│ │ Peter Pan Form 2A  Incomplete Physics marks       [Contact HOD]   │
│ │ [Show All 12] [Bulk Contact] [Mark Resolved]                      │
│ │                                                                    │
│ │ 🖥️ PDF Generation Errors (6 reports)                              │
│ │ Student     Class    Error                         Action          │
│ │ Alice Smith Form 3B  Template rendering failed    [Retry Auto]    │
│ │ Bob Wilson  Form 4A  Font loading error           [Retry Auto]    │
│ │ [Show All 6] [Retry All] [Check System]                           │
│ │                                                                    │
│ │ 👤 Student Data Issues (3 reports)                                │
│ │ Student      Class    Issue                        Action          │
│ │ Chris Brown  Form 5A  Missing profile photo       [Update Data]   │
│ │ Dana White   Form 1B  Incomplete enrollment info  [Contact Admin] │
│ │ [Show All 3] [Data Cleanup] [Bulk Update]                         │
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─── Bulk Actions ───┐                                               │
│ │ [☑️] Select All Eligible (15)                                      │
│ │ [☑️] Select Missing Marks (12)                                     │
│ │ [☐] Select PDF Errors (6)                                         │
│ │ [☐] Select Data Issues (3)                                        │
│ │                                                                    │
│ │ [🔄 Retry Selected] [📧 Notify Teachers] [📋 Export Issues]        │
│ │ [⚙️ System Check] [📞 Technical Support] [📊 Error Trends]         │
│ └──────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

## Communications & Coordination (`/manager/communications`)

#### **API Integration:**
```http
GET /api/v1/messaging/dashboard
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&role=MANAGER

Success Response (200):
{
  "success": true,
  "data": {
    "messagingSummary": {
      "totalSent": 45,
      "totalReceived": 23,
      "pendingReads": 7,
      "unreadMessages": 3
    },
    "recentCommunications": [
      {
        "id": 1,
        "subject": "System maintenance this weekend",
        "recipients": 52,
        "readCount": 45,
        "pendingCount": 7,
        "sentAt": "2024-01-22T09:00:00Z",
        "priority": "HIGH"
      }
    ],
    "recipientGroups": [
      {
        "name": "All Staff",
        "count": 52,
        "roles": ["TEACHER", "HOD", "PRINCIPAL", "VICE_PRINCIPAL"]
      },
      {
        "name": "Department Heads",
        "count": 8,
        "roles": ["HOD"]
      }
    ]
  }
}

POST /api/v1/messaging/send
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "recipients": {
    "roles": ["TEACHER", "HOD"],
    "academicYearId": 1,
    "departments": [1, 2, 3],
    "specificUsers": [15, 23, 45]
  },
  "message": {
    "subject": "Important System Update",
    "content": "Dear Staff, please note the upcoming system maintenance...",
    "priority": "HIGH",
    "type": "ADMINISTRATIVE_NOTICE"
  },
  "delivery": {
    "sendNow": true,
    "scheduledFor": null,
    "requireReadReceipt": true
  },
  "attachments": [
    {
      "filename": "maintenance_schedule.pdf",
      "data": "base64_encoded_file_data"
    }
  ]
}

Success Response (201):
{
  "success": true,
  "data": {
    "messageId": 123,
    "sentTo": 52,
    "deliveryStatus": "SENT",
    "estimatedReadTime": "2024-01-22T15:00:00Z"
  }
}

GET /api/v1/messaging/statistics
Authorization: Bearer {token}

Query Parameters:
?academicYearId=1&startDate=2024-01-01&endDate=2024-01-31

Success Response (200):
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "statistics": {
      "totalMessagesSent": 145,
      "averageReadRate": 87.5,
      "averageResponseTime": "2.3 hours",
      "mostActiveDay": "Monday",
      "peakHour": "09:00"
    },
    "byMessageType": [
      {
        "type": "ADMINISTRATIVE_NOTICE",
        "count": 45,
        "readRate": 92.1
      },
      {
        "type": "MEETING_REMINDER",
        "count": 23,
        "readRate": 95.6
      }
    ]
  }
}
```

### **Communication Center**
```
┌─── Administrative Communications ───┐
│ [Messages] [Announcements] [Staff Coordination] [External] │
│                                                            │
│ ┌─── Internal Communication ───┐                           │
│ │ To: [Select Recipients ▼]                               │
│ │ • All Staff        • Department Heads                   │
│ │ • Senior Management • Administrative Staff              │
│ │ • Teaching Staff   • Support Staff                      │
│ │ • Custom Selection                                      │
│ │                                                        │
│ │ Message Type: [Administrative Notice ▼]                 │
│ │ • Policy Update    • System Maintenance                │
│ │ • Meeting Notice   • Deadline Reminder                 │
│ │ • Training Alert   • Emergency Notice                  │
│ │                                                        │
│ │ Subject: [Text Input]                                  │
│ │ Priority: [Normal ▼] [High] [Urgent]                   │
│ │ Message: [Rich Text Editor]                            │
│ │                                                        │
│ │ Schedule Send: [Now ●] [Later ○]                       │
│ │ Date/Time: [Date/Time Picker]                          │
│ │                                                        │
│ │ [Send Message] [Save Draft] [Preview] [Template]       │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─── Recent Communications ───┐                            │
│ │ Jan 22 - All Staff: System maintenance this weekend     │
│ │ Status: Sent to 52 recipients | Read: 45 | Pending: 7  │
│ │                                                        │
│ │ Jan 21 - Department Heads: Monthly review meeting       │
│ │ Status: Sent to 8 recipients | Confirmed: 6 | Pending: 2│
│ │                                                        │
│ │ Jan 20 - Administrative: Policy update notification     │
│ │ Status: Sent to 12 recipients | Acknowledged: 12 ✅     │
│ │                                                        │
│ │ [View All] [Delivery Reports] [Follow Up]              │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─── External Communications ───┐                          │
│ │ Vendor Communications: 3 pending responses              │
│ │ • IT Support contract renewal                           │
│ │ • Catering service evaluation                          │
│ │ • Security system maintenance                           │
│ │                                                        │
│ │ Parent Committee: Next meeting scheduled Jan 30        │
│ │ Board Communications: Monthly report submitted          │
│ │ Government Liaison: Compliance report pending          │
│ │                                                        │
│ │ [Manage External] [Schedule Meetings] [Track Follow-ups]│
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Resource Management (`/manager/resources`)

### **Resource & Operations Management**
```
┌─── Resource & Operations Management ───┐
│ [Staff Resources] [Facilities] [Equipment] [Vendors] [Budget] │
│                                                               │
│ ⚠️ Note: Limited resource management in current system       │
│ Full resource management requires additional development      │
│                                                               │
│ ┌─── Staff Resource Overview ───┐                            │
│ │ Total Staff: 52                                           │
│ │ Present Today: 48 (92%)                                   │
│ │ On Leave: 3 | Sick Leave: 1                              │
│ │ Training Programs: 2 active                               │
│ │ Performance Reviews Due: 5                                │
│ │ [Staff Schedule] [Leave Management] [Training Plans]      │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─── Facility Management ───┐                                │
│ │ Classrooms: 24 total | Available: 22                     │
│ │ Maintenance Issues: 3 pending                             │
│ │ • Classroom 201: Projector repair needed                 │
│ │ • Lab 1: Air conditioning service due                    │
│ │ • Library: New furniture installation                    │
│ │                                                          │
│ │ Utilities Status: All operational ✅                      │
│ │ Security Systems: Functional ✅                           │
│ │ [Maintenance Requests] [Work Orders] [Vendor Contacts]    │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─── Equipment & Supplies ───┐                               │
│ │ IT Equipment: 45 computers | 8 requiring updates         │
│ │ Teaching Materials: Stock levels normal ✅                │
│ │ Office Supplies: Reorder needed for 3 items              │
│ │ Safety Equipment: All certified ✅                        │
│ │                                                          │
│ │ Recent Orders:                                           │
│ │ • New projectors (3 units) - Delivered Jan 20           │
│ │ • Stationery supplies - Pending delivery                │
│ │ • IT software licenses - Payment processing             │
│ │                                                          │
│ │ [Inventory Management] [Place Orders] [Vendor Portal]    │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─── Budget & Financial Overview ───┐                        │
│ │ Monthly Operations Budget: 2,500,000 FCFA                │
│ │ Spent This Month: 1,890,000 FCFA (76%)                   │
│ │ Remaining: 610,000 FCFA                                  │
│ │ Over Budget Items: None ✅                                │
│ │ Pending Approvals: 3 requests                            │
│ │ [Budget Details] [Approval Queue] [Financial Reports]    │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Task Management (`/manager/tasks`)

#### **API Integration:**
```http
GET /api/v1/manager/tasks
Authorization: Bearer {token}

Query Parameters:
?status=ACTIVE&priority=HIGH&assignedTo=me&page=1&limit=10

Success Response (200):
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Monthly compliance report",
        "description": "Prepare and submit monthly operational compliance report",
        "status": "OVERDUE",
        "priority": "HIGH",
        "assignedTo": [
          {
            "userId": 1,
            "name": "Manager",
            "role": "MANAGER"
          }
        ],
        "dueDate": "2024-01-20T17:00:00Z",
        "progress": 80,
        "createdAt": "2024-01-15T00:00:00Z",
        "category": "COMPLIANCE"
      }
    ],
    "summary": {
      "myTasks": {
        "total": 8,
        "overdue": 1,
        "dueToday": 3,
        "upcoming": 4
      },
      "teamTasks": {
        "active": 15,
        "completedThisMonth": 42
      },
      "projects": {
        "ongoing": 3,
        "completingThisWeek": 1
      },
      "overallProgress": 87
    }
  }
}

POST /api/v1/manager/tasks
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "title": "Prepare Monthly Report",
  "description": "Compile and analyze monthly operational metrics",
  "assignedTo": [1, 2, 3],
  "priority": "HIGH",
  "dueDate": "2024-03-20T17:00:00Z",
  "category": "ADMINISTRATIVE",
  "estimatedHours": 8,
  "dependencies": [],
  "attachments": [
    {
      "filename": "template.xlsx",
      "data": "base64_encoded_file_data"
    }
  ]
}

Success Response (201):
{
  "success": true,
  "data": {
    "taskId": 123,
    "status": "CREATED",
    "assignedTo": 3,
    "notificationsSent": true
  }
}

PUT /api/v1/manager/tasks/:taskId
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "IN_PROGRESS",
  "progress": 25,
  "notes": "Started working on data collection phase",
  "estimatedCompletion": "2024-03-18T17:00:00Z"
}

GET /api/v1/manager/tasks/statistics
Authorization: Bearer {token}

Query Parameters:
?period=monthly&startDate=2024-01-01&endDate=2024-01-31

Success Response (200):
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01", 
      "endDate": "2024-01-31"
    },
    "statistics": {
      "tasksCreated": 42,
      "tasksCompleted": 38,
      "completionRate": 90.5,
      "averageCompletionTime": "5.2 days",
      "onTimeCompletion": 85.7
    },
    "teamPerformance": [
      {
        "userId": 2,
        "name": "Assistant Manager",
        "tasksAssigned": 5,
        "tasksCompleted": 5,
        "status": "ON_SCHEDULE"
      },
      {
        "userId": 3,
        "name": "IT Coordinator", 
        "tasksAssigned": 3,
        "tasksCompleted": 2,
        "status": "DELAYED"
      }
    ],
    "upcomingDeadlines": [
      {
        "taskId": 124,
        "title": "Board presentation preparation",
        "dueDate": "2024-01-25T00:00:00Z",
        "daysRemaining": 3,
        "priority": "HIGH"
      }
    ]
  }
}
```

### **Administrative Task Management**
```
┌─── Administrative Task Management ───┐
│ [My Tasks] [Assign Tasks] [Team Tasks] [Projects] [Calendar] │
│                                                              │
│ ┌─── Task Overview ───┐                                      │
│ │ My Tasks: 8 total | Overdue: 1 | Due Today: 3            │
│ │ Team Tasks: 15 active | Completed: 42 this month         │
│ │ Projects: 3 ongoing | 1 completing this week             │
│ │ Overall Progress: 87% on schedule                         │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── High Priority Tasks ───┐                               │
│ │ 🚨 OVERDUE: Monthly compliance report                     │
│ │ Due: Jan 20 | Assigned to: Me                            │
│ │ Progress: 80% | Action: Submit by EOD                     │
│ │ [Complete Now] [Request Extension] [Delegate]             │
│ │ ────────────────────────────────────────                 │
│ │ ⚠️ DUE TODAY: Staff meeting preparation                   │
│ │ Due: Today 5:00 PM | Progress: 60%                       │
│ │ [Continue Task] [Mark Complete] [Update Status]           │
│ │ ────────────────────────────────────────                 │
│ │ ⚠️ DUE TODAY: User account audit                          │
│ │ Due: Today EOD | Progress: 90%                           │
│ │ [Finish Task] [Review Results] [Generate Report]          │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── Team Task Distribution ───┐                            │
│ │ Assistant Manager: 5 tasks (On schedule ✅)              │
│ │ IT Coordinator: 3 tasks (1 delayed ⚠️)                   │
│ │ Office Manager: 4 tasks (Ahead of schedule ✅)           │
│ │ HR Coordinator: 3 tasks (On schedule ✅)                 │
│ │                                                          │
│ │ [Assign New Task] [Redistribute] [Performance Review]    │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── Upcoming Deadlines ───┐                                │
│ │ Jan 25: Board presentation preparation                    │
│ │ Jan 28: Monthly financial reconciliation                 │
│ │ Jan 30: Parent committee meeting agenda                  │
│ │ Feb 1:  Annual policy review submission                  │
│ │ Feb 5:  Staff performance review cycle start            │
│ │                                                          │
│ │ [View Calendar] [Set Reminders] [Task Dependencies]      │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Navigation Structure

### **Main Navigation**
```
🏠 Dashboard | 👥 Users | 🖥️ System | 📊 Reports | 📧 Communications | 🏢 Resources | ✅ Tasks
```

### **Quick Actions (Always Visible)**
```
⚡ Manager Actions:
• [Create User Account]
• [System Health Check]
• [Send Announcement]
• [Generate Report]
• [Assign Task]
• [Emergency Alert]
```

### **Mobile Navigation**
```
[🏠 Home] [👥 Users] [📊 Reports] [📧 Messages] [✅ Tasks]
```

## Key Features for Manager MVP:

### **Administrative Operations:**
1. **User Management** - Create, manage, and monitor user accounts
2. **System Administration** - Monitor system health and manage operations
3. **Resource Coordination** - Manage staff, facilities, and equipment
4. **Task Management** - Organize and track administrative tasks

### **Communication & Coordination:**
1. **Internal Communications** - Staff announcements and coordination
2. **External Relations** - Vendor management and stakeholder communication
3. **Reporting** - Generate operational and analytical reports
4. **Meeting Management** - Schedule and coordinate administrative meetings

### **Support Functions:**
1. **Technical Support** - Assist with system issues and user problems
2. **Process Improvement** - Identify and implement operational improvements
3. **Compliance Management** - Ensure regulatory and policy compliance
4. **Documentation** - Maintain operational records and procedures

## API Limitations & Workarounds:

### **Current Limitations:**
1. **Limited Manager-Specific Endpoints** - Mostly general administrative access
2. **No Advanced System Management** - Basic system monitoring only
3. **Limited Resource Management** - No dedicated facilities/equipment APIs
4. **Basic Task Management** - No dedicated project/task tracking system

### **Recommended Workarounds:**
1. **Leverage Existing APIs** - Use user management and general endpoints
2. **External Tools Integration** - Third-party project management tools
3. **Manual Tracking** - Spreadsheets and documents for complex operations
4. **Custom Development** - Add manager-specific features as needed

## Critical UX Principles:

1. **Operational Efficiency** - Streamlined administrative processes
2. **Cross-Functional Support** - Assist and coordinate with all school roles
3. **System Oversight** - Monitor and maintain system health
4. **Communication Hub** - Central coordination for all stakeholders
5. **Data Management** - Ensure data integrity and system compliance
6. **Process Documentation** - Maintain comprehensive operational records
7. **Continuous Improvement** - Regular assessment and optimization
