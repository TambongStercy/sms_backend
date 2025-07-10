import { Request, Response } from 'express';
import * as systemService from '../services/systemService';

/**
 * Get current system settings
 */
export async function getSettings(req: Request, res: Response): Promise<void> {
    try {
        const settings = await systemService.getSystemSettings();

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        console.error('Error fetching system settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system settings'
        });
    }
}

/**
 * Update system settings
 */
export async function updateSettings(req: Request, res: Response): Promise<void> {
    try {
        const settingsUpdate = req.body;

        // Validate required fields if updating critical settings
        if (settingsUpdate.schoolName === '') {
            res.status(400).json({
                success: false,
                error: 'School name cannot be empty'
            });
            return;
        }

        const updatedSettings = await systemService.updateSystemSettings(settingsUpdate);

        res.status(200).json({
            success: true,
            message: 'System settings updated successfully',
            data: updatedSettings
        });
    } catch (error: any) {
        console.error('Error updating system settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update system settings'
        });
    }
}

/**
 * Get comprehensive system health status
 */
export async function getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
        const healthStatus = await systemService.getSystemHealth();

        res.status(200).json({
            success: true,
            data: healthStatus
        });
    } catch (error: any) {
        console.error('Error fetching system health:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system health status'
        });
    }
}

/**
 * Perform manual system backup
 */
export async function performBackup(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const backupResult = await systemService.performSystemBackup(userId, 'MANUAL');

        if (backupResult.status === 'SUCCESS') {
            res.status(201).json({
                success: true,
                message: 'System backup completed successfully',
                data: backupResult
            });
        } else {
            res.status(500).json({
                success: false,
                error: backupResult.error_message || 'Backup failed',
                data: backupResult
            });
        }
    } catch (error: any) {
        console.error('Error performing system backup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform system backup'
        });
    }
}

/**
 * Perform system cleanup operations
 */
export async function performCleanup(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const cleanupResults = await systemService.performSystemCleanup(userId);

        const totalRecordsCleaned = cleanupResults.reduce((sum, result) => sum + result.records_cleaned, 0);
        const totalSpaceFreed = cleanupResults.reduce((sum, result) => sum + result.space_freed, 0);

        res.status(200).json({
            success: true,
            message: `System cleanup completed. ${totalRecordsCleaned} records cleaned, ${(totalSpaceFreed / 1024 / 1024).toFixed(2)} MB freed.`,
            data: {
                operations: cleanupResults,
                summary: {
                    totalRecordsCleaned,
                    totalSpaceFreed,
                    totalSpaceFreedMB: Math.round((totalSpaceFreed / 1024 / 1024) * 100) / 100
                }
            }
        });
    } catch (error: any) {
        console.error('Error performing system cleanup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform system cleanup'
        });
    }
}

/**
 * Get system logs with filtering
 */
export async function getSystemLogs(req: Request, res: Response): Promise<void> {
    try {
        const {
            level,
            category,
            startDate,
            endDate,
            userId,
            search,
            limit = '100'
        } = req.query;

        const filters = {
            level: level as any,
            category: category as any,
            start_date: startDate as string,
            end_date: endDate as string,
            user_id: userId ? parseInt(userId as string) : undefined,
            search: search as string
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key as keyof typeof filters] === undefined) {
                delete filters[key as keyof typeof filters];
            }
        });

        const limitNumber = Math.min(parseInt(limit as string) || 100, 1000); // Cap at 1000
        const logs = await systemService.getSystemLogs(filters, limitNumber);

        res.status(200).json({
            success: true,
            data: logs,
            meta: {
                total: logs.length,
                limit: limitNumber,
                filters: filters
            }
        });
    } catch (error: any) {
        console.error('Error fetching system logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system logs'
        });
    }
}

/**
 * Get comprehensive system statistics
 */
export async function getSystemStatistics(req: Request, res: Response): Promise<void> {
    try {
        const statistics = await systemService.getSystemStatistics();

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error: any) {
        console.error('Error fetching system statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system statistics'
        });
    }
}

/**
 * Get system dashboard data for SUPER_MANAGER
 */
export async function getSystemDashboard(req: Request, res: Response): Promise<void> {
    try {
        const dashboardData = await systemService.getSystemDashboard();

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error: any) {
        console.error('Error fetching system dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system dashboard data'
        });
    }
}

/**
 * Get system version and basic info
 */
export async function getSystemInfo(req: Request, res: Response): Promise<void> {
    try {
        const settings = await systemService.getSystemSettings();
        const health = await systemService.getSystemHealth();

        res.status(200).json({
            success: true,
            data: {
                school_name: settings.school_name,
                system_version: health.system_version,
                uptime: health.uptime,
                status: health.status,
                maintenance_mode: settings.maintenance_mode
            }
        });
    } catch (error: any) {
        console.error('Error fetching system info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system information'
        });
    }
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(req: Request, res: Response): Promise<void> {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            res.status(400).json({
                success: false,
                error: 'enabled field must be a boolean'
            });
            return;
        }

        const updatedSettings = await systemService.updateSystemSettings({
            maintenance_mode: enabled
        });

        res.status(200).json({
            success: true,
            message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
            data: {
                maintenance_mode: updatedSettings.maintenance_mode
            }
        });
    } catch (error: any) {
        console.error('Error toggling maintenance mode:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle maintenance mode'
        });
    }
} 