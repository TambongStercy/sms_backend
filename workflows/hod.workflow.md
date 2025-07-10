# HOD (Head of Department) Role - Complete Workflow & UX Design

*Note: HOD inherits ALL teacher functionality + department management features*

## Post-Login HOD Dashboard (`/hod/dashboard`)

### **API Integration**
**Primary Endpoint:** `GET /api/v1/hod/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number; // Optional, defaults to current year
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: {
      // Personal teaching stats (inherited from teacher role)
      personalTeaching: {
        myClasses: number;
        myStudents: number;
        marksToEnter: number;
        periodsToday: number;
        subjects: Array<{
          id: number;
          name: string;
          classCount: number;
        }>;
      };
      // Department-specific management stats
      departmentStats: {
        departmentId: number;
        departmentName: string;
        departmentCode: string;
        totalTeachers: number;
        totalClasses: number;
        totalStudents: number;
        departmentAverage: number;        // Out of 20
        attendanceRate: number;           // Percentage
        trend: "IMPROVING" | "STABLE" | "DECLINING";
        trendValue: number;               // Change from previous period
      };
      departmentOverview: {
        teachers: Array<{
          id: number;
          name: string;
          classCount: number;
          studentCount: number;
          averageScore: number;
          status: "ACTIVE" | "ON_LEAVE" | "NEEDS_REVIEW";
        }>;
        recentConcerns: number;
        pendingReviews: number;
        performanceRanking: number;       // Department rank in school
      };
      todaysSchedule: Array<{
        id: number;
        startTime: string;
        endTime: string;
        subjectName: string;
        className: string;
        subclassName: string;
      }>;
      departmentTasks: Array<{
        id: number;
        task: string;
        priority: "HIGH" | "MEDIUM" | "LOW";
        dueDate?: string;
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
      }>;
    };
  }
  ```

*Note: All teacher API endpoints from Teacher workflow are also available to HODs*

### **Enhanced Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ [🏠] School Management System    [🔔] [👤] [⚙️] [🚪]    │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [Teacher Name] | Academic Year: 2024-2025  │
│ Head of Mathematics Department | Teaching + Management   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Personal Teaching Stats ───┐ ┌─── Department Stats ───┐│
│ │ 📚 My Classes: 3             │ │ 👥 Department Teachers: 5  ││
│ │ 👨‍🎓 My Students: 85           │ │ 🏫 Total Classes: 12       ││
│ │ 📝 Marks to Enter: 15        │ │ 📊 Dept Average: 14.8/20   ││
│ │ ⏰ My Periods Today: 4        │ │ 📈 Department Trend: ↗️    ││
│ └─────────────────────────────┘ └─────────────────────────┘│
│                                                         │
│ ┌─── Department Overview - Mathematics ───┐              │
│ │ Total Students: 340 | Total Teachers: 5               │
│ │ Department Average: 14.8/20 | Attendance: 94%         │
│ │ Recent Concerns: 2 | Pending Reviews: 3               │
│ │ [Manage Department] [View All Teachers] [Analytics]   │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Today's Schedule ───┐  ┌─── Department Tasks ───┐   │
│ │ 8:00-9:00   Math - 5A  │  │ • Review Form 4 curriculum   │
│ │ 10:00-11:00 Math - 4B  │  │ • Teacher meeting tomorrow   │
│ │ 2:00-3:00   Math - 4A  │  │ • Analyze low performers     │
│ │ [Full Schedule]        │  │ • Coordinate with Principal  │
│ └─────────────────────── │  └─────────────────────────── │
└─────────────────────────────────────────────────────────┘
```

## Navigation Enhancement

### **Enhanced Main Navigation**
```
🏠 Dashboard | 📚 My Teaching | 👨‍🎓 My Students | 📝 Marks | 🎯 Quizzes | 🏢 DEPARTMENT | 📧 Messages
```

*Note: All regular teacher features remain identical, with additional "DEPARTMENT" section*

## Department Management (`/hod/department`)

### **API Integration**

#### **1. Get Department Overview**
**Endpoint:** `GET /api/v1/hod/department/overview`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: {
      department: {
        id: number;
        name: string;
        code: string;
        hodId: number;
        hodName: string;
      };
      statistics: {
        totalTeachers: number;
        totalStudents: number;
        totalClasses: number;
        departmentAverage: number;
        attendanceRate: number;
        passRate: number;
        improvementTrend: number;
        schoolRanking: number;        // Department ranking in school
      };
      subjects: Array<{
        id: number;
        name: string;
        code: string;
        teacherCount: number;
        studentCount: number;
        averageScore: number;
      }>;
      recentActivity: Array<{
        id: number;
        type: "MARK_ENTRY" | "TEACHER_ASSIGNMENT" | "PERFORMANCE_REVIEW";
        description: string;
        timestamp: string;
        teacherName: string;
      }>;
    };
  }
  ```

