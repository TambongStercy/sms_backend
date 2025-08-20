import { Request, Response } from 'express';
import * as classProfileAnalyticsService from '../services/classProfileAnalyticsService';

// Get comprehensive class profile analytics
export async function getClassProfileAnalytics(req: Request, res: Response) {
    try {
        const { classId } = req.params;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'classId is required'
            });
        }

        const analytics = await classProfileAnalyticsService.getClassProfileAnalytics(
            parseInt(classId),
            academicYearId
        );

        res.json({
            success: true,
            data: analytics
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Compare two classes
export async function compareClasses(req: Request, res: Response) {
    try {
        const { class1Id, class2Id } = req.params;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!class1Id || !class2Id) {
            return res.status(400).json({
                success: false,
                error: 'class1Id and class2Id are required'
            });
        }

        const comparison = await classProfileAnalyticsService.compareClasses(
            parseInt(class1Id),
            parseInt(class2Id),
            academicYearId
        );

        res.json({
            success: true,
            data: comparison
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get all classes overview
export async function getAllClassesOverview(req: Request, res: Response) {
    try {
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        const overview = await classProfileAnalyticsService.getAllClassesOverview(academicYearId);

        res.json({
            success: true,
            data: overview
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get class performance trends
export async function getClassTrends(req: Request, res: Response) {
    try {
        const { classId } = req.params;
        const { dateFrom, dateTo } = req.query;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'classId is required'
            });
        }

        if (!dateFrom || !dateTo) {
            return res.status(400).json({
                success: false,
                error: 'dateFrom and dateTo are required'
            });
        }

        const trends = await classProfileAnalyticsService.getClassTrends(
            parseInt(classId),
            dateFrom as string,
            dateTo as string,
            academicYearId
        );

        res.json({
            success: true,
            data: trends
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get class rankings
export async function getClassRankings(req: Request, res: Response) {
    try {
        const { criteria } = req.query;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!criteria) {
            return res.status(400).json({
                success: false,
                error: 'criteria is required (academic, attendance, financial, discipline)'
            });
        }

        const validCriteria = ['academic', 'attendance', 'financial', 'discipline'];
        if (!validCriteria.includes(criteria as string)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid criteria. Must be one of: academic, attendance, financial, discipline'
            });
        }

        const rankings = await classProfileAnalyticsService.getClassRankings(
            criteria as any,
            academicYearId
        );

        res.json({
            success: true,
            data: rankings
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get class dashboard summary
export async function getClassDashboardSummary(req: Request, res: Response) {
    try {
        const { classId } = req.params;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'classId is required'
            });
        }

        const analytics = await classProfileAnalyticsService.getClassProfileAnalytics(
            parseInt(classId),
            academicYearId
        );

        // Create a summary for dashboard display
        const summary = {
            classId: analytics.classId,
            className: analytics.className,
            totalStudents: analytics.totalStudents,
            keyMetrics: {
                averageGrade: analytics.academicPerformance.averageGrade,
                passRate: analytics.academicPerformance.passRate,
                attendanceRate: analytics.attendance.averageAttendanceRate,
                feeCollectionRate: analytics.finances.collectionRate,
                disciplineIncidents: analytics.discipline.totalIncidents
            },
            alerts: [] as Array<{type: string, level: string, message: string}>,
            recommendations: [] as string[]
        };

        // Add alerts based on performance
        if (analytics.academicPerformance.averageGrade < 50) {
            summary.alerts.push({
                type: 'academic',
                level: 'high',
                message: 'Class average grade is below 50%'
            });
        }

        if (analytics.attendance.averageAttendanceRate < 80) {
            summary.alerts.push({
                type: 'attendance',
                level: 'medium',
                message: 'Class attendance rate is below 80%'
            });
        }

        if (analytics.finances.collectionRate < 70) {
            summary.alerts.push({
                type: 'financial',
                level: 'high',
                message: 'Fee collection rate is below 70%'
            });
        }

        if (analytics.discipline.totalIncidents > 10) {
            summary.alerts.push({
                type: 'discipline',
                level: 'medium',
                message: 'High number of discipline incidents'
            });
        }

        // Add recommendations
        if (analytics.academicPerformance.averageGrade < 60) {
            summary.recommendations.push('Consider additional tutoring or remedial classes');
        }

        if (analytics.attendance.chronicAbsentees > 5) {
            summary.recommendations.push('Implement attendance intervention program');
        }

        if (analytics.finances.defaulters > 10) {
            summary.recommendations.push('Review and improve fee collection strategies');
        }

        res.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get class performance insights
export async function getClassInsights(req: Request, res: Response) {
    try {
        const { classId } = req.params;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'classId is required'
            });
        }

        const analytics = await classProfileAnalyticsService.getClassProfileAnalytics(
            parseInt(classId),
            academicYearId
        );

        // Generate insights based on analytics
        const insights = {
            strengths: [] as string[],
            weaknesses: [] as string[],
            opportunities: [] as string[],
            threats: [] as string[]
        };

        // Analyze strengths
        if (analytics.academicPerformance.averageGrade > 70) {
            insights.strengths.push('Strong academic performance');
        }
        if (analytics.attendance.averageAttendanceRate > 90) {
            insights.strengths.push('Excellent attendance rate');
        }
        if (analytics.finances.collectionRate > 85) {
            insights.strengths.push('High fee collection rate');
        }
        if (analytics.discipline.totalIncidents < 5) {
            insights.strengths.push('Low discipline issues');
        }

        // Analyze weaknesses
        if (analytics.academicPerformance.averageGrade < 50) {
            insights.weaknesses.push('Below average academic performance');
        }
        if (analytics.attendance.chronicAbsentees > 10) {
            insights.weaknesses.push('High number of chronic absentees');
        }
        if (analytics.finances.defaulters > 15) {
            insights.weaknesses.push('High number of fee defaulters');
        }
        if (analytics.discipline.pendingIncidents > 5) {
            insights.weaknesses.push('Unresolved discipline issues');
        }

        // Analyze opportunities
        if (analytics.academicPerformance.aboveAverageCount > analytics.academicPerformance.belowAverageCount) {
            insights.opportunities.push('Potential for peer tutoring programs');
        }
        if (analytics.teachers.totalTeachers > 5) {
            insights.opportunities.push('Good teacher-student ratio allows for personalized attention');
        }
        if (analytics.demographics.newStudents > 0) {
            insights.opportunities.push('Fresh perspectives from new students');
        }

        // Analyze threats
        if (analytics.attendance.chronicAbsentees > 20) {
            insights.threats.push('High absenteeism may affect overall class performance');
        }
        if (analytics.finances.collectionRate < 60) {
            insights.threats.push('Low fee collection may affect class resources');
        }
        if (analytics.discipline.totalIncidents > 20) {
            insights.threats.push('High discipline issues may disrupt learning environment');
        }

        res.json({
            success: true,
            data: insights
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Export class analytics report
export async function exportClassReport(req: Request, res: Response) {
    try {
        const { classId } = req.params;
        const { format } = req.query;
        const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string) : undefined;

        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'classId is required'
            });
        }

        const analytics = await classProfileAnalyticsService.getClassProfileAnalytics(
            parseInt(classId),
            academicYearId
        );

        const report = {
            generatedAt: new Date().toISOString(),
            classId: parseInt(classId),
            academicYearId,
            analytics,
            summary: {
                totalStudents: analytics.totalStudents,
                keyPerformanceIndicators: {
                    academicPerformance: analytics.academicPerformance.averageGrade,
                    attendanceRate: analytics.attendance.averageAttendanceRate,
                    feeCollectionRate: analytics.finances.collectionRate,
                    disciplineIncidents: analytics.discipline.totalIncidents
                }
            }
        };

        // For now, return JSON. In production, you might generate PDF or CSV
        res.json({
            success: true,
            data: report
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
} 