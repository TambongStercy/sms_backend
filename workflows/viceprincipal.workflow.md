# VICE_PRINCIPAL Role - Complete Workflow & UX Design

## Post-Login Vice Principal Dashboard (`/vice-principal/dashboard`)

### **API Integration**
**Primary Endpoint:** `GET /api/v1/vice-principal/dashboard`
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
      overview: {
        totalStudents: number;
        studentsAssigned: number;         // Students assigned to subclasses
        pendingInterviews: number;        // Students awaiting interview
        awaitingAssignment: number;       // Students ready for subclass assignment
        assignmentRate: number;           // Percentage (0-100)
        interviewCompletionRate: number;  // Percentage (0-100)
        newRegistrations: number;         // Today's new registrations
        issuesRequiringReview: number;    // Assignment issues
      };
      enrollmentPipeline: {
        registeredByBursar: number;       // Stage 1
        interviewPending: number;         // Stage 2
        interviewComplete: number;        // Stage 3
        assignedToSubclass: number;       // Stage 4
      };
      classManagement: {
        totalSubclasses: number;
        averageCapacity: number;          // Percentage (0-100)
        reassignments: number;            // Recent reassignments
        fullClasses: number;              // Classes at capacity
      };
      priorityActions: Array<{
        id: number;
        priority: "URGENT" | "HIGH" | "MEDIUM";
        description: string;
        count?: number;
        dueDate?: string;
        category: "INTERVIEW" | "ASSIGNMENT" | "REVIEW" | "REPORT";
      }>;
      todaysSchedule: Array<{
        id: number;
        time: string;                     // "10:30"
        studentName: string;
        activity: "INTERVIEW" | "MEETING" | "ASSIGNMENT";
        status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
      }>;
    };
  }
  ```

### **Main Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ [🏠] School Management System    [🔔] [👤] [⚙️] [🚪]    │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [VP Name] | Academic Year: 2024-2025      │
│ Vice Principal - Student Affairs & Enrollment           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Student Management Overview ───┐                   │
│ │ 👨‍🎓 Total Students: 1,245    📝 Pending Interviews: 12  │
│ │ 🏫 Students Assigned: 1,220   ⏳ Awaiting Assignment: 15│
│ │ 📊 Assignment Rate: 98%       🎯 Interview Completion: 95%│
│ │ 📋 New Registrations: 8       ⚠️ Issues Requiring Review: 3│
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Enrollment Pipeline ───┐   ┌─── Class Management ───┐│
│ │ 1️⃣ Registered by Bursar: 8  │   │ 🏛️ Total Subclasses: 48    ││
│ │ 2️⃣ Interview Pending: 12    │   │ 📊 Avg Capacity: 85%       ││
│ │ 3️⃣ Interview Complete: 189  │   │ 🔄 Reassignments: 3        ││
│ │ 4️⃣ Assigned to Subclass: 1,220│ │ 📈 Full Classes: 12        ││
│ │ [Manage Pipeline]           │   │ [Manage Classes]           ││
│ └─────────────────────────── │   └─────────────────────────┘ │
│                                                         │
│ ┌─── Priority Actions ───┐                              │
│ │ 🚨 Urgent (3)                                         │
│ │ • Complete interviews for 12 students                │
│ │ • Assign 15 interviewed students to subclasses       │
│ │ • Review 3 problematic assignments                   │
│ │                                                       │
│ │ ⚠️ This Week (8)                                      │
│ │ • Monthly enrollment report due                       │
│ │ • Class capacity review meeting                      │
│ │ • Parent interviews scheduled                        │
│ │ [View All Tasks] [Mark Complete]                     │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Student Enrollment Management (`/vice-principal/enrollment`)

### **API Integration**

#### **1. Get Enrollment Pipeline Status**
**Endpoint:** `GET /api/v1/vice-principal/enrollment/pipeline`
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
      pipelineStats: {
        totalEnrolled: number;
        enrollmentTarget: number;
        remainingCapacity: number;
        pipelineEfficiency: number;      // Percentage
      };
      stages: {
        newRegistrations: {
          count: number;
          studentsToday: number;
          studentsThisWeek: number;
        };
        interviewProcess: {
          pending: number;
          completedThisWeek: number;
          averageScore: number;
          passRate: number;
        };
        subclassAssignment: {
          readyForAssignment: number;
          assignedThisWeek: number;
          successfulPlacements: number;
        };
      };
    };
  }
  ```

