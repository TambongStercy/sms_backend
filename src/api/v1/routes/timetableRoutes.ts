// src/api/v1/routes/timetableRoutes.ts
import { Router } from 'express';
import * as timetableController from '../controllers/timetableController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /timetables - Get timetable for a sub_class
// All authenticated users can view timetables
router.get('/', authenticate, timetableController.getSubclassTimetable);

// POST /timetables/bulk-update - Update multiple timetable slots
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can update timetables
router.post('/bulk-update',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    timetableController.bulkUpdateTimetable
);

export default router; 