### **Department Dashboard**
```
┌─── Mathematics Department Management ───┐
│ Head of Department: [Your Name]          │
│ Subject: Mathematics | Code: MATH        │
│ Academic Year: 2024-2025                 │
│                                          │
│ ┌─── Department Statistics ───┐          │
│ │ Total Teachers: 5                     │
│ │ Total Students: 340                   │
│ │ Total Classes: 12                     │
│ │ Department Average: 14.8/20           │
│ │ Attendance Rate: 94%                  │
│ │ Pass Rate: 87%                        │
│ │ Improvement Trend: ↗️ +2.3% this term │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─── Quick Actions ───┐                  │
│ │ [Department Teachers] [Performance Analytics] │
│ │ [Curriculum Planning] [Resource Management]   │
│ │ [Schedule Coordination] [Reports]             │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

## Department Teachers (`/hod/department/teachers`)

### **API Integration**

#### **1. Get Department Teachers**
**Endpoint:** `GET /api/v1/hod/department/teachers`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    includePerformance?: boolean;
    sortBy?: "NAME" | "PERFORMANCE" | "EXPERIENCE";
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      name: string;
      email: string;
      phone?: string;
      experience: number;          // Years of experience
      status: "ACTIVE" | "ON_LEAVE" | "NEEDS_REVIEW";
      teachingAssignments: Array<{
        classId: number;
        className: string;
        subclassName: string;
        studentCount: number;
        averageScore?: number;
      }>;
      performance: {
        totalClasses: number;
        totalStudents: number;
        averageScore: number;
        attendanceRate: number;
        improvementTrend: "IMPROVING" | "STABLE" | "DECLINING";
        studentSatisfaction?: number;
        departmentRank: number;
      };
      lastEvaluation?: {
        date: string;
        score: number;
        evaluatedBy: string;
      };
    }>;
  }
  ```

#### **2. Request Teacher Transfer**
**Endpoint:** `POST /api/v1/hod/teacher-requests`
- **Request Body:**
  ```typescript
  {
    requestType: "TRANSFER_REQUEST" | "ADDITIONAL_TEACHER" | "PROFESSIONAL_DEVELOPMENT";
    teacherId?: number;          // For transfer requests
    targetDepartment?: number;   // For transfer requests
    justification: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    expectedOutcome: string;
  }
  ```

#### **3. Conduct Performance Review**
**Endpoint:** `POST /api/v1/hod/performance-reviews`
- **Request Body:**
  ```typescript
  {
    teacherId: number;
    reviewPeriod: {
      startDate: string;
      endDate: string;
    };
    metrics: {
      teachingEffectiveness: number;    // 1-5 scale
      studentEngagement: number;        // 1-5 scale
      professionalDevelopment: number;  // 1-5 scale
      collaboration: number;            // 1-5 scale
    };
    comments: string;
    recommendations: Array<string>;
    developmentPlan?: string;
  }
  ```

### **Teachers Management**
```
┌─── Mathematics Department Teachers ───┐
│ [Add Teacher] [Request Transfer] [Performance Review] │
│                                                       │
│ Teacher Name     Classes  Students  Avg Score  Status │
│ Mrs. Johnson     3        75       15.2/20     Active │
│ Mr. Smith        2        50       14.8/20     Active │
│ Ms. Davis        3        80       16.1/20     Active │
│ Mr. Wilson       2        60       13.9/20     Review │
│ Dr. Brown        2        75       15.8/20     Active │
│                                                       │
│ ┌─── Teacher Performance Summary ───┐                 │
│ │ Top Performer: Ms. Davis (16.1/20 avg)             │
│ │ Needs Support: Mr. Wilson (13.9/20 avg)            │
│ │ Department Goal: 15.0/20 average                    │
│ │ Current Status: 15.16/20 (Above target ✅)         │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### **Individual Teacher Overview** (`/hod/department/teachers/:teacherId`)

#### **API Integration**
**Get Teacher Details:** `GET /api/v1/hod/department/teachers/:teacherId`
- **Response includes:** Complete teacher profile, performance metrics, class assignments

**Send Message to Teacher:** `POST /api/v1/hod/message-teacher`
- **Request Body:**
  ```typescript
  {
    teacherId: number;
    subject: string;
    message: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    followUpRequired?: boolean;
  }
  ```

```
┌─── Teacher Profile - Mrs. Johnson ───┐
│ Name: Mrs. Johnson                    │
│ Teaching Experience: 8 years          │
│ Classes: Form 5A, 4B, 3A             │
│ Total Students: 75                    │
│ Subject Average: 15.2/20              │
└─────────────────────────────────────┘