#### **2. Get Students by Stage**
**Endpoint:** `GET /api/v1/vice-principal/students/by-stage`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    stage: "NEW_REGISTRATION" | "AWAITING_INTERVIEW" | "INTERVIEW_COMPLETE" | "ASSIGNED";
    academicYearId?: number;
    page?: number;
    limit?: number;
    search?: string;          // Name or matricule search
    classId?: number;         // Filter by target class
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      name: string;
      matricule: string;
      dateOfBirth: string;
      age: number;
      registrationDate: string;
      currentStage: "NEW_REGISTRATION" | "AWAITING_INTERVIEW" | "INTERVIEW_COMPLETE" | "ASSIGNED";
      targetClass: {
        id: number;
        name: string;
      };
      formerSchool?: string;
      parent: {
        id: number;
        name: string;
        phone: string;
        email?: string;
        relationship: string;
      };
      status: "NOT_ENROLLED" | "AWAITING_INTERVIEW" | "INTERVIEW_COMPLETED" | "ASSIGNED_TO_CLASS";
      daysInStage: number;
      interviewDetails?: {
        scheduledDate?: string;
        completedDate?: string;
        score?: number;
        status?: "PENDING" | "COMPLETED" | "PASSED" | "FAILED";
      };
      assignmentDetails?: {
        subClassId?: number;
        subClassName?: string;
        assignedDate?: string;
      };
      registeredBy: {
        id: number;
        name: string;
      };
      urgencyLevel: "LOW" | "MEDIUM" | "HIGH";
      alerts: Array<string>;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalByStage: {
        newRegistrations: number;
        awaitingInterview: number;
        interviewComplete: number;
        assigned: number;
      };
      averageDaysInStage: number;
      urgentCases: number;
    };
  }
  ```

### **Enrollment Pipeline Dashboard**
```
┌─── Student Enrollment Pipeline ───┐
│ [New Registrations] [Interviews] [Assignments] [Reports] │
│                                                          │
│ ┌─── Pipeline Status ───┐                               │
│ │ Academic Year: 2024-2025                              │
│ │ Total Enrolled: 1,245 students                        │
│ │ Enrollment Target: 1,280 students                     │
│ │ Remaining Capacity: 35 students                       │
│ │ Pipeline Efficiency: 98% completion rate              │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Stage 1: New Registrations (From Bursar) ───┐      │
│ │ Students Awaiting Interview: 12                       │
│ │ Registered Today: 3                                   │
│ │ This Week: 8                                          │
│ │ [View New Students] [Schedule Interviews]             │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Stage 2: Interview Process ───┐                     │
│ │ Interviews Pending: 12                                │
│ │ Completed This Week: 15                               │
│ │ Average Interview Score: 14.2/20                      │
│ │ Pass Rate: 94%                                        │
│ │ [Conduct Interviews] [Review Scores]                  │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Stage 3: Subclass Assignment ───┐                   │
│ │ Ready for Assignment: 15 students                     │
│ │ Assigned This Week: 18                                │
│ │ Successful Placements: 100%                           │
│ │ [Assign Students] [View Capacity]                     │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## New Student Registrations (`/vice-principal/enrollment/new-students`)

### **API Integration**

