# School Management System - Missing API Endpoints TODO

## CRITICAL MISSING ENDPOINTS (High Priority)

### 1. Bursar - Parent Creation Workflow ⚠️ ESSENTIAL
- [x] `POST /api/v1/bursar/create-parent-with-student`
- [x] `GET /api/v1/bursar/available-parents`
- [x] `POST /api/v1/bursar/link-existing-parent`
- [x] Create controller: `src/api/v1/controllers/bursarController.ts`
- [x] Create service: `src/api/v1/services/bursarService.ts`
- [x] Create routes: `src/api/v1/routes/bursarRoutes.ts`
- [x] Update Swagger documentation

### 2. HOD - Department Management ✅ COMPLETED
- [x] `GET /api/v1/hod/dashboard`
- [x] `GET /api/v1/hod/department-overview`
- [x] `GET /api/v1/hod/teachers-in-department`
- [x] `GET /api/v1/hod/subject-performance`
- [x] `POST /api/v1/hod/assign-teacher-subject`
- [x] `GET /api/v1/hod/department-analytics`
- [x] `GET /api/v1/hod/teacher-performance/:teacherId`
- [x] `GET /api/v1/hod/my-subjects`
- [x] Create controller: `src/api/v1/controllers/hodController.ts`
- [x] Create service: `src/api/v1/services/hodService.ts`
- [x] Create routes: `src/api/v1/routes/hodRoutes.ts`
- [ ] Update Swagger documentation

### 3. Teacher - Attendance Management ✅ COMPLETED
- [x] `GET /api/v1/teachers/me/attendance`
- [x] `POST /api/v1/teachers/attendance/record`
- [x] `GET /api/v1/teachers/attendance/statistics`
- [x] `GET /api/v1/teachers/attendance/subclass/:id`
- [x] Enhanced existing teacherController and teacherService
- [x] Updated routes in `src/api/v1/routes/teacherRoutes.ts`
- [x] Updated documentation in `COMPLETE_API_DOCUMENTATION.md`
- [x] Updated test script `test-all-endpoints.sh`

## SUPER_MANAGER ENDPOINTS

### System Settings & Configuration
- [x] `GET /api/v1/system/settings`
- [x] `PUT /api/v1/system/settings`
- [x] Create controller: `src/api/v1/controllers/systemController.ts`
- [x] Create service: `src/api/v1/services/systemService.ts`
- [x] Create routes: `src/api/v1/routes/systemRoutes.ts`

### System Health & Maintenance
- [x] `GET /api/v1/system/health`
- [x] `POST /api/v1/system/backup`
- [x] `POST /api/v1/system/cleanup`
- [x] `GET /api/v1/system/logs`
- [x] Update system controller/service

### Advanced Reporting
- [x] `GET /api/v1/reports/financial-summary`
- [x] `GET /api/v1/reports/academic-performance`
- [x] `GET /api/v1/reports/system-usage`
- [x] `POST /api/v1/reports/custom`
- [x] Create controller: `src/api/v1/controllers/reportsController.ts`
- [x] Create service: `src/api/v1/services/reportsService.ts`
- [x] Create routes: `src/api/v1/routes/reportsRoutes.ts`

## PRINCIPAL ENDPOINTS

### School-wide Analytics
- [x] `GET /api/v1/principal/school-analytics`
- [x] `GET /api/v1/principal/performance-trends`
- [x] `GET /api/v1/principal/staff-performance`
- [x] `GET /api/v1/principal/enrollment-trends`
- [x] `GET /api/v1/principal/academic-overview`
- [x] Create controller: `src/api/v1/controllers/principalController.ts`
- [x] Create service: `src/api/v1/services/principalService.ts`
- [x] Create routes: `src/api/v1/routes/principalRoutes.ts`

## VICE_PRINCIPAL ENDPOINTS

### Enhanced Student Management
- [x] `GET /api/v1/vice-principal/dashboard`
- [x] `GET /api/v1/vice-principal/pending-assignments`
- [x] `POST /api/v1/vice-principal/bulk-assign`
- [x] Create controller: `src/api/v1/controllers/vicePrincipalController.ts`
- [x] Create service: `src/api/v1/services/vicePrincipalService.ts`
- [x] Create routes: `src/api/v1/routes/vicePrincipalRoutes.ts`

## BURSAR ENDPOINTS (Additional)

### Financial Analytics
- [ ] `GET /api/v1/bursar/collection-analytics`
- [ ] `GET /api/v1/bursar/payment-trends`
- [ ] `GET /api/v1/bursar/defaulters-report`
- [ ] Update bursar controller/service

