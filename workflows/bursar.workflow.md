# BURSAR Role - Complete Workflow & UX Design

## Post-Login Bursar Dashboard (`/bursar/dashboard`)

### **API Integration**
**Primary Endpoint:** `GET /api/v1/bursar/dashboard`
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
      totalFeesExpected: number;      // Total expected in FCFA
      totalFeesCollected: number;     // Total collected in FCFA
      pendingPayments: number;        // Count of students with pending payments
      collectionRate: number;         // Percentage (0-100)
      recentTransactions: number;     // Count of recent transactions
      newStudentsThisMonth: number;   // New registrations count
      studentsWithParents: number;    // Students linked to parent accounts
      studentsWithoutParents: number; // Students without parent links
      paymentMethods: Array<{
        method: string;             // "EXPRESS_UNION" | "CCA" | "3DC"
        count: number;              // Number of transactions
        totalAmount: number;        // Total amount via this method
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

### **Main Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│ [🏠] School Management System    [🔔] [👤] [⚙️] [🚪]    │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [Bursar Name] | Academic Year: 2024-2025  │
│ Financial Officer & Student Registration                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─── Financial Overview ───┐                           │
│ │ 💰 Total Expected: 15,500,000 FCFA                   │
│ │ 💵 Total Collected: 12,200,000 FCFA                  │
│ │ 📊 Collection Rate: 79%                               │
│ │ ⏰ Pending Payments: 127 students                     │
│ │ 📈 This Month: +2,100,000 FCFA                       │
│ │ 🎯 Target: 16,000,000 FCFA                           │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Recent Activity ───┐  ┌─── Pending Tasks ───┐      │
│ │ • Payment: 75,000 FCFA │  │ • 15 new students to      │
│ │   John Doe (Form 5A)   │  │   register fees           │
│ │ • Payment: 125,000 FCFA│  │ • 8 fee adjustment        │
│ │   Mary Smith (Form 3B) │  │   requests                │
│ │ • New student enrolled │  │ • Monthly report due      │
│ │   Peter Johnson       │  │   January 31              │
│ │ [View All] [Export]    │  │ [Handle Tasks]            │
│ └─────────────────────── │  └─────────────────────────┘ │
│                                                         │
│ ┌─── Quick Actions ───┐                                 │
│ │ [Register Student] [Record Payment] [Generate Report] │
│ │ [Fee Management] [Payment History] [Parent Accounts]  │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Student Registration (`/bursar/students/register`)

### **API Integration**

#### **1. Create Student with Parent Account**
**Endpoint:** `POST /api/v1/bursar/create-parent-with-student`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```typescript
  {
    studentName: string;
    dateOfBirth: string;        // "YYYY-MM-DD"
    placeOfBirth: string;
    gender: "MALE" | "FEMALE";
    residence: string;
    formerSchool?: string;
    classId: number;
    isNewStudent?: boolean;     // Defaults to true
    academicYearId?: number;    // Optional, defaults to current
    parentName: string;
    parentPhone: string;
    parentWhatsapp?: string;
    parentEmail?: string;
    parentAddress: string;
    relationship?: string;      // Defaults to "PARENT"
  }
  ```
- **Response:**
  ```typescript
  {
    success: true;
    message: "Student and parent created successfully";
    data: {
      student: {
        id: number;
        matricule: string;      // Auto-generated
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
        tempPassword: string;   // Temporary password for parent login
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

#### **2. Get Available Classes**
**Endpoint:** `GET /api/v1/classes`
- **Response:** List of all available classes

#### **3. Link Existing Parent**
**Endpoint:** `POST /api/v1/bursar/link-existing-parent`
- **Request Body:**
  ```typescript
  {
    studentId: number;
    parentId: number;
    relationship?: string;   // Defaults to "PARENT"
  }
  ```

#### **4. Get Available Parents**
**Endpoint:** `GET /api/v1/bursar/available-parents`
- **Query Parameters:**
  ```typescript
  {
    search?: string;        // Search by name, phone, or email
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

### **Enhanced Student Registration Form**
```
┌─── Register New Student ───┐
│ ┌─── Student Information ───┐                          │
│ │ Full Name: [Text Input]                              │
│ │ Date of Birth: [Date Picker]                         │
│ │ Place of Birth: [Text Input]                         │
│ │ Gender: [Male ●] [Female ○]                          │
│ │ Residence: [Text Input]                              │
│ │ Former School: [Text Input] (Optional)               │
│ │ Class: [Form 1 ▼]                                    │
│ │ New Student: [Yes ●] [No ○]                          │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─── Parent/Guardian Information ───┐                   │
│ │ [Create New Parent ●] [Link Existing Parent ○]       │
│ │                                                      │
│ │ ── New Parent Details ──                             │
│ │ Parent Name: [Text Input]                            │
│ │ Phone Number: [Text Input]                           │
│ │ WhatsApp: [Text Input] (Optional)                    │
│ │ Email: [Text Input] (Optional)                       │
│ │ Address: [Text Input]                                │
│ │ Relationship: [Father ▼] [Mother] [Guardian]         │
│ │                                                      │
│ │ ── OR Select Existing Parent ──                      │
│ │ Search Parent: [Search Input with autocomplete]      │
│ │ [📋 Browse All Parents]                              │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ [Register Student] [Save Draft] [Cancel]                │
└───────────────────────────────────────────────────────┘
```

### **Parent Selection Modal** (When "Link Existing Parent" is selected)
```
┌─── Select Existing Parent ───┐
│ Search: [Text Input] [🔍]      │
│                               │
│ Found Parents:                │
│ ┌─── Mr. Johnson ───┐         │
│ │ Phone: 677123456   │         │
│ │ Email: j@email.com │         │
│ │ Children: 1        │         │
│ │ [Select] [View]    │         │
│ └─────────────────── │         │
│                               │
│ ┌─── Mrs. Smith ───┐          │
│ │ Phone: 677654321   │         │
│ │ Email: s@email.com │         │
│ │ Children: 2        │         │
│ │ [Select] [View]    │         │
│ └─────────────────── │         │
│                               │
│ [Cancel] [Create New Instead]  │
└─────────────────────────────┘
```

### **Registration Success Modal**
```
┌─── Student Registered Successfully ───┐
│ ✅ Student Registration Complete        │
│                                        │
│ Student Details:                       │
│ Name: John Doe                         │
│ Matricule: STU2024001                  │
│ Class: Form 1A                         │
│ Status: Awaiting VP Interview          │
│                                        │
│ 👤 Parent Account Created:             │
│ Name: Mr. Johnson                      │
│ Matricule: PAR2024001                  │
│ Password: TEMP123456                   │
│                                        │
│ ⚠️ Please provide these credentials    │
│ to the parent for login access         │
│                                        │
│ [Print Credentials] [Send SMS]         │
│ [Create Fee Record] [Close]            │
└──────────────────────────────────────┘
```

## Fee Management (`/bursar/fees`)

### **API Integration**

#### **1. Get All Fees**
**Endpoint:** `GET /api/v1/fees`
- **Query Parameters:**
  ```typescript
  {
    academicYearId?: number;
    page?: number;
    limit?: number;
    search?: string;           // Student name or matricule
    classId?: number;
    paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
  }
  ```

#### **2. Create Fee Record**
**Endpoint:** `POST /api/v1/fees`
- **Request Body:**
  ```typescript
  {
    enrollmentId: number;      // Student's enrollment ID
    amountExpected: number;    // Amount in FCFA
    feeType?: string;          // "SCHOOL_FEES" | "BOOKS" | "UNIFORM" | "OTHER"
    description?: string;
    dueDate?: string;          // "YYYY-MM-DD"
    academicYearId?: number;
  }
  ```

#### **3. Get Student Fees**
**Endpoint:** `GET /api/v1/fees/student/:studentId`
- **Query Parameters:** `{ academicYearId?: number }`

#### **4. Get Subclass Fee Summary**
**Endpoint:** `GET /api/v1/fees/subclass/:subClassId/summary`

### **Fee Management Dashboard**
```
┌─── Fee Management ───┐
│ [Create Fee] [Bulk Import] [Reports] [Settings]        │
│                                                        │
│ ┌─── Fee Overview ───┐                                 │
│ │ Academic Year: 2024-2025                            │
│ │ Total Students: 450                                 │
│ │ Students with Fees: 445                             │
│ │ Fully Paid: 298 (67%)                              │
│ │ Partially Paid: 127 (28%)                          │
│ │ Unpaid: 20 (5%)                                     │
│ └───────────────────────────────────────────────────┘ │
│                                                        │
│ ┌─── Filter & Search ───┐                             │
│ │ Class: [All ▼] | Status: [All ▼] | Search: [____]  │
│ │ Amount Range: [Min] - [Max] FCFA                    │
│ │ [Apply Filters] [Clear] [Export Filtered]           │
│ └───────────────────────────────────────────────────┘ │
│                                                        │
│ Student           Class   Expected    Paid      Balance │
│ John Doe          Form 5A 150,000    100,000   50,000  │
│ Mary Smith        Form 3B 125,000    125,000   0       │
│ Peter Johnson     Form 1A 100,000    75,000    25,000  │
│ Sarah Williams    Form 4B 140,000    0         140,000 │
│                                                        │
│ [Previous] [1] [2] [3] [Next] | Showing 50 of 445     │
└──────────────────────────────────────────────────────┘
```

### **Create Fee Record** (`/bursar/fees/create`)
```
┌─── Create Fee Record ───┐
│ ┌─── Student Selection ───┐                           │
│ │ Search Student: [Text Input with autocomplete]      │
│ │ OR Select: [Browse Students]                        │
│ │                                                     │
│ │ Selected: John Doe (STU2024001) - Form 5A          │
│ │ Current Fees: 1 record (50,000 FCFA pending)       │
│ │ [Change Student]                                    │
│ └───────────────────────────────────────────────────┘ │
│                                                        │
│ ┌─── Fee Details ───┐                                  │
│ │ Fee Type: [School Fees ▼] [Books] [Uniform] [Other] │
│ │ Amount Expected: [____] FCFA                        │
│ │ Due Date: [Date Picker]                             │
│ │ Description: [Text Area]                            │
│ │ Academic Year: [2024-2025 ▼]                        │
│ │                                                     │
│ │ ✅ Auto-calculate based on class fee structure      │
│ │ Base Fee: 100,000 FCFA                             │
│ │ + New Student Fee: 25,000 FCFA                     │
│ │ + Books & Materials: 25,000 FCFA                   │
│ │ Total: 150,000 FCFA                                │
│ └───────────────────────────────────────────────────┘ │
│                                                        │
│ [Create Fee Record] [Save Draft] [Cancel]              │
└──────────────────────────────────────────────────────┘
```

## Payment Recording (`/bursar/payments`)

### **API Integration**

#### **1. Record Payment**
**Endpoint:** `POST /api/v1/fees/:feeId/payments`
- **Request Body:**
  ```typescript
  {
    amount: number;            // Payment amount in FCFA
    paymentDate: string;       // "YYYY-MM-DD" (from receipt)
    paymentMethod: "EXPRESS_UNION" | "CCA" | "3DC";
    receiptNumber?: string;    // Receipt reference
    recordedById?: number;     // Auto-set from authentication
    notes?: string;           // Additional notes
  }
  ```
- **Response:**
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

#### **2. Get Fee Payments**
**Endpoint:** `GET /api/v1/fees/:feeId/payments`

#### **3. Get All Payments**
**Endpoint:** `GET /api/v1/fees/reports`
- **Query Parameters:**
  ```typescript
  {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    academicYearId?: number;
    export?: "excel" | "pdf";
  }
  ```

### **Record Payment Dashboard**
```
┌─── Record Payment ───┐
│ [Quick Payment] [Bulk Payments] [Payment History]      │
│                                                        │
│ ┌─── Quick Payment Entry ───┐                          │
│ │ Student: [Search/Select Student]                     │
│ │ Selected: Mary Smith (STU2024002) - Form 3B         │
│ │ Outstanding Balance: 25,000 FCFA                     │
│ │                                                     │
│ │ Payment Amount: [____] FCFA                         │
│ │ Payment Date: [Date Picker] (Receipt Date)          │
│ │ Payment Method: [EXPRESS_UNION ▼] [CCA] [3DC]       │
│ │ Receipt Number: [Text Input]                        │
│ │ Notes: [Text Area] (Optional)                       │
│ │                                                     │
│ │ [Record Payment] [Print Receipt] [Clear]            │
│ └───────────────────────────────────────────────────┘ │
│                                                        │
│ ┌─── Recent Payments Today ───┐                        │
│ │ Time     Student        Amount      Method    Receipt │
│ │ 14:30    John Doe       75,000 FCFA EU       #R001   │
│ │ 13:15    Mary Smith     50,000 FCFA CCA      #R002   │
│ │ 11:45    Peter Brown    125,000 FCFA 3DC     #R003   │
│ │ 10:20    Sarah Davis    100,000 FCFA EU      #R004   │
│ │                                                     │
│ │ Today's Total: 350,000 FCFA | Transactions: 4      │
│ │ [View All Today] [Export Daily Report]              │
│ └───────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### **Payment Confirmation Modal**
```
┌─── Payment Recorded Successfully ───┐
│ ✅ Payment Successfully Recorded     │
│                                     │
│ Payment Details:                    │
│ Student: Mary Smith (STU2024002)    │
│ Amount: 25,000 FCFA                 │
│ Method: EXPRESS_UNION               │
│ Receipt: #R002                      │
│ Date: 2024-01-20                    │
│                                     │
│ Updated Balance: 0 FCFA (Fully Paid)│
│                                     │
│ [Print Receipt] [SMS Parent]        │
│ [Record Another] [Close]            │
└───────────────────────────────────┘
```

## Reports & Analytics (`/bursar/reports`)

### **API Integration**

#### **1. Financial Reports**
**Endpoint:** `GET /api/v1/fees/reports`
- **Query Parameters:**
  ```typescript
  {
    reportType?: "summary" | "detailed" | "outstanding" | "collections";
    startDate?: string;      // "YYYY-MM-DD"
    endDate?: string;        // "YYYY-MM-DD" 
    academicYearId?: number;
    classId?: number;
    format?: "json" | "excel" | "pdf";
  }
  ```

#### **2. Payment Analytics**
**Endpoint:** `GET /api/v1/bursar/dashboard` (includes payment method breakdown)

### **Reports Dashboard**
```
┌─── Financial Reports & Analytics ───┐
│ [📊 Dashboard] [📈 Collections] [📋 Outstanding] [📤 Export]│
│                                                            │
│ ┌─── Report Generator ───┐                                 │
│ │ Report Type: [Collection Summary ▼]                     │
│ │              [Outstanding Balances]                     │
│ │              [Payment Methods Analysis]                 │
│ │              [Class-wise Breakdown]                     │
│ │                                                         │
│ │ Date Range: [From: Date] [To: Date]                     │
│ │ Academic Year: [2024-2025 ▼]                            │
│ │ Class Filter: [All Classes ▼]                           │
│ │ Format: [PDF ●] [Excel ○] [CSV ○]                       │
│ │                                                         │
│ │ [Generate Report] [Schedule Auto-Report]                │
│ └───────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─── Quick Stats ───┐                                      │
│ │ This Month Collections: 2,100,000 FCFA                 │
│ │ Outstanding Total: 3,300,000 FCFA                      │
│ │ Payment Methods: EU (65%), CCA (25%), 3DC (10%)        │
│ │ Collection Rate: 79% (Target: 85%)                     │
│ └───────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─── Recent Reports ───┐                                   │
│ │ 📄 Monthly Collection Report - Jan 2024    [Download]   │
│ │ 📄 Outstanding Balances - Jan 20, 2024     [Download]   │
│ │ 📄 Payment Methods Analysis - Jan 2024     [Download]   │
│ │ 📄 Class Fee Status Report - Jan 2024      [Download]   │
│ └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Parent Account Management (`/bursar/parents`)

### **API Integration**

#### **1. Get All Parents**
**Endpoint:** `GET /api/v1/bursar/available-parents`
- **Query Parameters:** As described in registration section

#### **2. Create Parent Account**
**Included in student registration API**

#### **3. Link/Unlink Parent-Student**
**Link:** `POST /api/v1/bursar/link-existing-parent`
**Unlink:** `DELETE /api/v1/students/:studentId/parents/:parentId`

### **Parent Account Dashboard**
```
┌─── Parent Account Management ───┐
│ [👥 All Parents] [➕ Create Account] [🔗 Link Management] │
│                                                          │
│ ┌─── Search & Filter ───┐                                │
│ │ Search: [Name, Phone, Email] [🔍]                      │
│ │ Filter: [Has Children ▼] [No Children] [All]           │
│ │ Sort: [Name ▼] [Registration Date] [Children Count]    │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Parent Name      Phone        Email          Children     │
│ Mr. Johnson      677123456    j@email.com    2 (John, Mary)│
│ Mrs. Smith       677654321    s@email.com    1 (Peter)   │
│ Mr. Brown        677789012    -              0           │
│ Mrs. Davis       677345678    d@email.com    3 (Sarah+2) │
│                                                          │
│ [Previous] [1] [2] [3] [Next] | Showing 50 of 234       │
└────────────────────────────────────────────────────────┘
```

## Settings & Configuration (`/bursar/settings`)

### **API Integration**

#### **1. Fee Structure Management**
**Endpoint:** `GET/PUT /api/v1/classes/:id` (includes fee information)

#### **2. Payment Methods Configuration**
**Endpoint:** Internal system settings

### **Bursar Settings**
```
┌─── Bursar Settings ───┐
│ [💰 Fee Structure] [💳 Payment Methods] [📱 SMS Config] │
│                                                        │
│ ┌─── Class Fee Structure ───┐                          │
│ │ Class         Base Fee    New Student  Books  Total │
│ │ Form 1        75,000     15,000       10,000  100,000│
│ │ Form 2        80,000     15,000       12,000  107,000│
│ │ Form 3        85,000     15,000       15,000  115,000│
│ │ Form 4        90,000     15,000       18,000  123,000│
│ │ Form 5        95,000     15,000       20,000  130,000│
│ │ [Edit Structure] [Import] [Export]                   │
│ └──────────────────────────────────────────────────── │
│                                                        │
│ ┌─── SMS Notifications ───┐                            │
│ │ ✅ Payment Confirmations                             │
│ │ ✅ Fee Reminders                                     │
│ │ ✅ Receipt Notifications                             │
│ │ ❌ Marketing Messages                                │
│ │ Template: "Payment of {amount} FCFA received for    │
│ │ {student}. Balance: {balance} FCFA. Receipt: {ref}" │
│ │ [Save Settings]                                      │
│ └──────────────────────────────────────────────────── │
└──────────────────────────────────────────────────────┘
```

## Error Handling & Loading States

### **API Error Handling**
```typescript
// Standard error response format
{
  success: false;
  error: string; // User-friendly error message
}

// Common Bursar-specific errors:
// 400: "Invalid fee amount" | "Student already has fees for this year"
// 404: "Student not found" | "Parent not found" 
// 409: "Parent already linked to this student"
// 500: "Payment processing failed" | "Database error"
```

### **Loading & Validation States**
- Form validation for all monetary inputs (min: 0, max: reasonable limits)
- Real-time balance calculations
- Payment method validation
- Receipt number uniqueness checks
- Automatic fee calculations based on class structure

### **Success Feedback**
- Toast notifications for successful operations
- Modal confirmations for payment recordings
- SMS integration status feedback
- Auto-generated receipt numbers
- Print-friendly receipt formats

**Frontend Implementation Notes:**
1. Implement currency formatting for FCFA amounts
2. Add number input validation and formatting
3. Use debounced search for student/parent lookup
4. Implement optimistic updates for payment recording
5. Cache fee structures and payment methods locally
6. Handle offline payment recording with sync capabilities
7. Implement proper receipt printing functionality
8. Add SMS gateway integration status monitoring

