import { Request, Response } from 'express';
import * as disciplineMasterService from '../services/disciplineMasterService';

/**
 * Get Discipline Master enhanced dashboard
 */
export async function getDMDashboard(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;

        const dashboard = await disciplineMasterService.getDisciplineMasterDashboard(academicYearId);

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error fetching Discipline Master dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
}

/**
 * Get comprehensive behavioral analytics
 */
export async function getBehavioralAnalyticsData(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;

        const analytics = await disciplineMasterService.getBehavioralAnalytics(academicYearId);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching behavioral analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch behavioral analytics'
        });
    }
}

/**
 * Get detailed student behavior profile
 */
export async function getStudentBehaviorProfileData(req: Request, res: Response) {
    try {
        const studentId = parseInt(req.params.studentId);
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;

        if (!studentId || isNaN(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid student ID is required'
            });
        }

        const profile = await disciplineMasterService.getStudentBehaviorProfile(studentId, academicYearId);

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching student behavior profile:', error);
        
        if (error instanceof Error && error.message === 'Student not found') {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to fetch student behavior profile'
        });
    }
}

/**
 * Get early warning system data
 */
export async function getEarlyWarningSystemData(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;

        const warningData = await disciplineMasterService.getEarlyWarningSystem(academicYearId);

        res.status(200).json({
            success: true,
            data: warningData
        });
    } catch (error) {
        console.error('Error fetching early warning system data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch early warning system data'
        });
    }
}

/**
 * Get discipline statistics and trends
 */
export async function getDisciplineStatistics(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;
        
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;

        // For now, return a subset of the behavioral analytics
        const analytics = await disciplineMasterService.getBehavioralAnalytics(academicYearId);
        
        const statistics = {
            overview: {
                totalStudents: analytics.totalStudents,
                studentsWithIssues: analytics.studentsWithIssues,
                behaviorScore: analytics.behaviorScore,
                riskDistribution: analytics.riskDistribution
            },
            trends: analytics.monthlyTrends,
            issueAnalysis: analytics.issueTypeAnalysis,
            classroomHotspots: analytics.classroomHotspots,
            filters: {
                academicYearId,
                startDate,
                endDate,
                classId
            }
        };

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('Error fetching discipline statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch discipline statistics'
        });
    }
}

/**
 * Get intervention tracking data
 */
export async function getInterventionTracking(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;
        const status = req.query.status as string;
        const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;

        // For now, return mock intervention data
        // In a full implementation, this would come from an interventions table
        const interventions = [
            {
                id: 1,
                studentId: 123,
                studentName: "John Doe",
                interventionType: "Counseling",
                description: "Behavioral counseling for repeated misconduct",
                startDate: "2024-01-15",
                expectedEndDate: "2024-02-15",
                status: "ONGOING",
                effectiveness: 75,
                followUpRequired: true,
                nextReviewDate: "2024-01-22",
                assignedTo: "School Counselor",
                notes: [
                    {
                        date: "2024-01-15",
                        note: "Initial assessment completed",
                        recordedBy: "Discipline Master"
                    },
                    {
                        date: "2024-01-18",
                        note: "Student showing improvement",
                        recordedBy: "School Counselor"
                    }
                ]
            },
            {
                id: 2,
                studentId: 124,
                studentName: "Jane Smith",
                interventionType: "Parent Conference",
                description: "Meeting with parents regarding lateness issues",
                startDate: "2024-01-10",
                actualEndDate: "2024-01-10",
                status: "COMPLETED",
                outcome: "SUCCESSFUL",
                effectiveness: 90,
                followUpRequired: false,
                assignedTo: "Vice Principal",
                notes: [
                    {
                        date: "2024-01-10",
                        note: "Parents cooperative, agreed to monitor student",
                        recordedBy: "Vice Principal"
                    }
                ]
            }
        ];

        // Filter by status if provided
        const filteredInterventions = status ? 
            interventions.filter(i => i.status === status.toUpperCase()) : 
            interventions;

        // Filter by student if provided
        const finalInterventions = studentId ? 
            filteredInterventions.filter(i => i.studentId === studentId) : 
            filteredInterventions;

        res.status(200).json({
            success: true,
            data: finalInterventions,
            meta: {
                total: finalInterventions.length,
                filters: { academicYearId, status, studentId }
            }
        });
    } catch (error) {
        console.error('Error fetching intervention tracking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch intervention tracking data'
        });
    }
}

/**
 * Create new intervention plan
 */
