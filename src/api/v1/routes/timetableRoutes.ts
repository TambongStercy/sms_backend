// src/api/v1/routes/timetableRoutes.ts
import { Router } from 'express';
import * as timetableController from '../controllers/timetableController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /timetables/subclass/:subclassId - Get timetable for a specific sub_class
// All authenticated users can view timetables
router.get('/subclass/:subclassId', authenticate, timetableController.getSubclassTimetable);

// GET /timetables/full-school - Get the entire school timetable for a specific academic year
router.get('/full-school',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER']),
    timetableController.getFullSchoolTimetable
);

// GET /timetables/subclass/:subclassId/export - Export subclass timetable as Excel
router.get('/subclass/:subclassId/export', authenticate, timetableController.exportSubclassTimetable);

// GET /timetables/full-school/export - Export full school timetable as Excel (one sheet per subclass)
router.get('/full-school/export',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER']),
    timetableController.exportFullSchoolTimetable
);

// POST /timetables/subclass/:subclassId/bulk-update - Update multiple timetable slots for a specific sub_class
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can update timetables
router.post('/subclass/:subclassId/bulk-update',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    timetableController.bulkUpdateTimetable
);

// POST /timetables/bulk-update - Same as above but subClassId comes from body
router.post('/bulk-update',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']),
    (req, res, next) => {
        // Move sub_class_id from body to params so the controller works unchanged
        if (req.body.sub_class_id) {
            req.params.subclassId = String(req.body.sub_class_id);
        }
        next();
    },
    timetableController.bulkUpdateTimetable
);

export default router; 