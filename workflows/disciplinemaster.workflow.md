# DISCIPLINE_MASTER (SDM) Role - Complete Workflow & UX Design

## Post-Login Discipline Master Dashboard (`/discipline-master/dashboard`)

### **API Integration**

#### **1. Get Discipline Master Dashboard**
**Endpoint:** `GET /api/v1/discipline-master/dashboard`
- **Headers:** `Authorization: Bearer <token>`
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
        resolutionRate: number;
      }>;
    };
  }
  ```

#### **2. Record Morning Lateness**
**Endpoint:** `POST /api/v1/discipline/lateness`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    date?: string;           // "YYYY-MM-DD", defaults to today
    arrivalTime: string;     // "HH:mm"
    reason?: string;
    academicYearId?: number;
  }
  ```

#### **3. Record Bulk Morning Lateness**
**Endpoint:** `POST /api/v1/discipline/lateness/bulk`
- **Request Body:**
  ```typescript
  {
    students: Array<{
      studentId: number;
      arrivalTime: string;  // "HH:mm"
      reason?: string;
    }>;
    date?: string;           // "YYYY-MM-DD", defaults to today
    academicYearId?: number;
  }
  ```

#### **4. Record Discipline Issue**
**Endpoint:** `POST /api/v1/discipline`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    issueType: string;       // "MISCONDUCT" | "MORNING_LATENESS" | "CLASS_ABSENCE" | "OTHER"
    description: string;
    dateOccurred?: string;   // "YYYY-MM-DD", defaults to today
    severity?: "LOW" | "MEDIUM" | "HIGH";
    actionTaken?: string;
    academicYearId?: number;
  }
  ```

#### **5. Get All Discipline Issues**
**Endpoint:** `GET /api/v1/discipline`
- **Query Parameters:**
  ```typescript
  {
    studentId?: number;
    classId?: number;
    subClassId?: number;
    startDate?: string;      // "YYYY-MM-DD"
    endDate?: string;        // "YYYY-MM-DD"
    description?: string;    // Search term
    academicYearId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
  ```

#### **6. Get Student Behavior Profile**
**Endpoint:** `GET /api/v1/discipline-master/student-profile/:studentId`
- **Query Parameters:** `{ academicYearId?: number }`
- **Response:**
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

#### **7. Get Behavioral Analytics**
**Endpoint:** `GET /api/v1/discipline-master/behavioral-analytics`
- **Query Parameters:** `{ academicYearId?: number }`

#### **8. Get Early Warning System**
**Endpoint:** `GET /api/v1/discipline-master/early-warning`
- **Query Parameters:** `{ academicYearId?: number }`

#### **9. Get Discipline Statistics**
**Endpoint:** `GET /api/v1/discipline-master/statistics`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    startDate?: string;      // "YYYY-MM-DD"
    endDate?: string;        // "YYYY-MM-DD"
    classId?: number;
  }
  ```

#### **10. Get Lateness Statistics**
**Endpoint:** `GET /api/v1/discipline/lateness/statistics`
- **Query Parameters:**
  ```typescript
  {
    startDate?: string;
    endDate?: string;
    classId?: number;
    subClassId?: number;
    academicYearId?: number;
  }
  ```

#### **11. Get Daily Lateness Report**
**Endpoint:** `GET /api/v1/discipline/lateness/daily-report`
- **Query Parameters:**
  ```typescript
  {
    date?: string;           // "YYYY-MM-DD", defaults to today
    academicYearId?: number;
  }
  ```

#### **12. Create Intervention Plan**
**Endpoint:** `POST /api/v1/discipline-master/interventions`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    interventionType: string;
    description: string;
    expectedEndDate?: string;  // "YYYY-MM-DD"
    assignedTo: string;
  }
  ```

#### **13. Update Intervention Status**
**Endpoint:** `PUT /api/v1/discipline-master/interventions/:interventionId`
- **Request Body:**
  ```typescript
  {
    status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
    outcome?: "SUCCESSFUL" | "PARTIALLY_SUCCESSFUL" | "UNSUCCESSFUL";
    notes?: string;
    effectiveness?: number;
  }
  ```

#### **14. Get Intervention Tracking**
**Endpoint:** `GET /api/v1/discipline-master/interventions`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    status?: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
    studentId?: number;
  }
  ```

