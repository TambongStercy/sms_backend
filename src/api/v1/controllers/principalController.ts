import { Request, Response } from 'express';
import * as principalService from '../services/principalService';

/**
 * Get comprehensive school analytics
 */
export async function getSchoolAnalytics(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const analytics = await principalService.getSchoolAnalytics(yearId);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error: any) {
        console.error('Error fetching school analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch school analytics'
        });
    }
}

/**
 * Get comprehensive performance metrics
 */
export async function getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const metrics = await principalService.getPerformanceMetrics(yearId);

        res.status(200).json({
            success: true,
            data: metrics
        });
    } catch (error: any) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch performance metrics'
        });
    }
}

/**
 * Get financial overview
 */
export async function getFinancialOverview(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const overview = await principalService.getFinancialOverview(yearId);

        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error: any) {
        console.error('Error fetching financial overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch financial overview'
        });
    }
}

/**
 * Get discipline overview
 */
export async function getDisciplineOverview(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const overview = await principalService.getDisciplineOverview(yearId);

        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error: any) {
        console.error('Error fetching discipline overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch discipline overview'
        });
    }
}

/**
 * Get staff overview
 */
export async function getStaffOverview(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const overview = await principalService.getStaffOverview(yearId);

        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error: any) {
        console.error('Error fetching staff overview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch staff overview'
        });
    }
}

/**
 * Get principal dashboard with comprehensive data
 */
export async function getPrincipalDashboard(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const dashboard = await principalService.getPrincipalDashboard(yearId);

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error: any) {
        console.error('Error fetching principal dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch principal dashboard'
        });
    }
}

/**
 * Get academic performance report
 */
export async function getAcademicPerformanceReport(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId, classId, subjectId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        // Get performance metrics and filter if needed
        const metrics = await principalService.getPerformanceMetrics(yearId);

        let filteredData = metrics.academicPerformance;

        // Filter by subject if provided
        if (subjectId) {
            const subjectIdNum = parseInt(subjectId as string);
            filteredData = {
                ...filteredData,
                subjectPerformance: filteredData.subjectPerformance.filter(sp =>
                    sp.subjectName.includes(subjectIdNum.toString()) // Simple filter
                )
            };
        }

        // Filter by class if provided
        if (classId) {
            const classIdNum = parseInt(classId as string);
            filteredData = {
                ...filteredData,
                classPerformance: filteredData.classPerformance.filter(cp =>
                    cp.className.includes(classIdNum.toString()) // Simple filter
                )
            };
        }

        res.status(200).json({
            success: true,
            data: {
                academicPerformance: filteredData,
                generatedAt: new Date().toISOString(),
                filters: {
                    academicYearId: yearId,
                    classId: classId ? parseInt(classId as string) : null,
                    subjectId: subjectId ? parseInt(subjectId as string) : null
                }
            }
        });
    } catch (error: any) {
        console.error('Error generating academic performance report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate academic performance report'
        });
    }
}

/**
 * Get attendance analysis
 */
export async function getAttendanceAnalysis(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId, startDate, endDate, classId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        // Get performance metrics for attendance data
        const metrics = await principalService.getPerformanceMetrics(yearId);

        // In a full implementation, this would include date filtering and more detailed analysis
        const attendanceAnalysis = {
            overallMetrics: metrics.attendanceMetrics,
            dateRange: {
                startDate: startDate || 'Not specified',
                endDate: endDate || 'Not specified'
            },
            classFilter: classId ? parseInt(classId as string) : null,
            summary: {
                totalAnalyzed: metrics.teacherPerformance.totalTeachers * 30, // Simplified
                averageAttendanceRate: metrics.attendanceMetrics.overallAttendanceRate,
                trendsIdentified: 3, // Placeholder
                issuesDetected: 2 // Placeholder
            },
            recommendations: [
                'Monitor classes with attendance rates below 85%',
                'Implement attendance improvement strategies',
                'Follow up on students with frequent absences'
            ]
        };

        res.status(200).json({
            success: true,
            data: attendanceAnalysis
        });
    } catch (error: any) {
        console.error('Error generating attendance analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate attendance analysis'
        });
    }
}

/**
 * Get teacher performance analysis
 */
