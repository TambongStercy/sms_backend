import { Router } from 'express';
import {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    updateCurrentUserProfile,
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
router.post('/create-with-role', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), createUserWithRole);

// User CRUD operations (requires authentication, some require specific roles)
router.get('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), getAllUsers);
router.post('/', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL']), createUser);

// Get all teachers (optionally filtered by subject)
// Important: This route must be defined BEFORE the /:id route to avoid conflicts
router.get('/teachers', authenticate, getAllTeachers);

// Route for the current user's profile - MUST be before /:id
router.get('/me', authenticate, getCurrentUserProfile);
router.put('/me', authenticate, updateCurrentUserProfile); // Allow users to update their own profile

// Route for the current user's dashboard by role
router.get('/me/dashboard', authenticate, getDashboardForRole);

// GET /users/:parentId/students - Get all students linked to a specific parent user
// PRINCIPAL, SUPER_MANAGER can view. Parent can view their own.
router.get('/:parentId/students', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), getStudentsForParent);
// Note: Add logic in controller/service to ensure PARENT can only access their own students if parentId matches req.user.id

router.get('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), getUserById);
router.put('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), updateUser);
router.delete('/:id', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), deleteUser); // Only SUPER_MANAGER can delete

// Role management
router.post('/:id/roles', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), assignRole); // Single role assignment
router.delete('/:id/roles', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), removeRole); // Remove role (specify role in body)
router.put('/:id/roles/academic-year', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), setUserRolesForCurrentAcademicYear); // New route for setting roles
router.delete('/:id/roles/:roleId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), removeRole); // RoleId here is the UserRole record ID

// Specific Assignments (Vice Principal, Discipline Master)
// Assign VP to Subclass (Defaults to current year if academicYearId is omitted in body)
router.post('/:userId/assignments/vice-principal', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), assignVicePrincipal);
// Remove VP from Subclass (Requires subClassId in path. Defaults to current year if academicYearId query param omitted)
router.delete('/:userId/assignments/vice-principal/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), removeVicePrincipal);

// Assign DM to Subclass (Defaults to current year if academicYearId is omitted in body)
router.post('/:userId/assignments/discipline-master', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), assignDisciplineMaster);
// Remove DM from Subclass (Requires subClassId in path. Defaults to current year if academicYearId query param omitted)
router.delete('/:userId/assignments/discipline-master/:subClassId', authenticate, authorize(['SUPER_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR']), removeDisciplineMaster);

export default router;
