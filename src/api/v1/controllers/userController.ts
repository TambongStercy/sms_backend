// src/api/v1/controllers/userController.ts
import { Role } from '@prisma/client'; // Import Role enum
import { Request, Response } from 'express';
import { extractPaginationAndFilters } from '../../../utils/pagination';
import * as userService from '../services/userService';

// Helper function to transform user data
const transformUser = (user: any) => {
    const transformed: any = { ...user }; // Clone user

    // If user has subject_teachers relation data
    if (transformed.subject_teachers && Array.isArray(transformed.subject_teachers)) {
        // Map subject_teachers to subjects containing only subject info
        transformed.subjects = transformed.subject_teachers.map((st: any) => st.subject).filter(Boolean);
        // Remove the original subject_teachers key
        delete transformed.subject_teachers;
    }

    // Potentially add other transformations here if needed (e.g., for VP/DM assignments)

    return transformed;
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Define allowed filters for users in snake_case
        const allowedFilters = ['name', 'email', 'gender', 'role', 'include_roles', 'phone'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.finalQuery, allowedFilters);

        const result = await userService.getAllUsers(paginationOptions, filterOptions);

        // Transform each user in the data array
        const transformedData = result.data.map(transformUser);

        res.json({
            success: true,
            data: transformedData,
            meta: result.meta
        });
    } catch (error: any) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Use the body directly - middleware handles the conversion
        const userData = req.body;

        // Basic validation
        if (!userData.name || !userData.email || !userData.password || !userData.gender || !userData.date_of_birth || !userData.phone || !userData.address) {
            res.status(400).json({ success: false, error: 'Missing required user fields' });
            return;
        }

        const newUser = await userService.createUser(userData);
        res.status(201).json({
            success: true,
            data: newUser
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        if (error.code === 'P2002') { // Unique constraint violation
            res.status(409).json({ success: false, error: 'User with this email already exists' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export const registerAndAssignRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = req.body;

        // Basic validation for user data
        if (!userData.name || !userData.email || !userData.password || !userData.gender || !userData.date_of_birth || !userData.phone || !userData.address) {
            res.status(400).json({ success: false, error: 'Missing required user fields' });
            return;
        }
        // Validation for roles array
        if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
            res.status(400).json({ success: false, error: 'Roles array is required and cannot be empty' });
            return;
        }
        // Validate each role object in the array
        for (const roleData of userData.roles) {
            if (!roleData.role || !Object.values(Role).includes(roleData.role)) {
                res.status(400).json({ success: false, error: `Invalid role provided: ${roleData.role}` });
                return;
            }
            // Optional: Validate academic_year_id if necessary (e.g., check if it exists)
        }

        const newUserWithRoles = await userService.registerAndAssignRoles(userData);

        res.status(201).json({
            success: true,
            data: newUserWithRoles
        });
    } catch (error: any) {
        console.error('Error registering user with roles:', error);
        if (error.code === 'P2002') { // Unique constraint violation (e.g., email)
            res.status(409).json({ success: false, error: 'User with this email already exists' });
        } else if (error.message.includes('Invalid role')) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const userData = req.body;

        // Prevent changing email if necessary, or add validation
        // delete userData.email; 

        const updatedUser = await userService.updateUser(id, userData);
        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.code === 'P2025') { // Record to update not found
            res.status(404).json({ success: false, error: 'User not found' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await userService.deleteUser(id);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        if (error.code === 'P2025') { // Record to delete not found
            res.status(404).json({ success: false, error: 'User not found' });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

export const assignRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        const roleData = {
            role: req.body.role as Role,
            academic_year_id: req.body.academic_year_id
        };

        // Validate role
        if (!roleData.role || !Object.values(Role).includes(roleData.role)) {
            res.status(400).json({ success: false, error: `Invalid role provided: ${roleData.role}` });
            return;
        }

        const newRole = await userService.assignRole(userId, roleData);
        res.status(201).json({
            success: true,
            data: newRole
        });
    } catch (error: any) {
        console.error('Error assigning role:', error);
        if (error.code === 'P2003') { // Foreign key constraint failed (user_id or academic_year_id doesn't exist)
            res.status(404).json({ success: false, error: 'User or Academic Year not found' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export const removeRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        const userRoleId = parseInt(req.params.roleId); // Expecting the UserRole ID

        if (isNaN(userRoleId)) {
            res.status(400).json({ success: false, error: 'Invalid role ID provided' });
            return;
        }

        await userService.removeRole(userId, userRoleId);
        res.json({
            success: true,
            message: 'Role assignment removed successfully'
        });
    } catch (error: any) {
        console.error('Error removing role:', error);
        res.status(404).json({ // Assume error means not found or doesn't belong to user
            success: false,
            error: error.message
        });
    }
};

/**
 * Create a user with role and optional assignments
 * @param req Request object containing user data, role and optional assignments
 * @param res Response object
 */
export const createUserWithRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = req.body;

        // Validate required fields
        if (!userData.email || !userData.password || !userData.name || !userData.gender ||
            !userData.date_of_birth || !userData.phone || !userData.address || !userData.role) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
            return;
        }

        // Convert date string to Date object
        if (typeof userData.date_of_birth === 'string') {
            userData.date_of_birth = new Date(userData.date_of_birth);
        }

        // Process optional assignments
        const result = await userService.createUserWithRole(userData);

        res.status(201).json({
            success: true,
            message: `User created successfully with role ${userData.role}`,
            data: result
        });
    } catch (error: any) {
        console.error('Error creating user with role:', error);

        // Handle specific errors
        if (error.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: 'A user with this email already exists'
            });
            return;
        }

        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: `Failed to create user: ${error.message}`
        });
    }
};

/**
 * Sets (replaces) the roles for a user for the current academic year.
 * Expects an array of roles in the request body.
 */
export const setUserRolesForCurrentAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        const roles = req.body.roles as Role[]; // Expecting an array of roles

        if (isNaN(userId)) {
            res.status(400).json({ success: false, error: 'Invalid User ID' });
            return;
        }

        if (!Array.isArray(roles)) {
            res.status(400).json({ success: false, error: 'Roles must be provided as an array' });
            return;
        }

        // Validate each role in the array
        for (const role of roles) {
            if (!Object.values(Role).includes(role)) {
                res.status(400).json({ success: false, error: `Invalid role provided: ${role}` });
                return;
            }
        }

        const updatedRoles = await userService.setUserRolesForAcademicYear(userId, roles);
        res.json({
            success: true,
            message: 'User roles updated successfully for the current academic year',
            data: updatedRoles
        });
    } catch (error: any) {
        console.error('Error setting user roles for academic year:', error);
        if (error.message.includes('User with ID') || error.message.includes('not found')) {
            res.status(404).json({ success: false, error: error.message });
        } else if (error.message.includes('No current academic year')) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'An internal error occurred while setting user roles' });
        }
    }
};

