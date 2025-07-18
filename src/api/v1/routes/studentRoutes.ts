// Swagger documentation can be found in src/config/swagger/docs/studentDocs.ts
import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { validateTeacherStudentAccess } from '../middleware/teacherAuth.middleware';
// Performance controller functions will be uncommented after implementation
// import {
//     getStudentPerformance,
//     getDetailedStudentPerformance,
//     getClassPerformanceComparison,
//     getPerformanceTrends,
//     getSubjectPerformanceAnalysis
// } from '../controllers/performanceController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import upload, { PhotoType } from '../../../utils/fileUpload';

const router = Router();

// Performance Analytics (Commenting out until implementation complete)
// router.get('/performance', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), getStudentPerformance);

// Performance Comparison
// router.get('/performance/comparison', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), getClassPerformanceComparison);

// Performance Trends
// router.get('/performance/trends', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), getPerformanceTrends);

// Get student summary (for dashboard cards)
router.get('/summary',
    authenticate,
    authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR']),
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherStudentAccess(req, res, next);
        }

        next();
    },
    studentController.getStudentsWithStatusInfo
);

// GET /students/search - Search students by name or matricule
router.get('/search',
    authenticate,
    studentController.searchStudents
);

// GET /students - List all students (with filters and optional enrollment info)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view all students
// TEACHER can only view students from their assigned subclasses
router.get('/',
    authenticate,
    // Add teacher access validation for TEACHER role
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherStudentAccess(req, res, next);
        }

        next();
    },
    studentController.getAllStudents
);

// POST /students - Create a new student
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.createStudent);

// Performance Analytics (Commenting out until implementation complete)
// router.get('/:id/performance/detailed', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']), getDetailedStudentPerformance);

// Subject Performance Analysis
// router.get('/:id/performance/subject-analysis', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']), getSubjectPerformanceAnalysis);

// GET /students/:id - Get student details (including parents, sub-classes)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view any student
// TEACHER can only view students from their assigned subclasses
// PARENT can only view their linked students
// STUDENT can only view their own profile
router.get('/:id',
    authenticate,
    // Add teacher access validation for TEACHER role
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherStudentAccess(req, res, next);
        }

        next();
    },
    studentController.getStudentById
);

// PUT /students/:id - Update student information
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.updateStudent);

// POST /students/:id/parents - Link parent to student (alternative endpoint)
router.post('/:id/parents', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.linkParent);

// POST /students/:id/link-parent - Link parent to student 
router.post('/:id/link-parent', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.linkParent);

// DELETE /students/:studentId/parents/:parentId - Remove parent-student relationship
router.delete('/:studentId/parents/:parentId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.unlinkParent);

// GET /students/:studentId/parents - Get all parents linked to a student
router.get('/:studentId/parents',
    authenticate,
    // authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'PARENT']),
    studentController.getParentsByStudentId
);

// POST /students/:id/assign-class - Assign student to a class (creates enrollment with class only)
router.post('/:id/assign-class', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.assignStudentToClass);

// POST /students/:id/enroll - Enroll student into a subclass (final enrollment level)
router.post('/:id/enroll', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.enrollStudent);

// POST /students/:id/assign-subclass - Assign student to a subclass (if enrolled in academic year but no subclass)
router.post('/:id/assign-subclass', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), studentController.assignStudentToSubclass);

// GET /students/:id/status - Get student status information (new/old/repeater)
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view any student status
// TEACHER can only view status for students from their assigned subclasses
router.get('/:id/status',
    authenticate,
    // authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR']),
    // Add teacher access validation for TEACHER role
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherStudentAccess(req, res, next);
        }

        next();
    },
    studentController.getStudentStatusInfo
);

// GET /students/subclass/:id - Get all students in a specific subclass
router.get('/subclass/:id',
    authenticate,
    // authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR']),
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherStudentAccess(req, res, next);
        }

        next();
    },
    studentController.getStudentsBySubclass
);

// GET /students/class/:classId - Get all students in a class
router.get('/class/:classId',
    authenticate,
    // authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'BURSAR']),
    (req: any, res: any, next: any) => {
        const userRoles = req.user?.roles || [];
        const isTeacher = userRoles.includes('TEACHER');
        const hasHigherRole = userRoles.some((role: string) =>
            ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role)
        );

        if (isTeacher && !hasHigherRole) {
            return validateTeacherStudentAccess(req, res, next);
        }

        next();
    },
    studentController.getStudentsBySubclass  // Using existing method for now
);

// GET /students/parent/:parentId - Get all students for a specific parent
// SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL can view any parent's students
// PARENT can only view their own students
router.get('/parent/:parentId',
    authenticate,
    // authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'PARENT', 'BURSAR']),
    studentController.getStudentsByParent
);

// GET /api/v1/students/enrollments/:enrollmentId - Get student by enrollment ID
router.get('/enrollments/:enrollmentId',
    authenticate,
    studentController.getStudentByEnrollmentId
);

// Photo management routes
// POST /students/:id/photo - Upload student photo (requires authentication)
router.post('/:id/photo',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'TEACHER']),
    (req: any, res: any, next: any) => {
        // Set photo type for multer
        req.body.photoType = PhotoType.STUDENT;
        req.params.entityId = req.params.id;
        next();
    },
    upload.single('photo'),
    studentController.uploadStudentPhoto
);

// PUT /students/:id/enrollment-photo - Update student enrollment photo
router.put('/:id/enrollment-photo',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']),
    studentController.updateStudentEnrollmentPhoto
);

// GET /students/:id/enrollment-photo - Get student enrollment photo info
router.get('/:id/enrollment-photo',
    authenticate,
    authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'TEACHER', 'PARENT']),
    studentController.getStudentEnrollmentPhoto
);


export default router;