#### **15. Generate Discipline Report**
**Endpoint:** `GET /api/v1/discipline-master/reports`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    reportType?: string;      // Default: "comprehensive"
    startDate?: string;       // "YYYY-MM-DD"
    endDate?: string;         // "YYYY-MM-DD"
  }
  ```

### **Main Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ [🏠] School Management System    [🔔] [👤] [⚙️] [🚪]    │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [SDM Name] | Academic Year: 2024-2025     │
│ Student Discipline Master - Behavioral Management       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Daily Discipline Overview ───┐                     │
│ │ 📅 Today: January 22, 2024      ⏰ Time: 08:45 AM     │
│ │ 🚨 Active Issues: 12             📝 New Reports: 3     │
│ │ ⏰ Late Arrivals: 8              ❌ Absences: 15      │
│ │ ⚠️ Pending Reviews: 5            📊 Weekly Total: 45   │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Morning Attendance Status ───┐ ┌─── Priority Cases ───┐│
│ │ School Start Time: 07:30 AM      │ │ 🚨 Serious Issues: 2   ││
│ │ Students Present: 1,187 (95%)    │ │ • Fighting incident    ││
│ │ Late Arrivals: 8 students        │ │ • Repeated misconduct  ││
│ │ Absent: 15 students              │ │                       ││
│ │ Unexcused Absences: 6            │ │ ⚠️ Escalation Needed: 3││
│ │ [Record Lateness] [Mark Absent]  │ │ • 5th lateness offense ││
│ │                                  │ │ • Parent contact req.  ││
│ │ Latest Late Arrival: 08:15 AM    │ │ • VP review pending    ││
│ │ [View All] [Daily Report]        │ │ [Review Cases]         ││
│ └─────────────────────────────────┘ └─────────────────────┘│
│                                                         │
│ ┌─── This Week's Trends ───┐                            │
│ │ 📈 Total Incidents: 45 (↑12% from last week)          │
│ │ 🕐 Morning Lateness: 52% of all issues                │
│ │ 📚 Class Absences: 31% of all issues                  │
│ │ ⚠️ Misconduct Cases: 17% of all issues                │
│ │ 🎯 Most Affected: Form 3 & Form 4 students            │
│ │ [Weekly Analysis] [Generate Report] [Action Plan]     │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Morning Attendance Management (`/discipline-master/attendance`)

### **Daily Attendance Dashboard**
```
┌─── Daily Attendance Management ───┐
│ [Record Lateness] [Mark Absences] [Daily Report] [Statistics] │
│                                                              │
│ ┌─── Today's Attendance Status ───┐                          │
│ │ Date: Monday, January 22, 2024                            │
│ │ School Start Time: 07:30 AM | Current Time: 08:45 AM      │
│ │ Total Students: 1,245                                     │
│ │ Present: 1,187 (95.3%)                                    │
│ │ Late Arrivals: 8 (0.6%)                                   │
│ │ Absent: 50 (4.0%)                                         │
│ │ Excused Absences: 44 | Unexcused: 6                      │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── Late Arrivals Today ───┐                               │
│ │ Student Name    Class    Arrival Time  Reason    Action   │
│ │ John Doe        Form 5A  07:45 AM     Transport [Record] │
│ │ Mary Smith      Form 3B  08:00 AM     Family    [Record] │
│ │ Peter Johnson   Form 4A  08:15 AM     Traffic   [Record] │
│ │ Sarah Williams  Form 2C  07:50 AM     Medical   [Record] │
│ │ [View All Late Arrivals] [Bulk Record] [Send Alerts]      │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─── Absent Students ───┐                                    │
│ │ [Filter: All ▼] [Class ▼] [Excused/Unexcused ▼]          │
│ │ Student Name    Class    Type        Last Contact Action  │
│ │ Michael Brown   Form 1B  Unexcused   Never       [Contact]│
│ │ Lisa Davis      Form 6A  Excused     Today       [Mark]   │
│ │ James Wilson    Form 4C  Unexcused   Yesterday   [Follow] │
│ │ [Mark Present] [Contact Parents] [Generate Letters]       │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### **Record Morning Lateness** (`/discipline-master/lateness/record`)
```
┌─── Record Morning Lateness ───┐
│ ┌─── Single Student Entry ───┐ │
│ │ Student Search: [Text Input with autocomplete]          │
│ │ Selected: John Doe (STU2024001) - Form 5A             │
│ │                                                        │
│ │ Arrival Time: [08:15] AM                               │
│ │ Date: [2024-01-22] (Today)                             │
│ │ Reason: [Transport delay ▼]                            │
│ │ • Transport delay    • Family emergency                │
│ │ • Traffic jam       • Medical appointment              │
│ │ • Overslept         • Other (specify)                 │
│ │                                                        │
│ │ Additional Notes: [Text Area]                          │
│ │ [Record Lateness] [Clear] [Cancel]                     │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── OR Bulk Entry ───┐                                  │
│ │ [Upload CSV] [Manual Bulk Entry] [Gate Scanner Data]   │
│ │                                                        │
│ │ Student           Class   Time    Reason     Action    │
│ │ Mary Smith        3B      08:00   Family    [Add]     │
│ │ Peter Johnson     4A      08:15   Traffic   [Add]     │
│ │ Sarah Williams    2C      07:50   Medical   [Add]     │
│ │                                                        │
│ │ [Process All] [Review] [Clear All]                     │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Recent Late Students Alert ───┐                     │
│ │ ⚠️ Repeat Offenders This Week:                         │
│ │ • Alice Brown (4th time) - Form 3A                    │
│ │ • David Jones (3rd time) - Form 4B                    │
│ │ [Take Action] [Contact Parents] [Escalate]             │
│ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Discipline Issue Management (`/discipline-master/incidents`)

### **Discipline Issues Dashboard**
```
┌─── Discipline Issues Management ───┐
│ [Record New Issue] [Active Cases] [Resolved] [Reports] [Trends] │
│                                                                 │
│ ┌─── Current Active Issues ───┐                                 │
│ │ Total Active: 12 cases                                       │
│ │ High Priority: 2 | Medium: 7 | Low: 3                       │
│ │ Awaiting Principal Review: 2                                 │
│ │ Parent Contact Required: 5                                   │
│ │ Average Resolution Time: 3.2 days                            │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Priority Cases Requiring Immediate Attention ───┐          │
│ │ 🚨 HIGH: Fighting Incident - John Doe (Form 5A)               │
│ │ Date: Jan 20 | Status: Under Investigation                   │
│ │ Action: Principal review scheduled                            │
│ │ [Review] [Update] [Schedule Hearing]                         │
│ │ ───────────────────────────────────────────────────         │
│ │ 🚨 HIGH: Repeated Misconduct - Mary Smith (Form 4B)           │
│ │ Date: Jan 19 | Status: 5th offense this term                │
│ │ Action: Suspension consideration                              │
│ │ [Review] [Contact Parent] [Escalate to VP]                   │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Recent Issues (Last 7 Days) ───┐                          │
│ │ Date     Student      Type         Status      Action         │
│ │ Jan 22   Alice Brown  Lateness     Pending     [Handle]       │
│ │ Jan 21   David Jones  Absence      Resolved    [View]         │
│ │ Jan 20   John Doe     Fighting     Active      [Review]       │
│ │ Jan 19   Mary Smith   Misconduct   Escalated   [Follow Up]    │
│ │ Jan 18   Peter Kim    Lateness     Resolved    [View]         │
│ │ [View All] [Filter] [Export] [Statistics]                    │
│ └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### **Record New Discipline Issue** (`/discipline-master/incidents/create`)
```
┌─── Record New Discipline Issue ───┐
│ ┌─── Student Information ───┐      │
│ │ Student Search: [Text Input]     │
│ │ Selected: Alice Brown           │
│ │ Class: Form 3A                  │
│ │ Matricule: STU2024015          │
│ │ Previous Issues: 2 this term    │
│ │ [Change Student]                │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─── Incident Details ───┐        │
│ │ Issue Type: [Misconduct ▼]      │
│ │ • Morning Lateness             │
│ │ • Class Absence                │
│ │ • Misconduct                   │
│ │ • Other                        │
│ │                                │
│ │ Date Occurred: [2024-01-22]    │
│ │ Time: [10:30] AM               │
│ │ Location: [Classroom 201]      │
│ │                                │
│ │ Severity: [Medium ▼]           │
│ │ • Low    • Medium    • High    │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─── Incident Description ───┐    │
│ │ Description: [Text Area]        │
│ │ What happened, when, where,     │
│ │ who was involved, witnesses     │
│ │                                │
│ │ Immediate Action Taken:         │
│ │ [Text Area]                    │
│ │                                │
│ │ Witnesses: [Text Area]          │
│ │ List any witnesses present      │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─── Follow-up Actions ───┐       │
│ │ [☑️] Contact Parent             │
│ │ [☐] Schedule Counseling         │
│ │ [☐] Refer to VP                │
│ │ [☐] Refer to Principal          │
│ │ [☐] Issue Warning              │
│ │ [☐] Assign Detention           │
│ │                                │
│ │ Additional Notes:               │
│ │ [Text Area]                    │
│ └──────────────────────────────┘ │
│                                  │
│ [Record Issue] [Save Draft] [Cancel] │
└────────────────────────────────────┘
```