#### **1. Get Students Awaiting Interview**
**Endpoint:** `GET /api/v1/vice-principal/students/awaiting-interview`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    classId?: number;           // Filter by target class
    registrationDate?: {
      from: string;             // "YYYY-MM-DD"
      to: string;               // "YYYY-MM-DD"
    };
    ageRange?: {
      min: number;
      max: number;
    };
    page?: number;
    limit?: number;
    search?: string;            // Name or matricule search
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      name: string;
      matricule: string;
      dateOfBirth: string;
      age: number;
      registrationDate: string;
      targetClass: {
        id: number;
        name: string;           // "Form 1", "Form 2", etc.
      };
      formerSchool?: string;
      parent: {
        id: number;
        name: string;
        phone: string;
        email?: string;
        relationship: string;
      };
      status: "NOT_ENROLLED" | "AWAITING_INTERVIEW";
      registeredBy: {
        id: number;
        name: string;           // Bursar who registered
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

#### **2. Schedule Interview**
**Endpoint:** `POST /api/v1/vice-principal/interviews/schedule`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    interviewDate: string;      // "YYYY-MM-DD"
    interviewTime: string;      // "HH:MM" (24-hour format)
    notes?: string;
  }
  ```

#### **3. Batch Schedule Interviews**
**Endpoint:** `POST /api/v1/vice-principal/interviews/batch-schedule`
- **Request Body:**
  ```typescript
  {
    studentIds: Array<number>;
    interviewDate: string;
    startTime: string;          // "09:00"
    intervalMinutes: number;    // Default: 30 minutes
    notes?: string;
  }
  ```

### **New Students Awaiting Interview**
```
┌─── Students Awaiting Interview ───┐
│ [Schedule Batch Interviews] [Export List] [Filter] [Search] │
│                                                             │
│ ┌─── Filters ───┐                                          │
│ │ Class: [All ▼] | Registration Date: [Last 7 days ▼]     │
│ │ Status: [All ▼] | Age Range: [All ▼]                    │
│ │ [Apply] [Clear] [Reset]                                 │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ Student Name    Class   Age  Registration  Former School    │
│ John Doe        Form 1  13   Jan 20, 2024  St. Mary's     │
│ Mary Smith      Form 3  15   Jan 19, 2024  Public School  │
│ Peter Johnson   Form 2  14   Jan 18, 2024  Home School    │
│ Sarah Williams  Form 1  13   Jan 18, 2024  New Student    │
│ Michael Brown   Form 4  16   Jan 17, 2024  Transfer       │
│                                                             │
│ [View: 12 students] [Select All] [Bulk Actions ▼]          │
│                                                             │
│ ┌─── Quick Actions ───┐                                     │
│ │ Selected: 0 students                                     │
│ │ [Schedule Interview] [Send Parent Notice]                │
│ │ [Generate Interview Cards] [Batch Process]               │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### **Individual Student Profile** (`/vice-principal/students/:studentId`)

#### **API Integration**
**Get Student Profile:** `GET /api/v1/vice-principal/students/:studentId`
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `studentId` (number): Student ID
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number; // Optional, defaults to current year
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      studentId: number;
      studentName: string;
      matricule: string;
      dateOfBirth: string;
      placeOfBirth: string;
      gender: "MALE" | "FEMALE";
      residence: string;
      formerSchool?: string;
      status: "NOT_ENROLLED" | "AWAITING_INTERVIEW" | "INTERVIEW_COMPLETED" | "ASSIGNED_TO_CLASS";
      registrationDate: string;
      targetClass: {
        id: number;
        name: string;
      };
      parentInfo: {
        id: number;
        name: string;
        phone: string;
        email?: string;
        whatsappNumber?: string;
        address: string;
        relationship: string;
      };
      enrollmentJourney: Array<{
        stage: "REGISTERED" | "INTERVIEWED" | "ASSIGNED" | "ENROLLED";
        date: string;
        details: string;
        completedBy?: string;
      }>;
      interviewDetails?: {
        id: number;
        scheduledDate?: string;
        completedDate?: string;
        totalScore?: number;
        maxScore: number;
        status: "PENDING" | "COMPLETED" | "PASSED" | "FAILED";
        comments?: string;
        recommendedSubclass?: {
          id: number;
          name: string;
          className: string;
        };
        interviewerName?: string;
      };
      assignmentDetails?: {
        subClassId?: number;
        subClassName?: string;
        className?: string;
        classMaster?: string;
        assignedDate?: string;
        assignedBy?: string;
      };
      currentStatus: string;
      nextAction: string;
      daysInCurrentStage: number;
      alerts: Array<string>;
    };
  }
  ```

## Interview Management (`/vice-principal/interviews`)

### **API Integration**

#### **1. Get Interview Schedule**
**Endpoint:** `GET /api/v1/vice-principal/interviews/schedule`
- **Query Parameters:**
  ```typescript
  {
    date?: string;              // "YYYY-MM-DD", defaults to today
    status?: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    academicYearId?: number;
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      student: {
        id: number;
        name: string;
        matricule: string;
        targetClass: string;
      };
      interviewDate: string;
      interviewTime: string;
      status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
      result?: {
        totalScore: number;
        maxScore: number;
        status: "PASSED" | "FAILED";
        comments?: string;
        recommendedSubclass?: string;
      };
      scheduledBy: {
        id: number;
        name: string;
      };
    }>;
  }
  ```

#### **2. Conduct Interview**
**Endpoint:** `POST /api/v1/vice-principal/interviews/:interviewId/conduct`
- **Request Body:**
  ```typescript
  {
    scores: {
      academicKnowledge: {
        mathematics: number;     // 0-2
        english: number;         // 0-2
        science: number;         // 0-2
        generalKnowledge: number; // 0-2
      };
      communicationSkills: {
        oralExpression: number;  // 0-3
        comprehension: number;   // 0-3
      };
      behaviorAssessment: {
        attitude: number;        // 0-3
        motivation: number;      // 0-3
      };
    };
    comments: string;
    recommendation: {
      status: "PASSED" | "FAILED";
      recommendedSubclass?: number; // Subclass ID if passed
      notes?: string;
    };
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      interviewId: number;
      totalScore: number;
      maxScore: number;
      percentage: number;
      status: "PASSED" | "FAILED";
      recommendedSubclass?: {
        id: number;
        name: string;
        className: string;
      };
      nextStep: "ASSIGN_TO_SUBCLASS" | "SCHEDULE_REINTERVIEW" | "NOTIFY_PARENT";
    };
  }
  ```

#### **3. Get Interview Results**
**Endpoint:** `GET /api/v1/vice-principal/interviews/results`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    dateRange?: {
      from: string;           // "YYYY-MM-DD"
      to: string;             // "YYYY-MM-DD"
    };
    status?: "PASSED" | "FAILED";
    classId?: number;
    academicYearId?: number;
    page?: number;
    limit?: number;
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      studentId: number;
      studentName: string;
      studentMatricule: string;
      targetClassName: string;
      interviewDate: string;
      interviewTime: string;
      totalScore: number;
      maxScore: number;
      percentage: number;
      status: "PASSED" | "FAILED";
      scoreBreakdown: {
        academicKnowledge: {
          mathematics: number;
          english: number;
          science: number;
          generalKnowledge: number;
        };
        communicationSkills: {
          oralExpression: number;
          comprehension: number;
        };
        behaviorAssessment: {
          attitude: number;
          motivation: number;
        };
      };
      recommendedSubclass?: {
        id: number;
        name: string;
        className: string;
      };
      comments: string;
      interviewerName: string;
      nextAction: "ASSIGN_TO_SUBCLASS" | "SCHEDULE_REINTERVIEW" | "NOTIFY_PARENT";
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalInterviews: number;
      passedCount: number;
      failedCount: number;
      passRate: number;
      averageScore: number;
    };
  }
  ```

