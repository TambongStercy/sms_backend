// src/api/v1/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { extractPaginationAndFilters } from '../../../utils/pagination';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Define allowed filters for users
        const allowedFilters = ['name', 'email', 'gender', 'role', 'includeRoles', 'phone'];

        // Extract pagination and filter parameters from the request
        const { paginationOptions, filterOptions } = extractPaginationAndFilters(req.query, allowedFilters);

        const users = await userService.getAllUsers(paginationOptions, filterOptions);
        res.json(users);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error: any) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = await userService.updateUser(id, req.body);
        res.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await userService.deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
};

export const assignRole = async (req: Request, res: Response) => {
    try {
        const user_id = parseInt(req.params.id);
        const newRole = await userService.assignRole(user_id, req.body);
        res.status(201).json(newRole);
    } catch (error: any) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: error.message });
    }
};

export const removeRole = async (req: Request, res: Response) => {
    try {
        const user_id = parseInt(req.params.id);
        const role = req.params.roleId; // Assuming this is the enum value.
        const result = await userService.removeRole(user_id, role as any);
        res.json({ message: 'Role removed successfully', removedCount: result.count });
    } catch (error: any) {
        console.error('Error removing role:', error);
        res.status(500).json({ error: error.message });
    }
};
