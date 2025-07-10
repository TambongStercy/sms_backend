import { Request, Response } from 'express';
import * as auditTrailService from '../services/auditTrailService';

// Get audit logs with filters and pagination
export async function getAuditLogs(req: Request, res: Response) {
    try {
        const {
            userId,
            action,
            entityType,
            entityId,
            severity,
            dateFrom,
            dateTo,
            search
        } = req.query;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const filters = {
            userId: userId ? parseInt(userId as string) : undefined,
            action: action as string,
            entityType: entityType as string,
            entityId: entityId ? parseInt(entityId as string) : undefined,
            severity: severity as any,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string,
            search: search as string
        };

        const result = await auditTrailService.getAuditLogs(filters, page, limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get audit statistics
export async function getAuditStats(req: Request, res: Response) {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

        const stats = await auditTrailService.getAuditStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get audit trail for specific entity
export async function getEntityAuditTrail(req: Request, res: Response) {
    try {
        const { entityType, entityId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!entityType || !entityId) {
            return res.status(400).json({
                success: false,
                error: 'entityType and entityId are required'
            });
        }

        const result = await auditTrailService.getEntityAuditTrail(
            entityType,
            parseInt(entityId),
            page,
            limit
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get user activity summary
export async function getUserActivitySummary(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        const { dateFrom, dateTo } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const result = await auditTrailService.getUserActivitySummary(
            parseInt(userId),
            dateFrom as string,
            dateTo as string
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get current user's activity summary
export async function getMyActivitySummary(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const { dateFrom, dateTo } = req.query;

        const result = await auditTrailService.getUserActivitySummary(
            userId,
            dateFrom as string,
            dateTo as string
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Manual audit log creation (for testing or special cases)
export async function createAuditLog(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const {
            action,
            entityType,
            entityId,
            changes,
            description,
            severity
        } = req.body;

        if (!action || !entityType || !entityId) {
            return res.status(400).json({
                success: false,
                error: 'action, entityType, and entityId are required'
            });
        }

        const auditLog = await auditTrailService.createAuditLog({
            userId,
            action,
            entityType,
            entityId,
            changes,
            description,
            severity,
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown'
        });

        res.status(201).json({
            success: true,
            data: auditLog
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
} 