┌─── Performance Metrics ───┐
│ Student Average: 15.2/20              │
│ Department Rank: 2/5 teachers         │
│ Attendance Rate: 96%                  │
│ Student Satisfaction: High            │
│ Improvement Trend: ↗️ Stable          │
└─────────────────────────────────────┘

┌─── Classes Teaching ───┐
│ Class    Students  Average  Attendance │
│ Form 5A  25        15.8/20  94%       │
│ Form 4B  23        14.9/20  98%       │
│ Form 3A  27        14.9/20  96%       │
└─────────────────────────────────────┘

┌─── Actions ───┐
│ [Send Message] [Schedule Meeting] [Performance Review] │
│ [Resource Request] [Class Reassignment] [Support Plan] │
└─────────────────────────────────────────────────────┘
```

## Department Analytics (`/hod/department/analytics`)

### **API Integration**

#### **1. Get Department Performance Analytics**
**Endpoint:** `GET /api/v1/hod/department/analytics`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    period?: "TERM" | "SEQUENCE" | "YEAR";
    includeComparison?: boolean;        // Compare with other departments
    includeTeacherBreakdown?: boolean;
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: {
      departmentPerformance: {
        departmentAverage: number;
        schoolAverage: number;
        improvementFromLastYear: number;
        schoolRanking: number;
        percentileRank: number;
      };
      classPerformance: Array<{
        className: string;          // "Form 1", "Form 2", etc.
        averageScore: number;
        studentCount: number;
        status: "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_IMPROVEMENT";
        trend: "IMPROVING" | "STABLE" | "DECLINING";
      }>;
      teacherPerformance: Array<{
        teacherId: number;
        teacherName: string;
        averageScore: number;
        studentCount: number;
        improvement: number;
        ranking: number;
        status: "TOP_PERFORMER" | "GOOD" | "NEEDS_SUPPORT";
      }>;
      subjectBreakdown: Array<{
        subjectName: string;
        averageScore: number;
        teacherCount: number;
        topicStrengths: Array<string>;
        topicWeaknesses: Array<string>;
      }>;
      trends: {
        monthly: Array<{
          month: string;
          averageScore: number;
          attendanceRate: number;
        }>;
        comparative: {
          departmentGrowth: number;
          schoolGrowth: number;
          industryBenchmark?: number;
        };
      };
      recommendations: Array<{
        area: string;
        suggestion: string;
        priority: "HIGH" | "MEDIUM" | "LOW";
        expectedImpact: string;
      }>;
    };
  }
  ```

### **Performance Analytics**
```
┌─── Mathematics Department Analytics ───┐
│ Academic Year: 2024-2025 | Analysis Period: Full Year │
│                                                        │
│ ┌─── Overall Performance ───┐                         │
│ │ Department Average: 14.8/20                         │
│ │ School Average: 14.2/20                             │
│ │ Performance vs School: +0.6 (Above ✅)              │
│ │ Improvement from Last Year: +1.2                    │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌─── Class Performance Breakdown ───┐                  │
│ │ Form 6: 16.2/20 (Excellent)                        │
│ │ Form 5: 15.1/20 (Good)                             │
│ │ Form 4: 14.3/20 (Average)                          │
│ │ Form 3: 13.8/20 (Needs Improvement)                │
│ │ Form 2: 14.9/20 (Good)                             │
│ │ Form 1: 15.2/20 (Good)                             │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌─── Teacher Performance ───┐                          │
│ │ [📊 Chart showing teacher comparison]                │
│ │ Best Performing: Ms. Davis (16.1/20)                │
│ │ Most Improved: Mr. Smith (+2.1 from last term)      │
│ │ Needs Support: Mr. Wilson (13.9/20)                 │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Export Report] [Share with Principal] [Print Analysis]│
└──────────────────────────────────────────────────────┘
```

## Department Students Overview (`/hod/department/students`)

### **API Integration**

