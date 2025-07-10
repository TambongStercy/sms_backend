## General Login & Role Selection Flow

### 1. **Login Page** (`/login`)
**Layout:** Clean, professional design with school branding
- **Login Form:**
  - Email OR Matricule field (with toggle option)
  - Password field
  - "Remember me" checkbox
  - Login button
- **Features:**
  - Input validation
  - Loading states
  - Error handling for invalid credentials

#### **API Integration:**
```http
POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john.doe@school.com",     // OR use matricule
  "password": "userPassword123"
}

Success Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@school.com",
      "profilePhoto": "/uploads/profiles/john_doe.jpg",
      "roles": [
        {
          "role": "TEACHER",
          "academicYearId": 1,
          "academicYearName": "2024-2025"
        },
        {
          "role": "HOD",
          "academicYearId": 1,
          "academicYearName": "2024-2025"
        },
        {
          "role": "PARENT",
          "academicYearId": null,
          "academicYearName": null
        }
      ]
    }
  }
}

Error Response (401):
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Frontend Implementation Notes:**
- Store JWT token in secure storage (httpOnly cookie preferred)
- Check if user has multiple roles to determine next step
- Handle "remember me" by setting longer token expiration
- Show loading spinner during authentication
- Display user-friendly error messages

### 2. **Role Selection Page** (`/select-role`) 
*Appears only if user has multiple roles*
- **Display:** User's name and profile photo
- **Role Cards:** Show each role with:
  - Role name and description
  - Role-specific icon
  - Academic year context (if applicable)
  - "Select" button
- **Example roles shown:**
  ```
  👨‍🏫 TEACHER - Manage classes and student marks
        Academic Year: 2024-2025
  
  👨‍💼 HOD - Head of Mathematics Department  
        Academic Year: 2024-2025
  
  👨‍💼 PARENT - Monitor your children's progress
        All Academic Years
  ```

#### **API Integration:**
```http
POST /api/v1/auth/select-role
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "role": "TEACHER",
  "academicYearId": 1    // null for global roles like PARENT
}

Success Response (200):
{
  "success": true,
  "data": {
    "sessionToken": "new_session_token_with_role_context",
    "selectedRole": {
      "role": "TEACHER",
      "academicYearId": 1,
      "academicYearName": "2024-2025",
      "permissions": ["VIEW_STUDENTS", "MANAGE_MARKS", "VIEW_TIMETABLE"]
    },
    "nextStep": "academic-year-selection" // or "dashboard-redirect"
  }
}
```

**Frontend Implementation Notes:**
- Use role icons and descriptions for better UX
- Show academic year context where relevant
- Highlight recommended role if user typically uses one
- Store selected role context in session

### 3. **Academic Year Selection** (`/select-academic-year`)
*Skipped for SUPER_MANAGER (they manage all years) and global roles*
- **Display:** Available academic years for the selected role
- **Current year highlighted**
- **Shows:** Year name, date range, status (current/past)
- **Default:** Current academic year pre-selected

#### **API Integration:** ✅ **IMPLEMENTED**
```http
GET /api/v1/academic-years/available-for-role
Authorization: Bearer {token}

Query Parameters:
?role=TEACHER

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
        "classCount": 24,
        "terms": [
          {
            "id": 1,
            "name": "First Term",
            "startDate": "2024-09-01",
            "endDate": "2024-12-15",
            "feeDeadline": "2024-10-15"
          }
        ]
      },
      {
        "id": 2,
        "name": "2023-2024",
        "startDate": "2023-09-01", 
        "endDate": "2024-07-31",
        "isCurrent": false,
        "status": "COMPLETED",
        "studentCount": 1180,
        "classCount": 22
      }
    ],
    "currentAcademicYearId": 1,
    "userHasAccessTo": [1, 2]  // Years where THIS USER has the specified role
  }
}

POST /api/v1/auth/select-academic-year
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "academicYearId": 1
}

Success Response (200):
{
  "success": true,
  "data": {
    "finalToken": "final_token_with_full_context",
    "context": {
      "userId": 1,
      "role": "TEACHER",
      "academicYearId": 1,
      "academicYearName": "2024-2025"
    },
    "dashboardUrl": "/teacher/dashboard"
  }
}
```

**Frontend Implementation Notes:**
- Auto-select current academic year if user has access
- Show year statistics for context
- Disable years user doesn't have access to
- Cache selection for faster future logins

### 4. **Dashboard Redirect**
Based on selected role, redirect to appropriate dashboard:

#### **Dashboard URLs by Role:**
```javascript
const DASHBOARD_ROUTES = {
  'SUPER_MANAGER': '/super-manager/dashboard',
  'PRINCIPAL': '/principal/dashboard', 
  'VICE_PRINCIPAL': '/vice-principal/dashboard',
  'TEACHER': '/teacher/dashboard',
  'HOD': '/hod/dashboard',
  'BURSAR': '/bursar/dashboard',
  'DISCIPLINE_MASTER': '/discipline-master/dashboard',
  'GUIDANCE_COUNSELOR': '/counselor/dashboard',
  'PARENT': '/parent/dashboard',
  'STUDENT': '/student/dashboard'
};
```

#### **Pre-Dashboard Data Loading:**
```http
GET /api/v1/users/me/dashboard-data
Authorization: Bearer {final_token}

Success Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "role": "TEACHER",
      "profilePhoto": "/uploads/profiles/john_doe.jpg",
      "academicYear": {
        "id": 1,
        "name": "2024-2025"
      }
    },
    "quickStats": {
      // Role-specific statistics for dashboard
      "assignedClasses": 3,
      "totalStudents": 89,
      "pendingMarks": 15
    },
    "notifications": [
      {
        "id": 1,
        "type": "REMINDER",
        "message": "Marks submission deadline tomorrow",
        "priority": "HIGH",
        "createdAt": "2024-01-22T08:00:00Z"
      }
    ]
  }
}
```

**Frontend Implementation Notes:**
- Store final authentication context globally
- Pre-load dashboard data for faster initial render
- Set up notification polling/websocket connection
- Initialize role-specific navigation menu
- Cache user preferences and settings

---

## **Error Handling Throughout Flow:**

### **Common Error Responses:**
```http
// Network/Server Error (500)
{
  "success": false,
  "error": "Internal server error. Please try again."
}

// Validation Error (400)
{
  "success": false,
  "error": "Email is required",
  "details": {
    "field": "email",
    "code": "REQUIRED"
  }
}

// Authentication Error (401)
{
  "success": false,
  "error": "Invalid or expired token"
}

// Authorization Error (403)
{
  "success": false,
  "error": "Insufficient permissions for selected role"
}
```

### **Frontend Error Handling:**
- Show user-friendly error messages
- Implement retry logic for network errors
- Clear authentication state on 401 errors
- Log errors for debugging
- Provide fallback UI states

---

## **Security Considerations:**

1. **Token Management:**
   - Use httpOnly cookies for token storage
   - Implement token refresh mechanism
   - Clear tokens on logout/error

2. **Input Validation:**
   - Validate email format client-side
   - Sanitize all user inputs
   - Use HTTPS for all API calls

3. **Session Security:**
   - Implement session timeout
   - Track login attempts
   - Secure role switching

---