### **Interview Dashboard**
```
┌─── Student Interview Management ───┐
│ [Conduct Interview] [Interview History] [Score Analysis] │
│                                                          │
│ ┌─── Today's Interview Schedule ───┐                     │
│ │ Date: January 22, 2024                               │
│ │ Scheduled Interviews: 5                              │
│ │ Completed: 2 | Remaining: 3                         │
│ │ Next Interview: 10:30 AM - Mary Smith               │
│ │ [View Schedule] [Reschedule] [Add Interview]         │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Pending Interviews ───┐                            │
│ │ Time     Student         Class    Status     Action   │
│ │ 10:30 AM Mary Smith      Form 3   Scheduled  [Start] │
│ │ 11:00 AM Peter Johnson   Form 2   Scheduled  [Start] │
│ │ 11:30 AM Sarah Williams  Form 1   Scheduled  [Start] │
│ │ 2:00 PM  Michael Brown   Form 4   Scheduled  [Start] │
│ │ 2:30 PM  Lisa Davis      Form 1   Scheduled  [Start] │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Recent Interview Results ───┐                       │
│ │ Student: John Doe | Score: 16/20 | Status: Passed    │
│ │ Comments: Excellent communication, good academic base │
│ │ Recommended: Form 1A (Science Stream)                │
│ │ [View Details] [Assign to Subclass]                  │
│ │ ─────────────────────────────────────────────────    │
│ │ Student: Alice Johnson | Score: 12/20 | Status: Passed│
│ │ Comments: Average performance, needs support         │
│ │ Recommended: Form 1B (General Stream)               │
│ │ [View Details] [Assign to Subclass]                  │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### **Conduct Interview** (`/vice-principal/interviews/:studentId/conduct`)
```
┌─── Conduct Interview - Mary Smith ───┐
│ Student: Mary Smith (STU2024002)       │
│ Target Class: Form 3                   │
│ Interview Date: January 22, 2024       │
│ Interview Time: 10:30 AM               │
│                                        │
│ ┌─── Interview Assessment ───┐          │
│ │ ┌─ Academic Knowledge (8 points) ─┐   │
│ │ │ Mathematics: [__]/2              │   │
│ │ │ English: [__]/2                  │   │
│ │ │ Science: [__]/2                  │   │
│ │ │ General Knowledge: [__]/2        │   │
│ │ └─────────────────────────────────┘   │
│ │                                      │
│ │ ┌─ Communication Skills (6 points) ─┐ │
│ │ │ Oral Expression: [__]/3           │ │
│ │ │ Comprehension: [__]/3             │ │
│ │ └─────────────────────────────────┘ │
│ │                                      │
│ │ ┌─ Behavioral Assessment (6 points)─┐ │
│ │ │ Confidence: [__]/2                │ │
│ │ │ Respect: [__]/2                   │ │
│ │ │ Motivation: [__]/2                │ │
│ │ └─────────────────────────────────┘ │
│ │                                      │
│ │ Total Score: [__]/20                │
│ │ Pass Mark: 10/20                    │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌─── Interview Notes ───┐               │
│ │ Comments & Observations:              │
│ │ [Text Area]                          │
│ │                                      │
│ │ Recommendation:                      │
│ │ [○ Form 3A] [○ Form 3B] [○ Form 3C]  │
│ │ [○ Refer for Special Support]        │
│ └────────────────────────────────────┘ │
│                                        │
│ [Record Interview] [Save Draft] [Cancel]│
└──────────────────────────────────────────┘
```

### **Interview Results Summary**
```
┌─── Interview Completed Successfully ───┐
│ ✅ Interview Recorded                   │
│                                        │
│ Student: Mary Smith                     │
│ Final Score: 14/20                      │
│ Result: PASSED ✅                       │
│                                        │
│ Breakdown:                             │
│ • Academic Knowledge: 6/8              │
│ • Communication Skills: 4/6            │
│ • Behavioral Assessment: 4/6           │
│                                        │
│ Recommendation: Form 3B                │
│ Comments: Good potential, needs support│
│                                        │
│ ┌─── Next Steps ───┐                   │
│ │ [Assign to Subclass]                 │
│ │ [Schedule Parent Meeting]            │
│ │ [Send Results to Bursar]             │
│ │ [Interview Next Student]             │
│ └──────────────────────────────────────┘
│                                        │
│ [Close] [Print Certificate]            │
└──────────────────────────────────────────┘
```

## Subclass Assignment (`/vice-principal/assignments`)

### **API Integration**

#### **1. Get Students Ready for Assignment**
**Endpoint:** `GET /api/v1/vice-principal/students/ready-for-assignment`
- **Query Parameters:**
  ```typescript
  {
    classId?: number;
    academicYearId?: number;
    page?: number;
    limit?: number;
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      name: string;
      matricule: string;
      targetClass: {
        id: number;
        name: string;
      };
      interviewResult: {
        totalScore: number;
        maxScore: number;
        percentage: number;
        recommendedSubclass?: {
          id: number;
          name: string;
          currentCapacity: number;
          maxCapacity: number;
          availableSpots: number;
        };
        comments: string;
      };
      interviewDate: string;
      interviewedBy: {
        id: number;
        name: string;
      };
    }>;
  }
  ```

#### **2. Get Subclass Capacity**
**Endpoint:** `GET /api/v1/vice-principal/subclasses/capacity`
- **Query Parameters:**
  ```typescript
  {
    classId?: number;
    academicYearId?: number;
  }
  ```
- **Response Data:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      name: string;              // "Form 1A"
      className: string;         // "Form 1"
      capacity: {
        current: number;         // Current student count
        maximum: number;         // Maximum capacity
        available: number;       // Available spots
        percentage: number;      // Capacity percentage
      };
      classMaster?: {
        id: number;
        name: string;
      };
      academicFocus?: string;    // "Science", "Arts", "General"
    }>;
  }
  ```