export async function createIntervention(req: Request, res: Response) {
    try {
        const {
            studentId,
            interventionType,
            description,
            expectedEndDate,
            assignedTo
        } = req.body;

        // Validate required fields
        if (!studentId || !interventionType || !description) {
            return res.status(400).json({
                success: false,
                error: 'Student ID, intervention type, and description are required'
            });
        }

        // In a full implementation, this would create a record in an interventions table
        // For now, return a mock response
        const newIntervention = {
            id: Date.now(), // Mock ID
            studentId,
            interventionType,
            description,
            startDate: new Date().toISOString(),
            expectedEndDate,
            status: 'PLANNED',
            assignedTo,
            createdAt: new Date().toISOString(),
            createdBy: req.user?.name || 'Discipline Master'
        };

        res.status(201).json({
            success: true,
            message: 'Intervention plan created successfully',
            data: newIntervention
        });
    } catch (error) {
        console.error('Error creating intervention:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create intervention plan'
        });
    }
}

/**
 * Update intervention status
 */
export async function updateInterventionStatus(req: Request, res: Response) {
    try {
        const interventionId = parseInt(req.params.interventionId);
        const { status, outcome, notes, effectiveness } = req.body;

        if (!interventionId || isNaN(interventionId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid intervention ID is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        // In a full implementation, this would update the intervention record
        const updatedIntervention = {
            id: interventionId,
            status,
            outcome,
            effectiveness,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user?.name || 'Discipline Master'
        };

        if (notes) {
            const newNote = {
                date: new Date().toISOString(),
                note: notes,
                recordedBy: req.user?.name || 'Discipline Master'
            };
            // Add note to intervention
        }

        res.status(200).json({
            success: true,
            message: 'Intervention updated successfully',
            data: updatedIntervention
        });
    } catch (error) {
        console.error('Error updating intervention:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update intervention'
        });
    }
}

/**
 * Get risk assessment for all students
 */
export async function getRiskAssessment(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;
        const riskLevel = req.query.riskLevel as string;
        const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;

        // Get early warning data which contains risk assessment
        const warningData = await disciplineMasterService.getEarlyWarningSystem(academicYearId);
        
        let students = warningData.criticalStudents;

        // Filter by risk level if provided
        if (riskLevel) {
            students = students.filter(student => 
                student.warningLevel === riskLevel.toUpperCase()
            );
        }

        const riskAssessment = {
            totalStudentsAssessed: students.length,
            riskLevelBreakdown: {
                critical: students.filter(s => s.warningLevel === 'CRITICAL').length,
                high: students.filter(s => s.warningLevel === 'HIGH').length,
                moderate: students.filter(s => s.warningLevel === 'MODERATE').length
            },
            studentsAtRisk: students,
            riskIndicators: warningData.riskIndicators,
            recommendations: warningData.preventiveRecommendations,
            filters: { academicYearId, riskLevel, classId }
        };

        res.status(200).json({
            success: true,
            data: riskAssessment
        });
    } catch (error) {
        console.error('Error fetching risk assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch risk assessment'
        });
    }
}

/**
 * Generate discipline report
 */
export async function generateDisciplineReport(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? 
            parseInt(req.query.academicYearId as string) : undefined;
        const reportType = req.query.reportType as string || 'comprehensive';
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const [dashboard, analytics, warningData] = await Promise.all([
            disciplineMasterService.getDisciplineMasterDashboard(academicYearId),
            disciplineMasterService.getBehavioralAnalytics(academicYearId),
            disciplineMasterService.getEarlyWarningSystem(academicYearId)
        ]);

        const report = {
            reportInfo: {
                type: reportType,
                generatedAt: new Date().toISOString(),
                generatedBy: req.user?.name || 'Discipline Master',
                academicYearId,
                dateRange: { startDate, endDate }
            },
            executiveSummary: {
                totalActiveIssues: dashboard.totalActiveIssues,
                studentsWithIssues: analytics.studentsWithIssues,
                behaviorScore: analytics.behaviorScore,
                criticalCases: dashboard.criticalCases,
                resolutionRate: Math.round((dashboard.resolvedThisWeek / dashboard.totalActiveIssues) * 100) || 0
            },
            detailedAnalysis: {
                dashboard,
                behavioralAnalytics: analytics,
                earlyWarning: warningData
            },
            recommendations: [
                'Increase counseling sessions for high-risk students',
                'Implement peer mentoring program',
                'Provide additional teacher training on classroom management',
                'Enhance parent engagement initiatives'
            ],
            actionItems: [
                {
                    priority: 'HIGH',
                    action: 'Address critical cases immediately',
                    responsible: 'Discipline Master',
                    deadline: '1 week'
                },
                {
                    priority: 'MEDIUM',
                    action: 'Review classroom hotspots',
                    responsible: 'Vice Principal',
                    deadline: '2 weeks'
                }
            ]
        };

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating discipline report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate discipline report'
        });
    }
} 