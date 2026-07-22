// src/api/v1/routes/subjectSchemeRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import * as ctrl from '../controllers/subjectSchemeController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// In-memory upload (parsed immediately; nothing is persisted to disk).
const upload = multer({
    storage: (multer as any).memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req: any, file: any, cb: any) => {
        const ok =
            /\.xlsx$/i.test(file.originalname) ||
            file.mimetype ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (!ok) return cb(new Error('Only .xlsx files are accepted.'));
        cb(null, true);
    },
});

// Roles allowed to manage schemes (the curriculum-owners).
const SCHEME_WRITERS = [
    'SUPER_MANAGER',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'DEAN_OF_STUDIES',
];

// Roles allowed to read schemes (writers + HODs + teachers).
const SCHEME_READERS = [
    ...SCHEME_WRITERS,
    'HOD',
    'TEACHER',
];

// ---------- Scheme-level ----------

// GET /subject-schemes               — list (filter by subject_id, class_id, academic_year_id)
router.get('/', authenticate, authorize(SCHEME_READERS), ctrl.listSchemes);

// GET /subject-schemes/lookup        — fetch a scheme by (subject_id, class_id, academic_year_id)
router.get('/lookup', authenticate, authorize(SCHEME_READERS), ctrl.getSchemeByTriplet);

// GET /subject-schemes/by-teacher-period/:teacherPeriodId — for the teacher's logbook form
router.get(
    '/by-teacher-period/:teacherPeriodId',
    authenticate,
    authorize(SCHEME_READERS),
    ctrl.getSchemeForTeacherPeriod,
);

// POST /subject-schemes              — create empty scheme shell
router.post('/', authenticate, authorize(SCHEME_WRITERS), ctrl.createScheme);

// POST /subject-schemes/bulk         — create or replace the entire scheme tree in one shot
router.post('/bulk', authenticate, authorize(SCHEME_WRITERS), ctrl.bulkCreateOrReplaceScheme);

// GET  /subject-schemes/import/template — download the blank .xlsx template
router.get('/import/template', authenticate, authorize(SCHEME_WRITERS), ctrl.downloadTemplate);

// POST /subject-schemes/import        — upload a filled .xlsx (multipart field: "file")
router.post(
    '/import',
    authenticate,
    authorize(SCHEME_WRITERS),
    upload.single('file'),
    ctrl.importExcel,
);

// GET /subject-schemes/:id           — full tree
router.get('/:id', authenticate, authorize(SCHEME_READERS), ctrl.getSchemeById);

// PUT /subject-schemes/:id           — update header-level fields
router.put('/:id', authenticate, authorize(SCHEME_WRITERS), ctrl.updateScheme);

// DELETE /subject-schemes/:id        — delete a scheme (blocked if logbook entries reference it)
router.delete('/:id', authenticate, authorize(SCHEME_WRITERS), ctrl.deleteScheme);

// ---------- Modules ----------

router.post('/:id/modules', authenticate, authorize(SCHEME_WRITERS), ctrl.addModule);
router.put('/modules/:moduleId', authenticate, authorize(SCHEME_WRITERS), ctrl.updateModule);
router.delete('/modules/:moduleId', authenticate, authorize(SCHEME_WRITERS), ctrl.deleteModule);

// ---------- Chapters ----------

router.post('/modules/:moduleId/chapters', authenticate, authorize(SCHEME_WRITERS), ctrl.addChapter);
router.put('/chapters/:chapterId', authenticate, authorize(SCHEME_WRITERS), ctrl.updateChapter);
router.delete('/chapters/:chapterId', authenticate, authorize(SCHEME_WRITERS), ctrl.deleteChapter);

// ---------- Lessons ----------

router.post('/chapters/:chapterId/lessons', authenticate, authorize(SCHEME_WRITERS), ctrl.addLesson);
router.put('/lessons/:lessonId', authenticate, authorize(SCHEME_WRITERS), ctrl.updateLesson);
router.delete('/lessons/:lessonId', authenticate, authorize(SCHEME_WRITERS), ctrl.deleteLesson);

export default router;