#### **3. Assign Student to Subclass**
**Endpoint:** `POST /api/v1/vice-principal/assignments`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    subclassId: number;
    academicYearId?: number;
    assignmentReason?: string;
    notes?: string;
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      enrollmentId: number;
      student: {
        id: number;
        name: string;
        matricule: string;
      };
      subclass: {
        id: number;
        name: string;
        className: string;
      };
      academicYear: {
        id: number;
        name: string;
      };
      assignedAt: string;
      assignedBy: {
        id: number;
        name: string;
      };
    };
  }
  ```

#### **4. Bulk Assignment**
**Endpoint:** `POST /api/v1/vice-principal/assignments/bulk`
- **Request Body:**
  ```typescript
  {
    assignments: Array<{
      studentId: number;
      subclassId: number;
      notes?: string;
    }>;
    academicYearId?: number;
  }
  ```

### **Assignment Dashboard**
```
┌─── Subclass Assignment Management ───┐
│ [Ready for Assignment] [Capacity View] [Assignment History] │
│                                                            │
│ ┌─── Students Ready for Assignment ───┐                    │
│ │ Total Ready: 15 students | Last Updated: 2 hours ago    │
│ │ Classes Available: Form 1-5 | Avg Capacity: 85%         │
│ │ [Bulk Assign] [Auto-Assign] [Manual Review]             │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ Student       Score  Recommended   Current    Action       │
│ John Doe      16/20  Form 1A       Available  [Assign]    │
│ Mary Smith    18/20  Form 3A       Available  [Assign]    │
│ Peter Johnson 14/20  Form 2B       Available  [Assign]    │
│ Sarah Williams 15/20 Form 1A       Full       [Reassign]  │
│ Michael Brown 12/20  Form 4C       Available  [Assign]    │
│                                                            │
│ [Select All] [Bulk Actions ▼] [Export List]               │
│                                                            │
│ ┌─── Subclass Capacity Overview ───┐                       │
│ │ Subclass     Capacity    Available  Master      Status  │
│ │ Form 1A      28/30      2 spots    Mr. Johnson  🟢      │
│ │ Form 1B      30/30      0 spots    Mrs. Smith   🔴      │
│ │ Form 1C      25/30      5 spots    Mr. Brown    🟢      │
│ │ Form 2A      29/30      1 spot     Mrs. Davis   🟡      │
│ │ [View All Classes] [Capacity Report]                   │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Assignment Modal**
```
┌─── Assign Student - John Doe ───┐
│ Student: John Doe (STU2024001)   │
│ Interview Score: 16/20 (80%)     │
│ Recommended: Form 1A             │
│                                  │
│ ┌─── Available Subclasses ───┐   │
│ │ ● Form 1A (2 spots) - Science  │
│ │ ○ Form 1B (0 spots) - Full     │
│ │ ○ Form 1C (5 spots) - General  │
│ │ ○ Form 1D (3 spots) - Arts     │
│ │                                │
│ │ Selected: Form 1A              │
│ │ Class Master: Mr. Johnson      │
│ │ Focus: Science Stream          │
│ └──────────────────────────────┘ │
│                                  │
│ Assignment Notes:                │
│ [Text Area]                      │
│                                  │
│ [Confirm Assignment] [Cancel]    │
└────────────────────────────────┘
```