### **Issue Details & Management** (`/discipline-master/incidents/:issueId`)
```
┌─── Discipline Issue Details ───┐
│ Issue ID: DISC2024001           │
│ Student: Alice Brown (Form 3A)  │
│ Type: Classroom Misconduct      │
│ Date: January 22, 2024          │
│ Status: Under Review            │
│                                │
│ ┌─── Incident Summary ───┐      │
│ │ Type: Misconduct              │
│ │ Severity: Medium              │
│ │ Location: Classroom 201       │
│ │ Time: 10:30 AM                │
│ │ Reported by: Mr. Johnson      │
│ │ Description: Disruptive       │
│ │ behavior during math class,   │
│ │ refused to follow instructions│
│ │ and argued with teacher       │
│ └─────────────────────────────┘ │
│                                │
│ ┌─── Student History ───┐       │
│ │ Previous Issues: 2 this term  │
│ │ • Oct 2023: Late arrival      │
│ │ • Nov 2023: Class disruption  │
│ │ Academic Performance: Average │
│ │ Attendance Rate: 92%          │
│ └─────────────────────────────┘ │
│                                │
│ ┌─── Actions Taken ───┐         │
│ │ ✅ Parent contacted           │
│ │ ✅ Student counseled          │
│ │ ⏳ Teacher meeting scheduled  │
│ │ ⏳ Progress monitoring        │
│ │                              │
│ │ Resolution Plan:              │
│ │ [Text Area showing plan]      │
│ └─────────────────────────────┘ │
│                                │
│ ┌─── Case Actions ───┐          │
│ │ [Update Status] [Add Notes]   │
│ │ [Contact Parent] [Schedule Meeting] │
│ │ [Escalate to VP] [Close Case] │
│ │ [Print Report] [Send Alert]   │
│ └─────────────────────────────┘ │
└───────────────────────────────────┘
```

