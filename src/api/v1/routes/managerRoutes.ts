import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import * as managerController from '../controllers/managerController';
import * as examController from '../controllers/examController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/v1/manager/dashboard
 * @desc Get enhanced Manager dashboard with operational overview
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/dashboard',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getManagerDashboard
);

/**
 * @route GET /api/v1/manager/staff-management
 * @desc Get staff management overview and analytics
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/staff-management',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getStaffManagement
);

/**
 * @route GET /api/v1/manager/operational-support
 * @desc Get operational support overview including maintenance and facilities
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/operational-support',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getOperationalSupport
);

/**
 * @route GET /api/v1/manager/administrative-support
 * @desc Get administrative support overview including documents and compliance
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/administrative-support',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getAdministrativeSupport
);

/**
 * @route GET /api/v1/manager/reports/operational
 * @desc Generate operational report for specified period
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/reports/operational',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.generateOperationalReport
);

/**
 * @route PUT /api/v1/manager/maintenance-requests/:requestId
 * @desc Process maintenance request (approve, reject, assign)
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.put('/maintenance-requests/:requestId',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.processMaintenanceRequest
);

/**
 * @route PUT /api/v1/manager/facilities/:facilityId/status
 * @desc Update facility status
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.put('/facilities/:facilityId/status',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.updateFacilityStatus
);

/**
 * @route PUT /api/v1/manager/leave-requests/:requestId
 * @desc Process staff leave request (approve or reject)
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.put('/leave-requests/:requestId',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.processLeaveRequest
);

/**
 * @route POST /api/v1/manager/tasks
 * @desc Create and assign task to staff members
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.post('/tasks',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.createTaskAssignment
);

/**
 * @route GET /api/v1/manager/staff-attendance
 * @desc Get staff attendance summary and analytics
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/staff-attendance',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getStaffAttendanceSummary
);

/**
 * @route GET /api/v1/manager/maintenance-schedule
 * @desc Get facility maintenance schedule and history
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/maintenance-schedule',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getFacilityMaintenanceSchedule
);

/**
 * @route GET /api/v1/manager/inventory
 * @desc Get inventory status and alerts
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/inventory',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    managerController.getInventoryStatus
);

/**
 * @route GET /api/v1/manager/report-cards/student/:studentId/availability
 * @desc Check if a student's report card is available
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/report-cards/student/:studentId/availability',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    examController.checkStudentReportCardAvailability
);

/**
 * @route GET /api/v1/manager/report-cards/subclass/:subClassId/availability
 * @desc Check if a subclass's report cards are available
 * @access Private (MANAGER, PRINCIPAL, SUPER_MANAGER only)
 */
router.get('/report-cards/subclass/:subClassId/availability',
    authorize(['MANAGER', 'PRINCIPAL', 'SUPER_MANAGER']),
    examController.checkSubclassReportCardAvailability
);

export default router; 