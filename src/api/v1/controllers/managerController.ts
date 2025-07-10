import { Request, Response } from 'express';
import * as managerService from '../services/managerService';

/**
 * Get manager enhanced dashboard
 */
export async function getManagerDashboard(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ?
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboard = await managerService.getManagerDashboard(academicYearId);

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error fetching manager dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch manager dashboard'
        });
    }
}

/**
 * Get staff management overview
 */
export async function getStaffManagement(req: Request, res: Response) {
    try {
        const filters = {
            department: req.query.department as string,
            role: req.query.role as string,
            status: req.query.status as string,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20
        };

        const staffData = await managerService.getStaffManagement(filters);

        res.status(200).json({
            success: true,
            data: staffData
        });
    } catch (error) {
        console.error('Error fetching staff management data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch staff management data'
        });
    }
}

/**
 * Get operational support overview
 */
export async function getOperationalSupport(req: Request, res: Response) {
    try {
        const operationalData = await managerService.getOperationalSupport();

        res.status(200).json({
            success: true,
            data: operationalData
        });
    } catch (error) {
        console.error('Error fetching operational support data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch operational support data'
        });
    }
}

/**
 * Get administrative support overview
 */
export async function getAdministrativeSupport(req: Request, res: Response) {
    try {
        // Mock administrative support data since service function doesn't exist
        const administrativeData = {
            documentManagement: {
                pendingApprovals: 5,
                expiringSoon: 3,
                renewalsNeeded: 2,
                totalDocuments: 150
            },
            communicationSummary: {
                noticesSent: 12,
                messagesUnread: 8,
                urgentCommunications: 2,
                broadcastsScheduled: 4
            },
            eventCoordination: {
                upcomingEvents: 6,
                eventsThisWeek: 2,
                pendingApprovals: 3,
                resourcesNeeded: 4
            },
            complianceTracking: {
                regulatoryCompliance: 85,
                pendingAudits: 2,
                policiesUpdated: 4,
                trainingRequired: 8
            }
        };

        res.status(200).json({
            success: true,
            data: administrativeData
        });
    } catch (error) {
        console.error('Error fetching administrative support data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch administrative support data'
        });
    }
}

/**
 * Generate operational report
 */
export async function generateOperationalReport(req: Request, res: Response) {
    try {
        const filters = {
            reportType: (req.query.period as string || 'MONTHLY').toUpperCase() as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY',
            includeAttendance: req.query.includeAttendance === 'true',
            includeMaintenance: req.query.includeMaintenance === 'true',
            includePerformance: req.query.includePerformance === 'true',
            academicYearId: req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined
        };

        const report = await managerService.generateOperationalReport(filters);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating operational report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate operational report'
        });
    }
}

/**
 * Process maintenance request
 */
export async function processMaintenanceRequest(req: Request, res: Response) {
    try {
        const requestId = parseInt(req.params.requestId);
        const { action, assignedTo, priority, notes, estimatedCompletion } = req.body;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid request ID is required'
            });
        }

        if (!action || !['APPROVE', 'REJECT', 'ASSIGN'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Valid action is required (APPROVE, REJECT, or ASSIGN)'
            });
        }

        const result = await managerService.assignMaintenanceTask(requestId, {
            assignedTo,
            priority,
            notes,
            expectedCompletion: estimatedCompletion
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing maintenance request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process maintenance request'
        });
    }
}

/**
 * Update facility status
 */
export async function updateFacilityStatus(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityId);
        const { status, notes } = req.body;

        if (!facilityId || isNaN(facilityId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid facility ID is required'
            });
        }

        if (!status || !['OPERATIONAL', 'MAINTENANCE', 'OUT_OF_ORDER'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Valid status is required (OPERATIONAL, MAINTENANCE, or OUT_OF_ORDER)'
            });
        }

        const result = await managerService.updateFacilityStatus(facilityId, {
            status,
            notes,
            updatedBy: req.user?.id || 1
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating facility status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update facility status'
        });
    }
}

/**
 * Process staff leave request
 */
export async function processLeaveRequest(req: Request, res: Response) {
    try {
        const requestId = parseInt(req.params.requestId);
        const { action, notes } = req.body;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid request ID is required'
            });
        }

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Valid action is required (APPROVE or REJECT)'
            });
        }

        const result = await managerService.processLeaveRequest(requestId, {
            action,
            comments: notes,
            processedBy: req.user?.id || 1
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing leave request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process leave request'
        });
    }
}

/**
 * Create task assignment
 */
export async function createTaskAssignment(req: Request, res: Response) {
    try {
        const { title, description, assignedTo, priority, dueDate, category } = req.body;

        // Validation
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Task title is required'
            });
        }

        if (!description || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Task description is required'
            });
        }

        if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one assignee is required'
            });
        }

        if (!dueDate) {
            return res.status(400).json({
                success: false,
                error: 'Due date is required'
            });
        }

        const taskData = {
            title: title.trim(),
            description: description.trim(),
            assignedTo,
            priority: priority || 'MEDIUM',
            dueDate,
            category: category || 'GENERAL'
        };

        const result = await managerService.delegateTask({
            title,
            description,
            assignedTo: assignedTo[0], // Take first user from array
            assignedBy: req.user?.id || 1,
            priority: priority || 'MEDIUM',
            deadline: dueDate,
            category: category || 'GENERAL'
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating task assignment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task assignment'
        });
    }
}

