import { Router } from 'express';
import {
    getAllUsers,
    searchPersonnel,
    searchTeachers,
    createUser,
    getUserById,
    updateUser,
    updateCurrentUserProfile,
    getCurrentUserSettings,
    updateCurrentUserSettings,
    deleteUser,
    assignRole,
    removeRole,
    registerAndAssignRoles,
    createUserWithRole,
    setUserRolesForCurrentAcademicYear,
    assignVicePrincipal,
    removeVicePrincipal,
    assignDisciplineMaster,
    removeDisciplineMaster,
    assignTeacherSubject,
    removeTeacherSubject,
    getAllTeachers,
    getCurrentUserProfile,
    getStudentsForParent,
    getDashboardForRole
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { auditTrailMiddleware, roleChangeAuditMiddleware } from '../middleware/auditTrail.middleware';

const router = Router();

// Registration endpoint (public or specific roles)
router.post('/register-with-roles', registerAndAssignRoles);
router.post('/create-with-role', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY']), auditTrailMiddleware('User', 'CREATE_USER'), createUserWithRole);

// User CRUD operations (requires authentication, some require specific roles)
router.get('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'BURSAR', 'SECRETARY']), getAllUsers);
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'BURSAR', 'SECRETARY']), auditTrailMiddleware('User', 'CREATE_USER'), createUser);

// Get all teachers (optionally filtered by subject)
// Important: This route must be defined BEFORE the /:id route to avoid conflicts
router.get('/teachers', authenticate, getAllTeachers);

// Teacher management search with pagination + rich filters. Must be BEFORE /:id.
router.get('/teachers/search', authenticate, authorize([
    'SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL',
    'BURSAR', 'SECRETARY', 'DEAN_OF_STUDIES', 'HOD'
]), searchTeachers);

// Personnel search with pagination + filters. Must be BEFORE /:id.
router.get('/personnel/search', authenticate, authorize([
    'SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL',
    'BURSAR', 'SECRETARY', 'DEAN_OF_STUDIES', 'DEAN_OF_DISCIPLINE', 'HOD'
]), searchPersonnel);

// Route for the current user's profile - MUST be before /:id
router.get('/me', authenticate, getCurrentUserProfile);
router.put('/me', authenticate, updateCurrentUserProfile); // Allow users to update their own profile

// Current user's app/notification preferences
router.get('/me/settings', authenticate, getCurrentUserSettings);
router.put('/me/settings', authenticate, updateCurrentUserSettings);

// Route for the current user's dashboard by role
router.get('/me/dashboard', authenticate, getDashboardForRole);

// GET /users/:parentId/students - Get all students linked to a specific parent user
// PRINCIPAL, SUPER_MANAGER can view. Parent can view their own.
router.get('/:parentId/students', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), getStudentsForParent);
// Note: Add logic in controller/service to ensure PARENT can only access their own students if parentId matches req.user.id

router.get('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY']), getUserById);
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'SECRETARY']), auditTrailMiddleware('User', 'UPDATE_USER'), updateUser);
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), auditTrailMiddleware('User', 'DELETE_USER'), deleteUser); // Only SUPER_MANAGER can delete

// Role management
router.post('/:id/roles', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), roleChangeAuditMiddleware, assignRole); // Single role assignment
router.delete('/:id/roles', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), roleChangeAuditMiddleware, removeRole); // Remove role (specify role in body)
router.put('/:id/roles/academic-year', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), roleChangeAuditMiddleware, setUserRolesForCurrentAcademicYear); // New route for setting roles
router.delete('/:id/roles/:roleId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), roleChangeAuditMiddleware, removeRole); // RoleId here is the UserRole record ID

// Specific Assignments (Vice Principal, Discipline Master)
// Assign VP to Subclass (Defaults to current year if academicYearId is omitted in body)
router.post('/:userId/assignments/vice-principal', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), assignVicePrincipal);
// Remove VP from Subclass (Requires subClassId in path. Defaults to current year if academicYearId query param omitted)
router.delete('/:userId/assignments/vice-principal/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), removeVicePrincipal);

// Assign DM to Subclass (Defaults to current year if academicYearId is omitted in body)
// SDM and Dean of Discipline are included per the discipline reporting chain
// (DM → SDM → Dean of Discipline → VP/Principal).
router.post('/:userId/assignments/discipline-master', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DEAN_OF_DISCIPLINE', 'SENIOR_DISCIPLINE_MASTER']), assignDisciplineMaster);
// Remove DM from Subclass (Requires subClassId in path. Defaults to current year if academicYearId query param omitted)
router.delete('/:userId/assignments/discipline-master/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'DEAN_OF_DISCIPLINE', 'SENIOR_DISCIPLINE_MASTER']), removeDisciplineMaster);

// Assign Teacher to Subject
router.post('/:userId/assignments/TEACHER', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), assignTeacherSubject);
// Remove Teacher from Subject
router.delete('/:userId/assignments/TEACHER/:subjectId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), removeTeacherSubject);

export default router;
