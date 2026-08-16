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
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER', 'DEAN_OF_STUDIES']),
    timetableController.getFullSchoolTimetable
);

// GET /timetables/subclass/:subclassId/export - Export subclass timetable as Excel
router.get('/subclass/:subclassId/export', authenticate, timetableController.exportSubclassTimetable);

// GET /timetables/subclass/:subclassId/export/pdf - Export subclass timetable as PDF
router.get('/subclass/:subclassId/export/pdf', authenticate, timetableController.exportSubclassTimetablePdf);

// GET /timetables/full-school/export - Export full school timetable as Excel (one sheet per subclass)
router.get('/full-school/export',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER', 'DEAN_OF_STUDIES']),
    timetableController.exportFullSchoolTimetable
);

// GET /timetables/full-school/export/pdf - Export full school timetable as PDF (one page per subclass)
router.get('/full-school/export/pdf',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER', 'DEAN_OF_STUDIES']),
    timetableController.exportFullSchoolTimetablePdf
);

// GET /timetables/teacher/:teacherId/export/pdf - Admin download of a teacher's PDF timetable
router.get('/teacher/:teacherId/export/pdf',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGER', 'DEAN_OF_STUDIES']),
    timetableController.exportTeacherTimetablePdf
);

// POST /timetables/subclass/:subclassId/bulk-update - Update multiple timetable slots for a specific sub_class
// Only SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can update timetables
router.post('/subclass/:subclassId/bulk-update',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DEAN_OF_STUDIES']),
    timetableController.bulkUpdateTimetable
);

// POST /timetables/bulk-update - Same as above but subClassId comes from body
router.post('/bulk-update',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DEAN_OF_STUDIES']),
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