#### **1. Get All Department Students**
**Endpoint:** `GET /api/v1/hod/department/students`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    classId?: number;
    teacherId?: number;
    performanceLevel?: "HIGH" | "MEDIUM" | "LOW";
    page?: number;
    limit?: number;
    search?: string;
  }
  ```
- **Response includes:** All students studying subjects in the department with performance metrics

#### **2. Identify Students Needing Support**
**Endpoint:** `GET /api/v1/hod/department/students/at-risk`
- **Response:** Students performing below department thresholds

### **All Department Students**
```
┌─── All Mathematics Students ───┐
│ [Filter by Class ▼] [Filter by Teacher ▼] [Search...] │
│ Showing 340 students across all classes               │
│                                                       │
│ ┌─── Performance Overview ───┐                        │
│ │ Total Students: 340                                │
│ │ Above Average (>15): 156 students (46%)           │
│ │ Average (12-15): 134 students (39%)               │
│ │ Below Average (<12): 50 students (15%)            │
│ │ [Focus on Low Performers] [Excellence Program]     │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─── Top Performers ───┐  ┌─── Needs Attention ───┐  │
│ │ Mary Smith  - 18.9/20 │  │ John Doe    - 9.2/20  │  │
│ │ Peter Jones - 18.7/20 │  │ Lisa Brown  - 8.8/20  │  │
│ │ Sarah Win   - 18.5/20 │  │ Mike Wilson - 9.5/20  │  │
│ │ [View All] [Recognize]│  │ [Support Plan] [Alert] │  │
│ └─────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Resource Management (`/hod/department/resources`)

### **API Integration**

#### **1. Get Department Resources**
**Endpoint:** `GET /api/v1/hod/department/resources`
- **Response Data:**
  ```typescript
  {
    success: true;
    data: {
      inventory: Array<{
        id: number;
        itemName: string;
        category: "TEXTBOOKS" | "EQUIPMENT" | "DIGITAL_RESOURCES" | "SUPPLIES";
        quantity: number;
        condition: "NEW" | "GOOD" | "FAIR" | "NEEDS_REPLACEMENT";
        lastUpdated: string;
        assignedTo?: string;
      }>;
      budgetStatus: {
        allocated: number;
        spent: number;
        remaining: number;
        pendingRequests: number;
      };
      recentRequests: Array<{
        id: number;
        itemRequested: string;
        quantity: number;
        justification: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
        requestedBy: string;
        requestDate: string;
      }>;
    };
  }
  ```

#### **2. Submit Resource Request**
**Endpoint:** `POST /api/v1/hod/resource-requests`
- **Request Body:**
  ```typescript
  {
    itemName: string;
    category: "TEXTBOOKS" | "EQUIPMENT" | "DIGITAL_RESOURCES" | "SUPPLIES";
    quantity: number;
    estimatedCost?: number;
    justification: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    requestedFor: "DEPARTMENT" | "SPECIFIC_TEACHER" | "CLASSROOM";
    targetTeacherId?: number;    // If for specific teacher
    expectedDelivery?: string;   // Preferred delivery date
  }
  ```

