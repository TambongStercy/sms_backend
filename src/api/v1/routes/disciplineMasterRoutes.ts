import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import * as disciplineMasterController from '../controllers/disciplineMasterController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/v1/discipline-master/dashboard
 * @desc Get enhanced Discipline Master dashboard with behavioral analytics
 * @access Private (DISCIPLINE_MASTER only)
 */
router.get('/dashboard',
    authorize(['DISCIPLINE_MASTER']),
    disciplineMasterController.getDMDashboard
);

/**
 * @route GET /api/v1/discipline-master/behavioral-analytics
 * @desc Get comprehensive behavioral analytics and trends
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.get('/behavioral-analytics',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.getBehavioralAnalyticsData
);

/**
 * @route GET /api/v1/discipline-master/student-profile/:studentId
 * @desc Get detailed student behavior profile and intervention history
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL, TEACHER)
 */
router.get('/student-profile/:studentId',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']),
    disciplineMasterController.getStudentBehaviorProfileData
);

/**
 * @route GET /api/v1/discipline-master/early-warning
 * @desc Get early warning system data for at-risk students
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.get('/early-warning',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.getEarlyWarningSystemData
);

/**
 * @route GET /api/v1/discipline-master/statistics
 * @desc Get discipline statistics and trends with filtering options
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.get('/statistics',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.getDisciplineStatistics
);

/**
 * @route GET /api/v1/discipline-master/interventions
 * @desc Get intervention tracking data
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.get('/interventions',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.getInterventionTracking
);

/**
 * @route POST /api/v1/discipline-master/interventions
 * @desc Create new intervention plan for a student
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.post('/interventions',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.createIntervention
);

/**
 * @route PUT /api/v1/discipline-master/interventions/:interventionId
 * @desc Update intervention status and add notes
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.put('/interventions/:interventionId',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.updateInterventionStatus
);

/**
 * @route GET /api/v1/discipline-master/risk-assessment
 * @desc Get comprehensive risk assessment for all students
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL, VICE_PRINCIPAL)
 */
router.get('/risk-assessment',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    disciplineMasterController.getRiskAssessment
);

/**
 * @route GET /api/v1/discipline-master/reports
 * @desc Generate comprehensive discipline reports
 * @access Private (DISCIPLINE_MASTER, PRINCIPAL)
 */
router.get('/reports',
    authorize(['DISCIPLINE_MASTER', 'PRINCIPAL']),
    disciplineMasterController.generateDisciplineReport
);

export default router; 