## Class Management (`/vice-principal/classes`)

### **API Integration**

#### **1. Get All Classes and Subclasses**
**Endpoint:** `GET /api/v1/vice-principal/classes`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    includeCapacity?: boolean;    // Include enrollment counts
    classId?: number;             // Filter specific class
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: Array<{
      id: number;
      name: string;             // "Form 1", "Form 2", etc.
      maxStudents: number;      // Maximum students per class
      baseFee: number;
      totalSubclasses: number;
      totalEnrollment: number;
      capacityUtilization: number; // Percentage
      subclasses: Array<{
        id: number;
        name: string;           // "Form 1A", "Form 1B", etc.
        currentStudents: number;
        maxCapacity: number;    // Usually 30 per subclass
        availableSpots: number;
        utilizationRate: number; // Percentage
        classMaster?: {
          id: number;
          name: string;
          email: string;
        };
        academicFocus?: string; // "Science", "Arts", "General"
        status: "OPTIMAL" | "UNDERUTILIZED" | "OVERLOADED" | "FULL";
        enrolledStudents?: Array<{
          id: number;
          name: string;
          matricule: string;
          enrollmentDate: string;
        }>;
      }>;
      averageClassSize: number;
      recommendedActions: Array<{
        type: "BALANCE_ENROLLMENT" | "CREATE_SUBCLASS" | "MERGE_SUBCLASS";
        description: string;
        priority: "HIGH" | "MEDIUM" | "LOW";
      }>;
    }>;
    summary: {
      totalClasses: number;
      totalSubclasses: number;
      totalStudents: number;
      totalCapacity: number;
      overallUtilization: number;
      availableSpots: number;
      classesNeedingAttention: number;
    };
  }
  ```

#### **2. Transfer Student**
**Endpoint:** `POST /api/v1/vice-principal/students/transfer`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    fromSubclassId: number;
    toSubclassId: number;
    reason: string;
    notes?: string;
    effectiveDate?: string;       // "YYYY-MM-DD"
  }
  ```