## Student Behavioral Tracking (`/discipline-master/students`)

### **Student Behavioral Profiles**
```
┌─── Student Behavioral Tracking ───┐
│ [Search Students] [High Risk] [Patterns] [Interventions] │
│                                                          │
│ ┌─── Search & Filter ───┐                               │
│ │ Student: [Search by name/matricule]                   │
│ │ Class: [All ▼] | Issues: [Any ▼] [None] [1-3] [4+]   │
│ │ Date Range: [Last 30 days ▼]                         │
│ │ Type: [All ▼] [Lateness] [Absence] [Misconduct]      │
│ │ [Apply Filters] [Clear] [Export List]                │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Students Requiring Attention ───┐                   │
│ │ 🚨 High Risk (4+ issues this term)                    │
│ │ Student         Class   Issues  Last Issue   Action   │
│ │ Alice Brown     3A      5       Jan 22      [Review]  │
│ │ David Jones     4B      4       Jan 20      [Review]  │
│ │ Michael Smith   2C      4       Jan 18      [Review]  │
│ │                                                       │
│ │ ⚠️ Moderate Risk (2-3 issues)                         │
│ │ Student         Class   Issues  Last Issue   Action   │
│ │ Sarah Johnson   5A      3       Jan 15      [Monitor] │
│ │ Peter Williams  1B      2       Jan 12      [Monitor] │
│ │ Lisa Davis      6C      2       Jan 10      [Monitor] │
│ │                                                       │
│ │ [Bulk Action] [Generate Intervention Plan] [Parent Meeting] │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─── Behavioral Patterns Analysis ───┐                   │
│ │ Common Issues: Morning Lateness (52%)                 │
│ │ Peak Times: Monday mornings, Friday afternoons        │
│ │ Most Affected Classes: Form 3 & Form 4               │
│ │ Seasonal Trends: Increase during exam periods         │
│ │ [Detailed Analysis] [Prevention Strategies]           │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### **Individual Student Profile** (`/discipline-master/students/:studentId`)
```
┌─── Student Behavioral Profile - Alice Brown ───┐
│ ┌─── Student Information ───┐                    │
│ │ Name: Alice Brown          │                    │
│ │ Class: Form 3A             │                    │
│ │ Matricule: STU2024015      │                    │
│ │ Age: 15 years              │                    │
│ │ Parent: Mrs. Brown         │                    │
│ │ Contact: 677123456         │                    │
│ └──────────────────────────┘                    │
│                                                  │
│ ┌─── Behavioral Summary ───┐                     │
│ │ Risk Level: 🚨 HIGH                            │
│ │ Total Issues This Term: 5                      │
│ │ Issue Types:                                   │
│ │ • Lateness: 2 incidents                       │
│ │ • Misconduct: 2 incidents                     │
│ │ • Class Absence: 1 incident                   │
│ │ Last Issue: Jan 22, 2024                      │
│ │ Trend: ↗️ Increasing frequency                  │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌─── Issue History ───┐                          │
│ │ Date     Type        Description    Status     │
│ │ Jan 22   Misconduct  Class disrupt. Active     │
│ │ Jan 15   Lateness    Arrived 8:15   Resolved  │
│ │ Jan 10   Misconduct  Uniform issue  Resolved  │
│ │ Dec 18   Absence     Unexcused     Resolved   │
│ │ Dec 12   Lateness    Arrived 8:00   Resolved  │
│ │ [View Details] [Add New Issue] [Timeline View] │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌─── Intervention Plan ───┐                      │
│ │ Current Plan: Behavioral Support Program       │
│ │ Start Date: Jan 15, 2024                      │
│ │ Actions:                                       │
│ │ ✅ Parent meeting completed                    │
│ │ ⏳ Weekly counseling sessions                  │
│ │ ⏳ Teacher monitoring program                  │
│ │ ⏳ Progress review in 2 weeks                  │
│ │ [Update Plan] [Schedule Review] [Add Action]   │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌─── Quick Actions ───┐                          │
│ │ [Record New Issue] [Contact Parent] [Schedule Meeting] │
│ │ [Update Plan] [Generate Report] [Refer to Counselor]  │
│ └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

