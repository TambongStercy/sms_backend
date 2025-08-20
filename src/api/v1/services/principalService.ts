import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

// Types for Principal operations
export interface SchoolAnalytics {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    activeExamSequences: number;
    averageAttendanceRate: number;
    overallAcademicPerformance: number;
    financialCollectionRate: number;
    disciplineIssuesThisMonth: number;
    newEnrollmentsThisMonth: number;
    teacherUtilizationRate: number;
    classCapacityUtilization: number;
}

export interface PerformanceMetrics {
    academicPerformance: {
        overallPassRate: number;
        averageGrade: number;
        subjectPerformance: Array<{
            subjectName: string;
            averageScore: number;
            passRate: number;
            totalStudents: number;
        }>;
        classPerformance: Array<{
            className: string;
            subClassName: string;
            averageScore: number;
            passRate: number;
            totalStudents: number;
            teacherName: string;
        }>;
    };
    attendanceMetrics: {
        overallAttendanceRate: number;
        classAttendanceRates: Array<{
            className: string;
            subClassName: string;
            attendanceRate: number;
            absenteeismTrend: string;
        }>;
        monthlyAttendanceTrends: Array<{
            month: string;
            attendanceRate: number;
            totalStudents: number;
        }>;
    };
    teacherPerformance: {
        totalTeachers: number;
        averageClassesPerTeacher: number;
        teacherEfficiency: Array<{
            teacherName: string;
            subjectsTeaching: number;
            averageStudentPerformance: number;
            classesManaged: number;
            attendanceRate: number;
        }>;
    };
}

export interface FinancialOverview {
    totalExpectedRevenue: number;
    totalCollectedRevenue: number;
    collectionRate: number;
    pendingPayments: number;
    monthlyCollectionTrends: Array<{
        month: string;
        collected: number;
        expected: number;
        collectionRate: number;
    }>;
    paymentMethodBreakdown: Array<{
        method: string;
        amount: number;
        percentage: number;
        transactionCount: number;
    }>;
    outstandingDebts: Array<{
        studentName: string;
        className: string;
        amountOwed: number;
        daysOverdue: number;
    }>;
}

export interface DisciplineOverview {
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    averageResolutionTime: number;
    issuesByType: Array<{
        issueType: string;
        count: number;
        trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    }>;
    studentsByIssueCount: Array<{
        studentName: string;
        className: string;
        issueCount: number;
        lastIssueDate: string;
    }>;
    monthlyTrends: Array<{
        month: string;
        totalIssues: number;
        resolvedIssues: number;
    }>;
}

export interface StaffOverview {
    totalStaff: number;
    teacherCount: number;
    administrativeStaff: number;
    staffUtilization: Array<{
        role: string;
        count: number;
        utilizationRate: number;
    }>;
    recentHires: Array<{
        name: string;
        role: string;
        hireDate: string;
        department: string;
    }>;
    staffPerformanceMetrics: Array<{
        staffName: string;
        role: string;
        performanceScore: number;
        responsibilities: number;
    }>;
}

export interface ApprovalRequest {
    id: number;
    type: 'EXPENSE' | 'ENROLLMENT' | 'STAFF_HIRING' | 'POLICY_CHANGE' | 'DISCIPLINARY_ACTION';
    requestedBy: string;
    requestedByRole: string;
    title: string;
    description: string;
    amount?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    requestDate: string;
    dueDate?: string;
    details: any;
}

/**
 * Get comprehensive school analytics for Principal dashboard
 */