#### **3. Create New Subclass**
**Endpoint:** `POST /api/v1/subclasses`
- **Request Body:**
  ```typescript
  {
    name: string;                 // "Form 1D"
    classId: number;
    capacity: number;
    classMasterId?: number;
    academicFocus?: string;       // "Science", "Arts", "General"
    description?: string;
  }
  ```

### **Class Management Dashboard**
```
┌─── Class & Subclass Management ───┐
│ [Capacity Overview] [Student Transfers] [Create Subclass] │
│                                                           │
│ ┌─── Class Distribution Summary ───┐                      │
│ │ Academic Year: 2024-2025                               │
│ │ Total Classes: 5 | Total Subclasses: 48               │
│ │ Total Students: 1,245 | Average per Subclass: 26      │
│ │ Capacity Utilization: 85% | Available Spots: 187      │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Class    Subclasses  Students  Capacity  Utilization     │
│ Form 1   10          301       330       91%             │
│ Form 2   10          289       330       88%             │
│ Form 3   10          267       330       81%             │
│ Form 4   9           245       297       82%             │
│ Form 5   9           243       297       82%             │
│                                                           │
│ ┌─── Subclass Details - Form 1 ───┐                      │
│ │ Subclass  Students  Capacity  Master      Focus   Action│
│ │ Form 1A   30        30        Mr. Johnson  Science [Edit]│
│ │ Form 1B   30        30        Mrs. Smith   General [Edit]│
│ │ Form 1C   28        30        Mr. Brown    Arts    [Edit]│
│ │ Form 1D   25        30        Mrs. Davis   General [Edit]│
│ │ [View All] [Add Subclass] [Rebalance]                  │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Reports & Analytics (`/vice-principal/reports`)

### **API Integration**

#### **1. Generate Enrollment Report**
**Endpoint:** `GET /api/v1/vice-principal/reports/enrollment`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    reportType: "PIPELINE" | "CAPACITY" | "INTERVIEW_ANALYSIS" | "ASSIGNMENT_SUMMARY";
    dateRange?: {
      from: string;             // "YYYY-MM-DD"
      to: string;               // "YYYY-MM-DD"
    };
    academicYearId?: number;
    format?: "json" | "excel" | "pdf";
    classId?: number;           // Filter by specific class
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      reportInfo: {
        type: "PIPELINE" | "CAPACITY" | "INTERVIEW_ANALYSIS" | "ASSIGNMENT_SUMMARY";
        generatedAt: string;
        generatedBy: string;
        academicYear: string;
        dateRange: {
          from: string;
          to: string;
        };
        filters: {
          classId?: number;
        };
      };
      executiveSummary: {
        totalStudentsProcessed: number;
        enrollmentTarget: number;
        completionRate: number;
        averageProcessingTime: number; // days
        currentPipelineEfficiency: number; // percentage
      };
      detailedMetrics: {
        pipeline?: {
          newRegistrations: number;
          interviewsPending: number;
          interviewsCompleted: number;
          studentsAssigned: number;
          studentsEnrolled: number;
        };
        capacity?: {
          totalClasses: number;
          totalSubclasses: number;
          currentCapacity: number;
          availableSpots: number;
          utilizationRate: number;
        };
        interviewAnalysis?: {
          totalInterviews: number;
          passRate: number;
          averageScore: number;
          scoreDistribution: {
            excellent: number; // 18-20
            good: number;      // 15-17
            average: number;   // 10-14
            below: number;     // <10
          };
        };
        assignmentSummary?: {
          studentsAssigned: number;
          averageAssignmentTime: number;
          subclassDistribution: Array<{
            subclassName: string;
            studentsAssigned: number;
            utilizationRate: number;
          }>;
        };
      };
      trends: Array<{
        period: string;
        metric: string;
        value: number;
        trend: "INCREASING" | "DECREASING" | "STABLE";
      }>;
      recommendations: Array<{
        priority: "HIGH" | "MEDIUM" | "LOW";
        category: string;
        recommendation: string;
        impact: string;
        timeline: string;
      }>;
      downloadUrl?: string; // If format is "excel" or "pdf"
    };
  }
  ```