### **Department Resources**
```
┌─── Mathematics Department Resources ───┐
│ [Request Resources] [Inventory] [Budget Planning]     │
│                                                       │
│ ┌─── Current Resources ───┐                          │
│ │ Textbooks: Mathematics for All Levels              │
│ │ Calculators: 45 Scientific Calculators             │
│ │ Teaching Aids: Geometric Tools, Charts             │
│ │ Digital Resources: Online Practice Platform        │
│ │ [Update Inventory] [Request More]                  │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─── Budget Status ───┐                              │
│ │ Allocated Budget: 1,500,000 FCFA                   │
│ │ Spent: 1,200,000 FCFA (80%)                        │
│ │ Remaining: 300,000 FCFA                            │
│ │ Pending Requests: 3                                │
│ │ [View Budget Details] [Submit Request]             │
│ └───────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─── Recent Resource Requests ───┐                    │
│ │ Request: New Geometry Set (Approved)               │
│ │ Request: Digital Projector (Pending)               │
│ │ Request: Advanced Calculators (Under Review)       │
│ │ [View All Requests] [Track Status]                 │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Curriculum Planning (`/hod/department/curriculum`)

### **API Integration**

#### **1. Get Curriculum Overview**
**Endpoint:** `GET /api/v1/hod/department/curriculum`
- **Response includes:** Subject syllabi, teaching schedules, assessment plans

#### **2. Update Curriculum**
**Endpoint:** `PUT /api/v1/hod/department/curriculum/:subjectId`
- **Request Body:**
  ```typescript
  {
    topics: Array<{
      topicName: string;
      weekNumber: number;
      objectives: Array<string>;
      resources: Array<string>;
      assessmentType: "FORMATIVE" | "SUMMATIVE";
    }>;
    assessmentSchedule: Array<{
      assessmentName: string;
      date: string;
      weight: number;
      description: string;
    }>;
    teachingMethods: Array<string>;
    requiredResources: Array<string>;
  }
  ```

### **Curriculum Planning Dashboard**
```
┌─── Mathematics Curriculum Planning ───┐
│ Academic Year: 2024-2025                │
│ [Edit Curriculum] [Assessment Schedule] [Resources] │
│                                         │
│ ┌─── Subject Breakdown ───┐             │
│ │ Form 1 Math: Algebra Basics           │
│ │ Form 2 Math: Geometry & Trigonometry  │
│ │ Form 3 Math: Advanced Algebra         │
│ │ Form 4 Math: Calculus Introduction    │
│ │ Form 5 Math: Advanced Calculus        │
│ │ [View Details] [Edit Syllabus]        │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─── Assessment Schedule ───┐           │
│ │ Sequence 1: Feb 15-22 (Planned)       │
│ │ Sequence 2: Apr 10-17 (Scheduled)     │
│ │ Final Exams: Jun 5-12 (Planned)       │
│ │ [Modify Dates] [Coordinate with HODs]  │
│ └─────────────────────────────────────┘ │
└───────────────────────────────────────┘
```

## Reports & Communication (`/hod/reports`)

### **API Integration**

#### **1. Generate Department Reports**
**Endpoint:** `GET /api/v1/hod/reports`
- **Query Parameters:**
  ```typescript
  {
    reportType: "PERFORMANCE" | "TEACHER_EVALUATION" | "RESOURCE_UTILIZATION" | "CURRICULUM_PROGRESS";
    period: "MONTHLY" | "QUARTERLY" | "ANNUAL";
    includeRecommendations?: boolean;
    format?: "json" | "pdf" | "excel";
  }
  ```

#### **2. Submit to Principal**
**Endpoint:** `POST /api/v1/hod/submit-report`
- **Request Body:**
  ```typescript
  {
    reportType: string;
    reportData: object;
    summary: string;
    recommendations: Array<string>;
    requestMeeting?: boolean;
  }
  ```

### **HOD Reports Dashboard**
```
┌─── HOD Reports & Communication ───┐
│ [Department Reports] [Principal Communication] [Teacher Feedback] │
│                                                                   │
│ ┌─── Monthly Department Report ───┐                               │
│ │ Performance Summary: Above School Average                       │
│ │ Teacher Development: 2 completed training programs             │
│ │ Resource Utilization: 85% budget used effectively             │
│ │ Student Progress: 15% showing significant improvement          │
│ │ [Generate Report] [Submit to Principal]                       │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─── Communication Center ───┐                                    │
│ │ [Message All Teachers] [Send Report to Principal]              │
│ │ [Request Budget Allocation] [Coordinate with Other HODs]        │
│ │ [Parent Communication] [Student Recognition]                   │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling & Loading States

### **API Error Handling**
```typescript
// Standard error response format
{
  success: false;
  error: string; // User-friendly error message
}

// HOD-specific error scenarios:
// 403: "Department access denied" | "Cannot modify other department data"
// 404: "Teacher not in your department" | "Resource not found"
// 409: "Teacher already assigned" | "Resource conflict"
// 500: "Department analytics failed" | "Report generation failed"
```

### **Loading & Validation States**
- Real-time department performance updates
- Teacher evaluation progress tracking
- Resource request status monitoring
- Curriculum planning auto-save
- Budget utilization alerts

### **Success Feedback**
- Teacher evaluation completion confirmations
- Resource request submission notifications
- Report generation and submission status
- Performance improvement alerts
- Department achievement celebrations

**Frontend Implementation Notes:**
1. **Inherit all Teacher functionality:** HOD interface should include all teacher features plus department management
2. **Dashboard integration:** Seamlessly switch between personal teaching view and department management view
3. **Teacher performance tracking:** Implement comprehensive teacher evaluation and support systems
4. **Resource management:** Include inventory tracking and budget monitoring capabilities
5. **Curriculum coordination:** Enable collaborative curriculum planning and assessment scheduling
6. **Communication tools:** Facilitate communication with teachers, principal, and other HODs
7. **Analytics and reporting:** Provide comprehensive department performance analytics
8. **Mobile responsiveness:** Ensure department management features work well on mobile devices
9. **Real-time updates:** Implement live updates for department statistics and teacher performance
10. **Export capabilities:** Allow export of department reports and analytics in multiple formats