export async function getSchoolAnalytics(academicYearId?: number): Promise<SchoolAnalytics> {
    try {
        const currentYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentYear) {
            throw new Error('No academic year found');
        }

        const [
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            activeSequences,
            enrollmentsThisMonth,
            disciplineIssuesThisMonth,
            attendanceRecords,
            totalMarks,
            markSum,
            totalFees,
            totalPayments
        ] = await Promise.all([
            // Total students enrolled in current academic year
            prisma.enrollment.count({
                where: { academic_year_id: currentYear.id }
            }),

            // Total teachers with roles in current academic year
            prisma.user.count({
                where: {
                    user_roles: {
                        some: {
                            role: 'TEACHER',
                            OR: [
                                { academic_year_id: currentYear.id },
                                { academic_year_id: null }
                            ]
                        }
                    }
                }
            }),

            // Total classes
            prisma.class.count(),

            // Total subjects
            prisma.subject.count(),

            // Active exam sequences
            prisma.examSequence.count({
                where: {
                    academic_year_id: currentYear.id,
                    status: 'OPEN'
                }
            }),

            // New enrollments this month
            prisma.enrollment.count({
                where: {
                    academic_year_id: currentYear.id,
                    created_at: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Discipline issues this month
            prisma.disciplineIssue.count({
                where: {
                    enrollment: {
                        academic_year_id: currentYear.id
                    },
                    created_at: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Attendance records for rate calculation
            prisma.studentAbsence.count({
                where: {
                    enrollment: {
                        academic_year_id: currentYear.id
                    },
                    created_at: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Total marks for performance calculation
            prisma.mark.count({
                where: {
                    enrollment: { academic_year_id: currentYear.id }
                }
            }),

            // Sum of all marks for average calculation
            prisma.mark.aggregate({
                where: {
                    enrollment: { academic_year_id: currentYear.id }
                },
                _sum: { score: true }
            }),

            // Financial data
            prisma.schoolFees.aggregate({
                where: { academic_year_id: currentYear.id },
                _sum: { amount_expected: true }
            }),

            prisma.paymentTransaction.aggregate({
                where: {
                    academic_year_id: currentYear.id
                },
                _sum: { amount: true }
            })
        ]);

        // Calculate derived metrics with null safety
        const overallAcademicPerformance = totalMarks > 0 ?
            ((markSum?._sum?.score || 0) / totalMarks) : 0;

        const averageAttendanceRate = totalStudents > 0 ?
            Math.max(0, 100 - ((attendanceRecords / totalStudents) * 10)) : 100;

        const financialCollectionRate = (totalFees?._sum?.amount_expected || 0) > 0 ?
            ((totalPayments?._sum?.amount || 0) / (totalFees?._sum?.amount_expected || 1)) * 100 : 0;

        const teacherUtilizationRate = totalTeachers > 0 ?
            Math.min(100, (totalClasses / totalTeachers) * 20) : 0;

        const classCapacityUtilization = totalClasses > 0 ?
            (totalStudents / (totalClasses * 30)) * 100 : 0; // Assuming 30 students per class capacity

        return {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            activeExamSequences: activeSequences,
            averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
            overallAcademicPerformance: Math.round(overallAcademicPerformance * 100) / 100,
            financialCollectionRate: Math.round(financialCollectionRate * 100) / 100,
            disciplineIssuesThisMonth,
            newEnrollmentsThisMonth: enrollmentsThisMonth,
            teacherUtilizationRate: Math.round(teacherUtilizationRate * 100) / 100,
            classCapacityUtilization: Math.round(Math.min(100, classCapacityUtilization) * 100) / 100
        };
    } catch (error) {
        throw new Error(`Failed to fetch school analytics: ${error}`);
    }
}

/**
 * Get comprehensive performance metrics
 */
export async function getPerformanceMetrics(academicYearId?: number): Promise<PerformanceMetrics> {
    try {
        const currentYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentYear) {
            throw new Error('No academic year found');
        }

        // Get subject performance
        const subjectPerformance = await prisma.subject.findMany({
            include: {
                sub_class_subjects: {
                    include: {
                        marks: {
                            where: {
                                enrollment: { academic_year_id: currentYear.id }
                            }
                        },
                        sub_class: {
                            include: {
                                enrollments: {
                                    where: { academic_year_id: currentYear.id }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Process subject performance data
        const processedSubjectPerformance = subjectPerformance.map(subject => {
            const allMarks = subject.sub_class_subjects.flatMap(scs => scs.marks);
            const totalStudents = subject.sub_class_subjects.reduce(
                (sum, scs) => sum + scs.sub_class.enrollments.length, 0
            );

            const averageScore = allMarks.length > 0 ?
                allMarks.reduce((sum, mark) => sum + mark.score ?? 0, 0) / allMarks.length : 0;

            const passRate = allMarks.length > 0 ?
                (allMarks.filter(mark => mark.score ?? 0 >= 10).length / allMarks.length) * 100 : 0;

            return {
                subjectName: subject.name,
                averageScore: Math.round(averageScore * 100) / 100,
                passRate: Math.round(passRate * 100) / 100,
                totalStudents
            };
        });

        // Get class performance
        const classPerformance = await prisma.subClass.findMany({
            where: {
                enrollments: {
                    some: { academic_year_id: currentYear.id }
                }
            },
            include: {
                class: true,
                enrollments: {
                    where: { academic_year_id: currentYear.id },
                    include: {
                        marks: true
                    }
                },
                teacher_periods: {
                    include: {
                        teacher: true
                    },
                    take: 1
                }
            }
        });

        const processedClassPerformance = classPerformance.map(subClass => {
            const allMarks = subClass.enrollments.flatMap(enrollment => enrollment.marks);
            const averageScore = allMarks.length > 0 ?
                allMarks.reduce((sum, mark) => sum + mark.score ?? 0, 0) / allMarks.length : 0;

            const passRate = allMarks.length > 0 ?
                (allMarks.filter(mark => mark.score ?? 0 >= 10).length / allMarks.length) * 100 : 0;

            const teacherName = subClass.teacher_periods[0]?.teacher?.name || 'No Teacher Assigned';

            return {
                className: subClass.class.name,
                subClassName: subClass.name,
                averageScore: Math.round(averageScore * 100) / 100,
                passRate: Math.round(passRate * 100) / 100,
                totalStudents: subClass.enrollments.length,
                teacherName
            };
        });

        // Get attendance metrics (simplified)
        const totalEnrollments = await prisma.enrollment.count({
            where: { academic_year_id: currentYear.id }
        });

        const totalAbsences = await prisma.studentAbsence.count({
            where: {
                enrollment: {
                    academic_year_id: currentYear.id
                }
            }
        });

        const overallAttendanceRate = totalEnrollments > 0 ?
            Math.max(0, 100 - ((totalAbsences / totalEnrollments) * 5)) : 100;

        // Get teacher performance metrics
        const teachers = await prisma.user.findMany({
            where: {
                user_roles: {
                    some: {
                        role: 'TEACHER',
                        OR: [
                            { academic_year_id: currentYear.id },
                            { academic_year_id: null }
                        ]
                    }
                }
            },
            include: {
                teacher_periods: {
                    include: {
                        sub_class: {
                            include: {
                                enrollments: {
                                    where: { academic_year_id: currentYear.id },
                                    include: { marks: true }
                                }
                            }
                        },
                        subject: true
                    }
                }
            }
        });

        const teacherPerformanceMetrics = teachers.map(teacher => {
            const uniqueSubjects = new Set(teacher.teacher_periods.map(tp => tp.subject.id));
            const allMarks = teacher.teacher_periods.flatMap(tp =>
                tp.sub_class.enrollments.flatMap(enrollment => enrollment.marks)
            );

            const averageStudentPerformance = allMarks.length > 0 ?
                allMarks.reduce((sum, mark) => sum + mark.score ?? 0, 0) / allMarks.length : 0;

            return {
                teacherName: teacher.name,
                subjectsTeaching: uniqueSubjects.size,
                averageStudentPerformance: Math.round(averageStudentPerformance * 100) / 100,
                classesManaged: teacher.teacher_periods.length,
                attendanceRate: 95 // Placeholder - would need teacher attendance tracking
            };
        });

        return {
            academicPerformance: {
                overallPassRate: processedSubjectPerformance.length > 0 ?
                    processedSubjectPerformance.reduce((sum, sp) => sum + sp.passRate, 0) / processedSubjectPerformance.length : 0,
                averageGrade: processedSubjectPerformance.length > 0 ?
                    processedSubjectPerformance.reduce((sum, sp) => sum + sp.averageScore, 0) / processedSubjectPerformance.length : 0,
                subjectPerformance: processedSubjectPerformance,
                classPerformance: processedClassPerformance
            },
            attendanceMetrics: {
                overallAttendanceRate: Math.round(overallAttendanceRate * 100) / 100,
                classAttendanceRates: [], // Simplified for now
                monthlyAttendanceTrends: [] // Simplified for now
            },
            teacherPerformance: {
                totalTeachers: teachers.length,
                averageClassesPerTeacher: teachers.length > 0 ?
                    teachers.reduce((sum, t) => sum + t.teacher_periods.length, 0) / teachers.length : 0,
                teacherEfficiency: teacherPerformanceMetrics
            }
        };
    } catch (error) {
        throw new Error(`Failed to fetch performance metrics: ${error}`);
    }
}

/**
 * Get financial overview for principal
 */
export async function getFinancialOverview(academicYearId?: number): Promise<FinancialOverview> {
    try {
        const currentYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentYear) {
            throw new Error('No academic year found');
        }

        const [
            totalExpected,
            totalCollected,
            pendingPaymentsCount,
            paymentMethods,
            outstandingFees
        ] = await Promise.all([
            // Total expected revenue
            prisma.schoolFees.aggregate({
                where: { academic_year_id: currentYear.id },
                _sum: { amount_expected: true }
            }),

            // Total collected revenue
            prisma.paymentTransaction.aggregate({
                where: {
                    academic_year_id: currentYear.id
                },
                _sum: { amount: true }
            }),

            // Pending payments count
            prisma.schoolFees.count({
                where: {
                    academic_year_id: currentYear.id,
                    payment_transactions: {
                        none: {}
                    }
                }
            }),

            // Payment methods breakdown
            prisma.paymentTransaction.groupBy({
                by: ['payment_method'],
                where: {
                    academic_year_id: currentYear.id
                },
                _sum: { amount: true },
                _count: { id: true }
            }),

            // Outstanding debts
            prisma.schoolFees.findMany({
                where: {
                    academic_year_id: currentYear.id,
                    payment_transactions: {
                        none: {}
                    }
                },
                include: {
                    enrollment: {
                        include: {
                            student: true,
                            sub_class: {
                                include: { class: true }
                            }
                        }
                    }
                },
                take: 10,
                orderBy: { created_at: 'asc' }
            })
        ]);

        const totalExpectedRevenue = totalExpected._sum.amount_expected || 0;
        const totalCollectedRevenue = totalCollected._sum.amount || 0;
        const collectionRate = totalExpectedRevenue > 0 ?
            (totalCollectedRevenue / totalExpectedRevenue) * 100 : 0;

        // Process payment methods
        const totalPaymentAmount = paymentMethods.reduce((sum, pm) => sum + (pm._sum.amount || 0), 0);
        const paymentMethodBreakdown = paymentMethods.map(pm => ({
            method: pm.payment_method,
            amount: pm._sum.amount || 0,
            percentage: totalPaymentAmount > 0 ? ((pm._sum.amount || 0) / totalPaymentAmount) * 100 : 0,
            transactionCount: pm._count.id
        }));

        // Process outstanding debts
        const processedOutstandingDebts = outstandingFees.map(fee => {
            const daysSinceCreated = Math.floor(
                (new Date().getTime() - new Date(fee.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                studentName: fee.enrollment.student.name,
                className: `${fee.enrollment.sub_class?.class.name} - ${fee.enrollment.sub_class?.name}`,
                amountOwed: fee.amount_expected,
                daysOverdue: daysSinceCreated
            };
        });

        return {
            totalExpectedRevenue,
            totalCollectedRevenue,
            collectionRate: Math.round(collectionRate * 100) / 100,
            pendingPayments: pendingPaymentsCount,
            monthlyCollectionTrends: [], // Simplified for now
            paymentMethodBreakdown,
            outstandingDebts: processedOutstandingDebts
        };
    } catch (error) {
        throw new Error(`Failed to fetch financial overview: ${error}`);
    }
}

/**
 * Get discipline overview for principal
 */
export async function getDisciplineOverview(academicYearId?: number): Promise<DisciplineOverview> {
    try {
        const currentYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentYear) {
            throw new Error('No academic year found');
        }

        // Get discipline statistics
        const [
            totalIssues,
            resolvedIssues,
            issuesByType
        ] = await Promise.all([
            prisma.disciplineIssue.count({
                where: {
                    enrollment: {
                        academic_year_id: currentYear.id
                    }
                }
            }),

            // Count resolved issues (where reviewed_by_id is not null)
            prisma.disciplineIssue.count({
                where: {
                    enrollment: {
                        academic_year_id: currentYear.id
                    },
                    NOT: {
                        reviewed_by_id: null
                    }
                }
            }),

            // Get issues by type - simplified approach to avoid circular reference
            prisma.disciplineIssue.groupBy({
                by: ['issue_type'],
                where: {
                    enrollment: {
                        academic_year_id: currentYear.id
                    }
                },
                _count: {
                    id: true
                }
            })
        ]);

        const pendingIssues = totalIssues - resolvedIssues;
        const averageResolutionTime = 3.5; // Placeholder - would need actual resolution time tracking

        // Process issues by type
        const processedIssuesByType = issuesByType.map(issue => ({
            issueType: issue.issue_type,
            count: issue._count.id,
            trend: 'STABLE' as 'INCREASING' | 'DECREASING' | 'STABLE' // Simplified
        }));

        return {
            totalIssues,
            resolvedIssues,
            pendingIssues,
            averageResolutionTime,
            issuesByType: processedIssuesByType,
            studentsByIssueCount: [], // Simplified for now
            monthlyTrends: [] // Simplified for now
        };
    } catch (error) {
        throw new Error(`Failed to fetch discipline overview: ${error}`);
    }
}

/**
 * Get staff overview for principal
 */
export async function getStaffOverview(academicYearId?: number): Promise<StaffOverview> {
    try {
        const currentYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentYear) {
            throw new Error('No academic year found');
        }

        const [
            allStaff,
            roleDistribution
        ] = await Promise.all([
            // All staff members
            prisma.user.findMany({
                where: {
                    user_roles: {
                        some: {
                            OR: [
                                { academic_year_id: currentYear.id },
                                { academic_year_id: null }
                            ]
                        }
                    }
                },
                include: {
                    user_roles: {
                        where: {
                            OR: [
                                { academic_year_id: currentYear.id },
                                { academic_year_id: null }
                            ]
                        }
                    }
                }
            }),

            // Role distribution
            prisma.userRole.groupBy({
                by: ['role'],
                where: {
                    OR: [
                        { academic_year_id: currentYear.id },
                        { academic_year_id: null }
                    ]
                },
                _count: { id: true }
            })
        ]);

        const teacherCount = roleDistribution.find(r => r.role === 'TEACHER')?._count.id || 0;
        const administrativeStaff = allStaff.length - teacherCount;

        const staffUtilization = roleDistribution.map(role => ({
            role: role.role,
            count: role._count.id,
            utilizationRate: 85 // Placeholder - would need actual utilization tracking
        }));

        return {
            totalStaff: allStaff.length,
            teacherCount,
            administrativeStaff,
            staffUtilization,
            recentHires: [], // Simplified for now
            staffPerformanceMetrics: [] // Simplified for now
        };
    } catch (error) {
        throw new Error(`Failed to fetch staff overview: ${error}`);
    }
}

/**
 * Get principal dashboard data
 */
export async function getPrincipalDashboard(academicYearId?: number): Promise<any> {
    try {
        // Use Promise.allSettled to handle individual failures gracefully
        const results = await Promise.allSettled([
            getSchoolAnalytics(academicYearId),
            getPerformanceMetrics(academicYearId),
            getFinancialOverview(academicYearId),
            getDisciplineOverview(academicYearId),
            getStaffOverview(academicYearId)
        ]);

        // Extract results, using null for failed components
        const [analyticsResult, performanceResult, financialResult, disciplineResult, staffResult] = results;

        return {
            schoolAnalytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value : null,
            performanceMetrics: performanceResult.status === 'fulfilled' ? performanceResult.value : null,
            financialOverview: financialResult.status === 'fulfilled' ? financialResult.value : null,
            disciplineOverview: disciplineResult.status === 'fulfilled' ? disciplineResult.value : null,
            staffOverview: staffResult.status === 'fulfilled' ? staffResult.value : null,
            quickActions: [
                'Review Performance Reports',
                'Approve Budget Requests',
                'Monitor Staff Performance',
                'Address Discipline Issues',
                'Review Financial Status'
            ],
            errors: results
                .map((result, index) => result.status === 'rejected' ?
                    { component: ['analytics', 'performance', 'financial', 'discipline', 'staff'][index], error: result.reason?.message } : null)
                .filter(err => err !== null)
        };
    } catch (error) {
        throw new Error(`Failed to fetch principal dashboard: ${error}`);
    }
} 