#### **2. Get Interview Statistics**
**Endpoint:** `GET /api/v1/vice-principal/analytics/interviews`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    dateRange?: {
      from: string;             // "YYYY-MM-DD"
      to: string;               // "YYYY-MM-DD"
    };
    classId?: number;           // Filter by target class
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    data: {
      summary: {
        totalInterviews: number;
        completedInterviews: number;
        pendingInterviews: number;
        passRate: number;        // Percentage
        failRate: number;        // Percentage
        averageScore: number;
        averageInterviewTime: number; // minutes
      };
      scoreAnalysis: {
        distribution: {
          excellent: number;     // 18-20 points
          good: number;          // 15-17 points
          average: number;       // 10-14 points
          below: number;         // <10 points
        };
        byCategory: {
          academicKnowledge: {
            average: number;
            passRate: number;
          };
          communicationSkills: {
            average: number;
            passRate: number;
          };
          behaviorAssessment: {
            average: number;
            passRate: number;
          };
        };
        topPerformers: Array<{
          studentName: string;
          score: number;
          targetClass: string;
          recommendedSubclass: string;
        }>;
      };
      timeAnalysis: {
        averageInterviewDuration: number; // minutes
        peakInterviewTimes: Array<{
          timeSlot: string;      // "09:00-10:00"
          interviewCount: number;
          averageScore: number;
        }>;
        interviewBacklog: {
          currentBacklog: number;
          averageWaitTime: number; // days
          projectedClearanceDate: string;
        };
      };
      trends: {
        monthly: Array<{
          month: string;
          totalInterviews: number;
          passRate: number;
          averageScore: number;
        }>;
        weekly: Array<{
          week: string;
          interviewsCompleted: number;
          efficiency: number;    // percentage
        }>;
      };
      classBreakdown: Array<{
        classId: number;
        className: string;
        totalInterviews: number;
        passRate: number;
        averageScore: number;
        studentsAssigned: number;
      }>;
      recommendations: Array<{
        area: string;            // "INTERVIEW_PROCESS" | "SCORING_CRITERIA" | "TIME_MANAGEMENT"
        recommendation: string;
        priority: "HIGH" | "MEDIUM" | "LOW";
        expectedImpact: string;
      }>;
    };
  }
  ```

### **Reports Dashboard**
```
┌─── VP Reports & Analytics ───┐
│ [Enrollment Reports] [Interview Analysis] [Capacity Planning] │
│                                                              │
│ ┌─── Quick Report Generation ───┐                            │
│ │ Report Type: [Enrollment Pipeline ▼]                      │
│ │ Date Range: [Last 30 days ▼]                              │
│ │ Academic Year: [2024-2025 ▼]                              │
│ │ Format: [PDF ●] [Excel ○] [Summary ○]                     │
│ │ [Generate Report] [Schedule Auto-Report]                  │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── Key Metrics ───┐                                        │
│ │ Pipeline Efficiency: 98% (Target: 95%)                    │
│ │ Interview Pass Rate: 94% (Industry: 85%)                  │
│ │ Capacity Utilization: 85% (Optimal: 80-90%)               │
│ │ Average Assignment Time: 2.5 days                         │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── Recent Reports ───┐                                     │
│ │ 📄 Monthly Enrollment Report - Jan 2024    [Download]     │
│ │ 📄 Interview Analysis - Q1 2024            [Download]     │
│ │ 📄 Capacity Planning Report - Jan 2024     [Download]     │
│ │ 📄 Student Assignment Summary - Week 3      [Download]     │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Error Handling & Loading States

### **API Error Handling**
```typescript
// Standard error response format
{
  success: false;
  error: string; // User-friendly error message
}

// VP-specific error scenarios:
// 400: "Invalid interview score" | "Student already assigned"
// 403: "Interview already completed" | "Cannot modify assignment"
// 404: "Student not found" | "Subclass not found"
// 409: "Subclass at capacity" | "Interview time conflict"
// 500: "Assignment failed" | "Interview save failed"
```

### **Loading & Validation States**
- Interview score validation (0-20 scale)
- Subclass capacity checking before assignment
- Real-time capacity updates
- Interview time conflict detection
- Auto-save interview progress

### **Success Feedback**
- Interview completion confirmations
- Assignment success notifications
- Bulk operation progress indicators
- Parent notification status
- Pipeline status updates

**Frontend Implementation Notes:**
1. Implement interview scoring with real-time calculation
2. Add capacity warnings before assignments
3. Use optimistic updates for assignments
4. Cache subclass capacity data with periodic refresh
5. Implement proper interview session management
6. Add bulk operation progress tracking
7. Use proper form validation for interview scores
8. Implement conflict detection for interview scheduling
9. Add auto-save for interview drafts
10. Use efficient pagination for large student lists