## DISCIPLINE_MASTER ENDPOINTS

### Enhanced Analytics & Operations
- [ ] `GET /api/v1/discipline/analytics`
- [ ] `GET /api/v1/discipline/repeat-offenders`
- [ ] `GET /api/v1/discipline/trends`
- [ ] `POST /api/v1/discipline/bulk-record`
- [ ] `PUT /api/v1/discipline/:id/resolve`
- [ ] Update `src/api/v1/controllers/disciplineController.ts`
- [ ] Update `src/api/v1/services/disciplineService.ts`

## TEACHER ENDPOINTS (Additional)

### Enhanced Analytics & Marks
- [ ] `GET /api/v1/teachers/me/performance-analytics`
- [ ] `GET /api/v1/teachers/me/student-progress`
- [ ] `POST /api/v1/teachers/marks/bulk-entry`
- [ ] `PUT /api/v1/teachers/marks/:id`
- [ ] Update `src/api/v1/controllers/teacherController.ts`
- [ ] Update `src/api/v1/services/teacherService.ts`

## PARENT ENDPOINTS

### Enhanced Communication & Details
- [ ] `GET /api/v1/parents/children/:id/attendance-details`
- [ ] `GET /api/v1/parents/children/:id/discipline-history`
- [ ] `GET /api/v1/parents/messages`
- [ ] `GET /api/v1/parents/messages/:id`
- [ ] `PUT /api/v1/parents/messages/:id/read`
- [ ] Update `src/api/v1/controllers/parentController.ts`
- [ ] Update `src/api/v1/services/parentService.ts`

## GUIDANCE_COUNSELOR ENDPOINTS

### Counseling-Specific Functions
- [ ] `GET /api/v1/counselor/dashboard`
- [ ] `GET /api/v1/counselor/at-risk-students`
- [ ] `POST /api/v1/counselor/intervention-notes`
- [ ] `GET /api/v1/counselor/student-sessions`
- [ ] Create controller: `src/api/v1/controllers/counselorController.ts`
- [ ] Create service: `src/api/v1/services/counselorService.ts`
- [ ] Create routes: `src/api/v1/routes/counselorRoutes.ts`

## MANAGER ENDPOINTS

### Administrative Operations
- [ ] `GET /api/v1/manager/dashboard`
- [ ] `GET /api/v1/manager/operations-overview`
- [ ] `POST /api/v1/manager/system-announcements`
- [ ] Create controller: `src/api/v1/controllers/managerController.ts`
- [ ] Create service: `src/api/v1/services/managerService.ts`
- [ ] Create routes: `src/api/v1/routes/managerRoutes.ts`

## ENHANCED MESSAGING SYSTEM

### Cross-Role Communication
- [ ] `GET /api/v1/messaging/conversations`
- [ ] `POST /api/v1/messaging/send`
- [ ] `PUT /api/v1/messaging/:id/read`
- [ ] `DELETE /api/v1/messaging/:id`
- [ ] Update `src/api/v1/controllers/messagingController.ts`
- [ ] Update `src/api/v1/services/messagingService.ts`

## FILE/DOCUMENT MANAGEMENT

### Enhanced File Operations
- [ ] `POST /api/v1/files/upload`
- [ ] `GET /api/v1/files/:id/download`
- [ ] `GET /api/v1/reports/:id/download`
- [ ] `DELETE /api/v1/files/:id`
- [ ] Update `src/api/v1/controllers/fileController.ts`
- [ ] Update `src/api/v1/services/fileService.ts`

## IMPLEMENTATION PRIORITIES

### Phase 1 (Critical for MVP)
1. Bursar parent creation workflow
2. HOD department management
3. Teacher attendance management
4. Enhanced messaging system

### Phase 2 (Important for Full Functionality)
1. Super Manager system settings
2. Principal analytics
3. Enhanced discipline operations
4. File management improvements

### Phase 3 (Nice to Have)
1. Advanced reporting system
2. Guidance counselor endpoints
3. Manager administrative functions
4. Performance analytics across roles

## DOCUMENTATION UPDATES NEEDED
- [ ] Update `COMPLETE_API_DOCUMENTATION.md` with all new endpoints
- [ ] Update Swagger schemas for new request/response types
- [ ] Update role-based access control documentation
- [ ] Create API usage examples for each role
- [ ] Update frontend workflow documentation

## TESTING REQUIREMENTS
- [ ] Update `test-all-endpoints.sh` with new endpoints
- [ ] Create unit tests for new services
- [ ] Create integration tests for new workflows
- [ ] Update authorization tests for new role-specific endpoints