/**
 * Get staff attendance summary
 */
export async function getStaffAttendanceSummary(req: Request, res: Response) {
    try {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const departmentId = req.query.departmentId ?
            parseInt(req.query.departmentId as string) : undefined;

        // Mock attendance summary
        const attendanceSummary = {
            period: {
                startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: endDate || new Date().toISOString().split('T')[0]
            },
            summary: {
                totalStaff: 45,
                averageAttendance: 93.5,
                totalAbsences: 28,
                punctualityRate: 89.2
            },
            byDepartment: [
                { department: 'Mathematics', attendance: 95.2, staff: 5 },
                { department: 'Sciences', attendance: 91.8, staff: 8 },
                { department: 'Languages', attendance: 94.1, staff: 6 },
                { department: 'Administration', attendance: 92.3, staff: 5 }
            ],
            trends: {
                thisWeek: 93.5,
                lastWeek: 91.8,
                trend: 'IMPROVING'
            },
            topPerformers: [
                { name: 'Math Teacher', attendance: 100, department: 'Mathematics' },
                { name: 'Science HOD', attendance: 98.5, department: 'Sciences' }
            ]
        };

        res.status(200).json({
            success: true,
            data: attendanceSummary
        });
    } catch (error) {
        console.error('Error fetching staff attendance summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch staff attendance summary'
        });
    }
}

/**
 * Get facility maintenance schedule
 */
export async function getFacilityMaintenanceSchedule(req: Request, res: Response) {
    try {
        const facilityType = req.query.facilityType as string;
        const status = req.query.status as string;

        // Mock maintenance schedule
        const maintenanceSchedule = {
            upcomingMaintenance: [
                {
                    id: 1,
                    facility: 'Science Laboratory',
                    type: 'Preventive Maintenance',
                    scheduledDate: '2024-03-15',
                    assignedTeam: 'Lab Maintenance Team',
                    priority: 'MEDIUM',
                    estimatedDuration: '4 hours'
                },
                {
                    id: 2,
                    facility: 'Generator',
                    type: 'Emergency Repair',
                    scheduledDate: '2024-03-08',
                    assignedTeam: 'Electrical Team',
                    priority: 'CRITICAL',
                    estimatedDuration: '8 hours'
                }
            ],
            overdueMaintenance: [
                {
                    id: 3,
                    facility: 'Computer Lab Air Conditioning',
                    type: 'Filter Replacement',
                    originalDate: '2024-02-28',
                    daysPastDue: 8,
                    priority: 'HIGH'
                }
            ],
            maintenanceHistory: [
                {
                    facility: 'Library HVAC',
                    completedDate: '2024-02-25',
                    type: 'Filter Replacement',
                    cost: 150,
                    technician: 'HVAC Specialist'
                }
            ],
            totalFacilities: 25,
            needingMaintenance: 8,
            maintenanceCompliance: 87
        };

        res.status(200).json({
            success: true,
            data: maintenanceSchedule
        });
    } catch (error) {
        console.error('Error fetching facility maintenance schedule:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch facility maintenance schedule'
        });
    }
}

/**
 * Get inventory status
 */
export async function getInventoryStatus(req: Request, res: Response) {
    try {
        const category = req.query.category as string;
        const alertsOnly = req.query.alertsOnly === 'true';

        // Mock inventory status
        const inventoryStatus = {
            overview: {
                totalItems: 150,
                lowStock: 8,
                outOfStock: 3,
                wellStocked: 139
            },
            categories: [
                {
                    category: 'Office Supplies',
                    totalItems: 45,
                    alerts: 3,
                    value: 2500
                },
                {
                    category: 'Cleaning Supplies',
                    totalItems: 25,
                    alerts: 2,
                    value: 800
                },
                {
                    category: 'Educational Materials',
                    totalItems: 60,
                    alerts: 4,
                    value: 5200
                }
            ],
            criticalItems: [
                {
                    item: 'Chalk',
                    currentStock: 0,
                    minimumRequired: 100,
                    status: 'OUT_OF_STOCK',
                    lastOrdered: '2024-01-20',
                    supplier: 'Educational Supplies Co'
                },
                {
                    item: 'Office Paper',
                    currentStock: 5,
                    minimumRequired: 20,
                    status: 'LOW_STOCK',
                    lastOrdered: '2024-02-15',
                    supplier: 'Office Supplies Ltd'
                }
            ],
            reorderSuggestions: [
                {
                    item: 'Chalk',
                    suggestedQuantity: 200,
                    estimatedCost: 150,
                    urgency: 'HIGH'
                },
                {
                    item: 'Printer Ink',
                    suggestedQuantity: 10,
                    estimatedCost: 300,
                    urgency: 'MEDIUM'
                }
            ]
        };

        res.status(200).json({
            success: true,
            data: inventoryStatus
        });
    } catch (error) {
        console.error('Error fetching inventory status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch inventory status'
        });
    }
} 