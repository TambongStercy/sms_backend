import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as auditTrailController from '../controllers/auditTrailController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get audit logs (admin only)
router.get('/logs',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    auditTrailController.getAuditLogs
);

// Get audit statistics (admin only)
router.get('/stats',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    auditTrailController.getAuditStats
);

// Get audit trail for specific entity (admin only)
router.get('/entity/:entityType/:entityId',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    auditTrailController.getEntityAuditTrail
);

// Get user activity summary (admin only)
router.get('/user/:userId/activity',
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL']),
    auditTrailController.getUserActivitySummary
);

// Get current user's activity summary (all authenticated users)
router.get('/my-activity',
    auditTrailController.getMyActivitySummary
);

// Manual audit log creation (super admin only)
router.post('/log',
    authorize(['SUPER_MANAGER']),
    auditTrailController.createAuditLog
);

export default router; 