export async function getTeacherPerformanceAnalysis(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId, departmentId, performanceThreshold } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;
        const threshold = performanceThreshold ? parseFloat(performanceThreshold as string) : 10;

        const metrics = await principalService.getPerformanceMetrics(yearId);

        // Filter teachers by performance threshold
        const teacherAnalysis = metrics.teacherPerformance.teacherEfficiency.map(teacher => ({
            ...teacher,
            performanceCategory: teacher.averageStudentPerformance >= threshold ? 'ABOVE_THRESHOLD' : 'NEEDS_IMPROVEMENT',
            recommendations: teacher.averageStudentPerformance >= threshold ?
                ['Maintain current performance', 'Consider mentoring other teachers'] :
                ['Additional training recommended', 'Performance improvement plan needed']
        }));

        const summary = {
            totalTeachers: teacherAnalysis.length,
            aboveThreshold: teacherAnalysis.filter(t => t.performanceCategory === 'ABOVE_THRESHOLD').length,
            needsImprovement: teacherAnalysis.filter(t => t.performanceCategory === 'NEEDS_IMPROVEMENT').length,
            averagePerformance: teacherAnalysis.reduce((sum, t) => sum + t.averageStudentPerformance, 0) / teacherAnalysis.length
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                teacherAnalysis,
                performanceThreshold: threshold,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('Error generating teacher performance analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate teacher performance analysis'
        });
    }
}

/**
 * Get financial performance analysis
 */
export async function getFinancialPerformanceAnalysis(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        const financialData = await principalService.getFinancialOverview(yearId);

        // Enhanced financial analysis
        const analysis = {
            ...financialData,
            performanceIndicators: {
                collectionEfficiency: financialData.collectionRate >= 80 ? 'EXCELLENT' :
                    financialData.collectionRate >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
                outstandingRisk: financialData.outstandingDebts.length > 20 ? 'HIGH' :
                    financialData.outstandingDebts.length > 10 ? 'MEDIUM' : 'LOW',
                diversificationIndex: financialData.paymentMethodBreakdown.length >= 3 ? 'GOOD' : 'LIMITED'
            },
            alerts: [
                ...(financialData.collectionRate < 60 ? ['Collection rate below target (60%)'] : []),
                ...(financialData.outstandingDebts.length > 20 ? ['High number of outstanding debts'] : []),
                ...(financialData.pendingPayments > 50 ? ['Significant pending payments detected'] : [])
            ],
            recommendations: [
                'Implement automated payment reminders',
                'Offer flexible payment plans for overdue accounts',
                'Regular financial reconciliation and reporting'
            ]
        };

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error: any) {
        console.error('Error generating financial performance analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate financial performance analysis'
        });
    }
}

/**
 * Get school overview summary for quick insights
 */
export async function getSchoolOverviewSummary(req: Request, res: Response): Promise<void> {
    try {
        const { academicYearId } = req.query;
        const yearId = academicYearId ? parseInt(academicYearId as string) : undefined;

        // Get all overview data in parallel
        const [
            analytics,
            performanceMetrics,
            financialOverview,
            disciplineOverview,
            staffOverview
        ] = await Promise.all([
            principalService.getSchoolAnalytics(yearId),
            principalService.getPerformanceMetrics(yearId),
            principalService.getFinancialOverview(yearId),
            principalService.getDisciplineOverview(yearId),
            principalService.getStaffOverview(yearId)
        ]);

        // Create summary with key insights
        const summary = {
            keyMetrics: {
                totalStudents: analytics.totalStudents,
                totalTeachers: analytics.totalTeachers,
                collectionRate: financialOverview.collectionRate,
                overallPassRate: performanceMetrics.academicPerformance.overallPassRate,
                attendanceRate: analytics.averageAttendanceRate,
                disciplineIssues: disciplineOverview.pendingIssues
            },
            alerts: [
                ...(analytics.averageAttendanceRate < 85 ? ['Low attendance rate detected'] : []),
                ...(performanceMetrics.academicPerformance.overallPassRate < 70 ? ['Academic performance below target'] : []),
                ...(financialOverview.collectionRate < 80 ? ['Fee collection below target'] : []),
                ...(disciplineOverview.pendingIssues > 10 ? ['High number of pending discipline issues'] : [])
            ],
            trends: {
                enrollmentTrend: analytics.newEnrollmentsThisMonth > 5 ? 'INCREASING' : 'STABLE',
                performanceTrend: 'STABLE', // Simplified
                financialTrend: financialOverview.collectionRate > 80 ? 'POSITIVE' : 'CONCERNING'
            },
            priorities: [
                'Monitor academic performance across all subjects',
                'Ensure timely fee collection',
                'Address pending discipline issues',
                'Maintain high attendance rates'
            ]
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        console.error('Error generating school overview summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate school overview summary'
        });
    }
} 