export const assignVicePrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        // Expect snake_case from req.body due to middleware
        const { sub_class_id, academic_year_id } = req.body;

        if (isNaN(userId) || !sub_class_id || typeof sub_class_id !== 'number') {
            res.status(400).json({ success: false, error: 'Invalid User ID or Subclass ID provided.' });
            return;
        }
        if (academic_year_id !== undefined && typeof academic_year_id !== 'number') {
            res.status(400).json({ success: false, error: 'Invalid Academic Year ID provided.' });
            return;
        }

        // Pass snake_case values to service (service maps internally if needed)
        const assignment = await userService.assignVicePrincipalToSubclass(userId, sub_class_id, academic_year_id);
        res.status(201).json({ success: true, data: assignment });

    } catch (error: any) {
        console.error('Error assigning vice principal:', error);
        if (error.message.includes('not found') || error.message.includes('does not have')) {
            res.status(404).json({ success: false, error: error.message });
        } else if (error.message.includes('Academic Year ID is required')) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Failed to assign vice principal.' });
        }
    }
};

export const removeVicePrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        const subClassId = parseInt(req.params.subClassId); // Param name from route
        // Expect snake_case from req.finalQuery due to middleware
        const academic_year_id = req.finalQuery.academic_year_id ? parseInt(req.finalQuery.academic_year_id as string) : undefined;

        if (isNaN(userId) || isNaN(subClassId)) {
            res.status(400).json({ success: false, error: 'Invalid User ID or Subclass ID in URL.' });
            return;
        }
        // Check the original finalQuery param existence before validating the parsed number
        if (req.finalQuery.academic_year_id && academic_year_id === undefined) {
            res.status(400).json({ success: false, error: 'Invalid Academic Year ID format in finalQuery parameter.' });
            return;
        }

        // Pass potentially undefined academic_year_id to service
        await userService.removeVicePrincipalFromSubclass(userId, subClassId, academic_year_id);
        res.status(200).json({ success: true, message: 'Vice Principal assignment removed successfully.' });

    } catch (error: any) {
        console.error('Error removing vice principal assignment:', error);
        if (error.message.includes('Academic Year ID is required')) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            // Assume success even if record didn't exist, as the state is achieved
            res.status(200).json({ success: true, message: 'Vice Principal assignment removed successfully (or did not exist).' });
        }
    }
};

