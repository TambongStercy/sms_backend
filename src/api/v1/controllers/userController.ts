// src/api/v1/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for users in snake_case
        const allowedFilters = ['name', 'email', 'gender', 'role', 'include_roles', 'phone'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const result = await userService.getAllUsers(paginationOptions, filterOptions);
        res.json({
            success: true,
            data: result.data,
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

export const createUser = async (req: Request, res: Response) => {
    try {
        // Use the body directly - middleware handles the conversion
        const userData = req.body;

        const newUser = await userService.createUser(userData);
        res.status(201).json({
            success: true,
            data: newUser
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
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

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Use the body directly - middleware handles the conversion
        const userData = req.body;

        const updatedUser = await userService.updateUser(id, userData);
        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await userService.deleteUser(id);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const assignRole = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        // Use the body directly - middleware handles the conversion
        const roleData = {
            role: req.body.role,
            academic_year_id: req.body.academic_year_id
        };

        const newRole = await userService.assignRole(userId, roleData);
        res.status(201).json({
            success: true,
            data: newRole
        });
    } catch (error: any) {
        console.error('Error assigning role:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const removeRole = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const role = req.params.roleId; // Assuming this is the enum value.
        const result = await userService.removeRole(userId, role as any);
        res.json({
            success: true,
            message: 'Role removed successfully',
            removedCount: result.count
        });
    } catch (error: any) {
        console.error('Error removing role:', error);
        res.status(500).json({
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