## Reports & Analytics (`/discipline-master/reports`)

### **Discipline Reports Dashboard**
```
┌─── Discipline Reports & Analytics ───┐
│ [Generate Report] [Daily Reports] [Trends] [Statistics] │
│                                                         │
│ ┌─── Quick Reports ───┐                                 │
│ │ [Daily Discipline Summary] [Weekly Incident Report]   │
│ │ [Monthly Trends Analysis] [Class Discipline Overview] │
│ │ [Lateness Statistics] [Parent Communication Log]     │
│ │ [Intervention Effectiveness] [Serious Incidents]     │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Today's Summary Report ───┐                        │
│ │ Date: January 22, 2024                               │
│ │ Total Incidents: 8                                   │
│ │ • Morning Lateness: 5                                │
│ │ • Class Absences: 2                                  │
│ │ • Misconduct: 1                                      │
│ │ Students Affected: 8                                 │
│ │ Parent Contacts Made: 3                              │
│ │ [Generate Full Report] [Print] [Email Principal]     │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Weekly Trends ───┐                                 │
│ │ [📊 Chart showing daily incident counts]              │
│ │ This Week: 45 total incidents                        │
│ │ Last Week: 38 total incidents (+18% increase)        │
│ │ Most Common: Morning Lateness (52%)                  │
│ │ Peak Day: Monday (28% of weekly incidents)           │
│ │ [Detailed Analysis] [Compare Previous Weeks]         │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Monthly Statistics ───┐                            │
│ │ January 2024 Summary:                                │
│ │ Total Incidents: 156                                 │
│ │ Resolved: 142 (91%)                                  │
│ │ Pending: 14 (9%)                                     │
│ │ Average Resolution Time: 2.8 days                    │
│ │ Parent Satisfaction: 87%                             │
│ │ Repeat Offenders: 23 students                        │
│ │ [Full Monthly Report] [Export Data] [Share]          │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### **Generate Custom Report** (`/discipline-master/reports/generate`)
```
┌─── Generate Custom Discipline Report ───┐
│ ┌─── Report Configuration ───┐           │
│ │ Report Type: [Custom ▼]                │
│ │ • Daily Summary                        │
│ │ • Weekly Analysis                      │
│ │ • Monthly Trends                       │
│ │ • Student Profile                      │
│ │ • Class Analysis                       │
│ │ • Custom Range                         │
│ │                                       │
│ │ Date Range:                           │
│ │ From: [2024-01-01] To: [2024-01-22]   │
│ │                                       │
│ │ Include:                              │
│ │ [☑️] Incident summaries               │
│ │ [☑️] Student statistics               │
│ │ [☑️] Trend analysis                   │
│ │ [☑️] Resolution status                │
│ │ [☑️] Parent communications            │
│ │ [☐] Photos/Evidence                   │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─── Filters ───┐                       │
│ │ Classes: [All ▼] [Select Multiple]    │
│ │ Issue Types: [All ▼] [Select Multiple]│
│ │ Severity: [All ▼] [Low/Med/High]      │
│ │ Status: [All ▼] [Active/Resolved]     │
│ │ Students: [All ▼] [High Risk Only]    │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─── Output Format ───┐                 │
│ │ Format: [PDF ●] [Excel ○] [CSV ○]     │
│ │ Include Charts: [Yes ●] [No ○]        │
│ │ Confidentiality: [Standard ●] [High ○]│
│ │ Distribution:                         │
│ │ [☑️] Principal                        │
│ │ [☑️] Vice Principal                   │
│ │ [☐] Class Masters                     │
│ │ [☐] Parent Committee                  │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Generate Report] [Preview] [Save Template] [Cancel] │
└───────────────────────────────────────────┘
```

## Communication Center (`/discipline-master/communications`)

### **Parent & Staff Communication**
```
┌─── Discipline Communications ───┐
│ [Send Notice] [Parent Meetings] [Staff Updates] [Templates] │
│                                                             │
│ ┌─── Quick Communication ───┐                               │
│ │ Type: [Parent Notice ▼]                                  │
│ │ • Parent Notice    • Teacher Alert                       │
│ │ • Principal Update • VP Briefing                        │
│ │ • Warning Letter   • Meeting Invitation                 │
│ │                                                         │
│ │ Recipients: [Select...]                                 │
│ │ Regarding Student: [Search Student]                     │
│ │ Issue Reference: [Select Issue]                         │
│ │ Priority: [Normal ▼] [High] [Urgent]                   │
│ │                                                         │
│ │ Message: [Template ▼] [Custom]                          │
│ │ [Text Editor with discipline templates]                 │
│ │                                                         │
│ │ [Send Message] [Save Draft] [Schedule Send]             │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Recent Communications ───┐                             │
│ │ Jan 22 - Parent Notice: Alice Brown's mother             │
│ │ Subject: Behavioral concern requiring attention          │
│ │ Status: Delivered ✅ | Response: Pending                │
│ │                                                         │
│ │ Jan 21 - Principal Update: Weekly discipline summary     │
│ │ Subject: 45 incidents this week, 3 requiring review     │
│ │ Status: Read ✅ | Response: Acknowledged                 │
│ │                                                         │
│ │ Jan 20 - Parent Meeting: David Jones' parents           │
│ │ Subject: Invitation for behavioral review meeting       │
│ │ Status: Confirmed ✅ | Meeting: Jan 25, 2:00 PM         │
│ │                                                         │
│ │ [View All] [Filter] [Follow Up]                         │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Parent Meeting Schedule ───┐                          │
│ │ This Week's Scheduled Meetings:                         │
│ │ Jan 23, 10:00 AM - Mrs. Brown (Alice's mother)         │
│ │ Jan 25, 2:00 PM  - Mr. & Mrs. Jones (David's parents)  │
│ │ Jan 26, 3:30 PM  - Mr. Smith (Michael's father)        │
│ │ [View Calendar] [Schedule New] [Send Reminders]         │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## Navigation Structure

### **Main Navigation**
```
🏠 Dashboard | 📅 Attendance | ⚠️ Incidents | 👨‍🎓 Students | 📊 Reports | 📧 Communications | ⚙️ Settings
```

### **Quick Actions (Always Visible)**
```
⚡ SDM Quick Actions:
• [Record Lateness]
• [Mark Absence]
• [New Incident]
• [Contact Parent]
• [Daily Report]
• [Emergency Alert]
```

### **Mobile Navigation**
```
[🏠 Home] [⏰ Attendance] [⚠️ Issues] [👨‍🎓 Students] [📊 Reports]
```

## Key Features for Discipline Master MVP:

### **Daily Operations:**
1. **Morning Attendance** - Track late arrivals and absences
2. **Incident Recording** - Document behavioral issues
3. **Real-time Monitoring** - Dashboard for immediate overview
4. **Priority Management** - Handle urgent cases first

### **Student Management:**
1. **Behavioral Tracking** - Individual student profiles
2. **Pattern Recognition** - Identify repeat offenders
3. **Intervention Planning** - Structured support programs
4. **Risk Assessment** - Early warning systems

### **Communication:**
1. **Parent Notifications** - Automated and manual alerts
2. **Staff Coordination** - Updates to VP and Principal
3. **Meeting Management** - Schedule and track conferences
4. **Documentation** - Comprehensive record keeping

### **Analytics & Reporting:**
1. **Trend Analysis** - Identify patterns and hotspots
2. **Statistical Reports** - Data-driven insights
3. **Performance Metrics** - Resolution times and success rates
4. **Stakeholder Updates** - Regular progress reports

## Critical UX Principles:

1. **Efficiency** - Quick data entry for daily operations
2. **Accessibility** - Mobile-friendly for field use
3. **Clarity** - Clear prioritization and status indicators
4. **Documentation** - Comprehensive record keeping
5. **Communication** - Seamless parent and staff coordination
6. **Analytics** - Data-driven decision making
7. **Compliance** - Proper procedures and documentation standards
