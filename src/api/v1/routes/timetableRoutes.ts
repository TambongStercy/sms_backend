// src/api/v1/routes/timetableRoutes.ts
import { Router } from 'express';
import * as timetableController from '../controllers/timetableController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /timetables/subclass/:subclassId - Get timetable for a specific sub_class
// All authenticated users can view timetables
router.get('/subclass/:subclassId', authenticate, timetableController.getSubclassTimetable);

// GET /timetables/full-school - Get the entire school timetable for a specific academic year
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, MANAGER can view the full school timetable
router.get('/full-school',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER']),
    timetableController.getFullSchoolTimetable
);

// POST /timetables/subclass/:subclassId/bulk-update - Update multiple timetable slots for a specific sub_class
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can update timetables
router.post('/subclass/:subclassId/bulk-update',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    timetableController.bulkUpdateTimetable
);

export default router; 