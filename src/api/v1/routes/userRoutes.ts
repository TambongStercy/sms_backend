import { Router } from 'express';
import {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
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
    getAllTeachers,
    getCurrentUserProfile,
    getStudentsForParent,
    getDashboardForRole
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Registration endpoint (public or specific roles)
router.post('/register-with-roles', registerAndAssignRoles);
router.post('/create-with-role', authenticate, authorize(['MANAGER', 'SUPER_MANAGER']), createUserWithRole);

// User CRUD operations (requires authentication, some require specific roles)
router.get('/', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), getAllUsers);
router.post('/', authenticate, authorize(['MANAGER', 'SUPER_MANAGER']), createUser);

// Get all teachers (optionally filtered by subject)
// Important: This route must be defined BEFORE the /:id route to avoid conflicts
router.get('/teachers', authenticate, getAllTeachers);

// Route for the current user's profile - MUST be before /:id
router.get('/me', authenticate, getCurrentUserProfile);

// Route for the current user's dashboard by role
router.get('/me/dashboard', authenticate, getDashboardForRole);

// GET /users/:parentId/students - Get all students linked to a specific parent user
// PRINCIPAL, MANAGER, SUPER_MANAGER can view. Parent can view their own.
router.get('/:parentId/students', authenticate, authorize(['PRINCIPAL', 'MANAGER', 'SUPER_MANAGER', 'PARENT']), getStudentsForParent);
// Note: Add logic in controller/service to ensure PARENT can only access their own students if parentId matches req.user.id

router.get('/:id', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), getUserById);
router.put('/:id', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), updateUser);
router.delete('/:id', authenticate, authorize(['MANAGER', 'SUPER_MANAGER']), deleteUser);

// Role management
// router.post('/:id/roles', authenticate, authorize(['MANAGER', 'SUPER_MANAGER']), assignRole); // Keep old route for single assignment?
router.put('/:id/roles/academic-year', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), setUserRolesForCurrentAcademicYear); // New route for setting roles
router.delete('/:id/roles/:roleId', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), removeRole); // RoleId here is the UserRole record ID

// Specific Assignments (Vice Principal, Discipline Master)
// Assign VP to Subclass (Defaults to current year if academicYearId is omitted in body)
router.post('/:userId/assignments/vice-principal', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), assignVicePrincipal);
// Remove VP from Subclass (Requires subClassId in path. Defaults to current year if academicYearId query param omitted)
router.delete('/:userId/assignments/vice-principal/:subClassId', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), removeVicePrincipal);

// Assign DM to Subclass (Defaults to current year if academicYearId is omitted in body)
router.post('/:userId/assignments/discipline-master', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), assignDisciplineMaster);
// Remove DM from Subclass (Requires subClassId in path. Defaults to current year if academicYearId query param omitted)
router.delete('/:userId/assignments/discipline-master/:subClassId', authenticate, authorize(['MANAGER', 'SUPER_MANAGER', 'PRINCIPAL']), removeDisciplineMaster);

export default router;