export const assignDisciplineMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        // Expect snake_case from req.body due to middleware
        const { sub_class_id, academic_year_id } = req.body;

        if (isNaN(userId) || !sub_class_id || typeof sub_class_id !== 'number') {
            res.status(400).json({ success: false, error: 'Invalid User ID or Subclass ID provided.' });
            return;
        }
        if (academic_year_id !== undefined && typeof academic_year_id !== 'number') {
            res.status(400).json({ success: false, error: 'Invalid Academic Year ID provided.' });
            return;
        }

        // Pass snake_case values to service
        const assignment = await userService.assignDisciplineMasterToSubclass(userId, sub_class_id, academic_year_id);
        res.status(201).json({ success: true, data: assignment });

    } catch (error: any) {
        console.error('Error assigning discipline master:', error);
        if (error.message.includes('not found') || error.message.includes('does not have')) {
            res.status(404).json({ success: false, error: error.message });
        } else if (error.message.includes('Academic Year ID is required')) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: 'Failed to assign discipline master.' });
        }
    }
};

export const removeDisciplineMaster = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        const subClassId = parseInt(req.params.subClassId); // Param name from route
        // Expect snake_case from req.finalQuery due to middleware
        const academic_year_id = req.finalQuery.academic_year_id ? parseInt(req.finalQuery.academic_year_id as string) : undefined;

        if (isNaN(userId) || isNaN(subClassId)) {
            res.status(400).json({ success: false, error: 'Invalid User ID or Subclass ID in URL.' });
            return;
        }
        // Check the original finalQuery param existence before validating the parsed number
        if (req.finalQuery.academic_year_id && academic_year_id === undefined) {
            res.status(400).json({ success: false, error: 'Invalid Academic Year ID format in finalQuery parameter.' });
            return;
        }

        // Pass potentially undefined academic_year_id to service
        await userService.removeDisciplineMasterFromSubclass(userId, subClassId, academic_year_id);
        res.status(200).json({ success: true, message: 'Discipline Master assignment removed successfully.' });

    } catch (error: any) {
        console.error('Error removing discipline master assignment:', error);
        if (error.message.includes('Academic Year ID is required')) {
            res.status(400).json({ success: false, error: error.message });
        } else {
            res.status(200).json({ success: true, message: 'Discipline Master assignment removed successfully (or did not exist).' });
        }
    }
};

// Get all teachers with their subjects
export const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get subject_id filter if provided
        const subject_id = req.finalQuery.subject_id ? parseInt(req.finalQuery.subject_id as string) : undefined;

        // Make sure the subject_id is a valid number if provided
        if (req.finalQuery.subject_id && isNaN(subject_id as number)) {
            res.status(400).json({
                success: false,
                error: "Invalid subject ID format"
            });
            return;
        }

        // Use the service function to get teachers
        const formattedTeachers = await userService.getAllTeachers(subject_id);

        res.json({
            success: true,
            data: formattedTeachers
        });
    } catch (error: any) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
