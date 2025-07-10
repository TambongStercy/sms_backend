// Enhanced Dashboard Service for Advanced Role-Specific Features
import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

/**
 * Enhanced Super Manager Dashboard with comprehensive analytics
 */
export async function getEnhancedSuperManagerDashboard(academicYearId?: number): Promise<any> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;

        const [
            schoolOverview,
            teacherAnalytics,
            reportAnalytics,
            formManagement,
            auditTrail,
            systemStatistics
        ] = await Promise.all([
            getSchoolOverview(yearId),
            getTeacherAnalytics(yearId),
            getReportAnalytics(yearId),
            getFormManagementStats(),
            getAuditTrail(),
            getSystemStatistics(yearId)
        ]);

        return {
            schoolOverview,
            teacherAnalytics,
            reportAnalytics,
            formManagement,
            auditTrail,
            systemStatistics,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching Enhanced Super Manager dashboard:', error);
        throw new Error('Failed to fetch enhanced dashboard data');
    }
}

/**
 * School Overview - Finance, Discipline, Teachers
 */
async function getSchoolOverview(yearId?: number) {
    const [financialData, disciplineData, teacherData] = await Promise.all([
        // Financial Overview
        prisma.schoolFees.aggregate({
            where: yearId ? { academic_year_id: yearId } : undefined,
            _sum: { amount_expected: true, amount_paid: true },
            _count: { id: true }
        }),

        // Discipline Overview
        prisma.disciplineIssue.groupBy({
            by: ['issue_type'],
            _count: { id: true },
            where: yearId ? {
                enrollment: { academic_year_id: yearId }
            } : undefined
        }),

        // Teacher Overview
        prisma.user.findMany({
            where: {
                user_roles: { some: { role: 'TEACHER' } }
            },
            include: {
                subject_teachers: { include: { subject: true } }
            }
        })
    ]);

    const collectionRate = financialData._sum.amount_expected ?
        (financialData._sum.amount_paid! / financialData._sum.amount_expected) * 100 : 0;

    return {
        finance: {
            totalExpected: financialData._sum.amount_expected || 0,
            totalCollected: financialData._sum.amount_paid || 0,
            collectionRate,
            totalAccounts: financialData._count.id
        },
        discipline: {
            totalIssues: disciplineData.reduce((sum, item) => sum + item._count.id, 0),
            issuesByType: disciplineData.map(item => ({
                type: item.issue_type,
                count: item._count.id
            }))
        },
        teachers: {
            totalTeachers: teacherData.length,
            averageSubjectsPerTeacher: teacherData.length > 0 ?
                teacherData.reduce((sum, t) => sum + t.subject_teachers.length, 0) / teacherData.length : 0
        }
    };
}

/**
 * Teacher Analytics - Profile, Hours, Attendance
 */
async function getTeacherAnalytics(yearId?: number) {
    const teachers = await prisma.user.findMany({
        where: {
            user_roles: { some: { role: 'TEACHER' } }
        },
        include: {
            subject_teachers: { include: { subject: true } },
            teacher_periods: true
        }
    });

    const teacherProfiles = teachers.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        matricule: teacher.matricule,
        email: teacher.email,
        totalHoursPerWeek: teacher.total_hours_per_week || 0,
        subjects: teacher.subject_teachers.map(st => ({
            id: st.subject.id,
            name: st.subject.name,
            category: st.subject.category
        })),
        periodsThisWeek: teacher.teacher_periods.length,
        attendanceRate: 85, // Placeholder - would calculate from actual data
        lastLogin: teacher.updated_at
    }));

    return {
        profiles: teacherProfiles,
        summary: {
            totalTeachers: teachers.length,
            averageHoursPerWeek: teachers.length > 0 ?
                teachers.reduce((sum, t) => sum + (t.total_hours_per_week || 0), 0) / teachers.length : 0,
            averageAttendanceRate: 85, // Placeholder
            teachersWithFullSchedule: teachers.filter(t => (t.total_hours_per_week || 0) >= 40).length
        }
    };
}

/**
 * Report Analytics - Deadlines, Submissions, Notifications
 */
async function getReportAnalytics(yearId?: number) {
    const [reports, sequences] = await Promise.all([
        prisma.generatedReport.findMany({
            where: yearId ? { academic_year_id: yearId } : undefined,
            include: {
                exam_sequence: true,
                student: true,
                sub_class: true
            },
            orderBy: { created_at: 'desc' }
        }),

        prisma.examSequence.findMany({
            where: yearId ? { academic_year_id: yearId } : undefined,
            orderBy: { created_at: 'desc' }
        })
    ]);

    const reportsByStatus = reports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalReports: reports.length,
        reportsByStatus,
        pendingReports: reportsByStatus.PENDING || 0,
        overdueReports: reports.filter(r =>
            r.status === 'PENDING' &&
            new Date(r.created_at).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
        recentReports: reports.slice(0, 10).map(r => ({
            id: r.id,
            type: r.report_type,
            status: r.status,
            studentName: r.student?.name,
            subClassName: r.sub_class?.name,
            createdAt: r.created_at,
            sequenceName: `Sequence ${r.exam_sequence?.sequence_number}` || 'Unknown'
        })),
        upcomingDeadlines: sequences.filter(s => s.status === 'OPEN').map(s => ({
            id: s.id,
            name: `Sequence ${s.sequence_number}`,
            status: s.status,
            academicYearId: s.academic_year_id
        }))
    };
}

/**
 * Form Management Statistics
 */
async function getFormManagementStats() {
    const [forms, submissions] = await Promise.all([
        prisma.formTemplate.findMany({
            include: {
                form_submissions: true
            }
        }),

        prisma.formSubmission.groupBy({
            by: ['status'],
            _count: { id: true }
        })
    ]);

    return {
        totalForms: forms.length,
        activeForms: forms.filter(f => f.is_active).length,
        formsWithDeadlines: forms.filter(f => f.deadline).length,
        submissionsByStatus: submissions.map(s => ({
            status: s.status,
            count: s._count.id
        })),
        recentForms: forms.slice(0, 5).map(f => ({
            id: f.id,
            title: f.title,
            assignedRole: f.assigned_role,
            isActive: f.is_active,
            deadline: f.deadline,
            submissionCount: f.form_submissions.length
        }))
    };
}

/**
 * Audit Trail - System Modifications
 */
async function getAuditTrail() {
    const auditLogs = await prisma.auditLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 20,
        include: {
            user: true
        }
    });

    return {
        recentModifications: auditLogs.map(log => ({
            id: log.id,
            action: log.action,
            tableName: log.table_name,
            recordId: log.record_id,
            userId: log.user_id,
            userName: log.user.name,
            userMatricule: log.user.matricule,
            createdAt: log.created_at,
            oldValues: log.old_values,
            newValues: log.new_values
        })),
        modificationsByAction: auditLogs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    };
}

/**
 * System Statistics
 */
async function getSystemStatistics(yearId?: number) {
    const [userStats, classStats, enrollmentStats] = await Promise.all([
        prisma.userRole.groupBy({
            by: ['role'],
            _count: { user_id: true }
        }),

        prisma.class.findMany({
            include: {
                sub_classes: {
                    include: {
                        enrollments: yearId ? {
                            where: { academic_year_id: yearId }
                        } : true
                    }
                }
            }
        }),

        yearId ? prisma.enrollment.count({
            where: { academic_year_id: yearId }
        }) : prisma.enrollment.count()
    ]);

    const usersByRole = userStats.map(stat => ({
        role: stat.role,
        count: stat._count.user_id
    }));

    const classUtilization = classStats.map(cls => ({
        id: cls.id,
        name: cls.name,
        maxStudents: cls.max_students,
        currentStudents: cls.sub_classes.reduce(
            (sum, sc) => sum + sc.enrollments.length, 0
        ),
        utilizationRate: (cls.sub_classes.reduce(
            (sum, sc) => sum + sc.enrollments.length, 0
        ) / cls.max_students) * 100
    }));

    return {
        usersByRole,
        totalEnrollments: enrollmentStats,
        classUtilization,
        averageClassUtilization: classUtilization.length > 0 ?
            classUtilization.reduce((sum, c) => sum + c.utilizationRate, 0) / classUtilization.length : 0
    };
}

/**
 * Enhanced Bursar Dashboard with Student Registration & Payment Analytics
 */
export async function getEnhancedBursarDashboard(academicYearId?: number): Promise<any> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;

        const [
            financialOverview,
            studentRegistration,
            paymentAnalytics,
            parentManagement
        ] = await Promise.all([
            getBursarFinancialOverview(yearId),
            getStudentRegistrationStats(yearId),
            getPaymentAnalytics(yearId),
            getParentManagementStats()
        ]);

        return {
            financialOverview,
            studentRegistration,
            paymentAnalytics,
            parentManagement,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching Enhanced Bursar dashboard:', error);
        throw new Error('Failed to fetch enhanced Bursar dashboard data');
    }
}

async function getBursarFinancialOverview(yearId?: number) {
    const [feesData, paymentsData] = await Promise.all([
        prisma.schoolFees.aggregate({
            where: yearId ? { academic_year_id: yearId } : undefined,
            _sum: { amount_expected: true, amount_paid: true },
            _count: { id: true }
        }),

        prisma.paymentTransaction.findMany({
            where: yearId ? { academic_year_id: yearId } : undefined,
            orderBy: { payment_date: 'desc' },
            take: 10,
            include: {
                enrollment: {
                    include: { student: true }
                }
            }
        })
    ]);

    return {
        totalExpected: feesData._sum.amount_expected || 0,
        totalCollected: feesData._sum.amount_paid || 0,
        collectionRate: feesData._sum.amount_expected ?
            (feesData._sum.amount_paid! / feesData._sum.amount_expected) * 100 : 0,
        totalAccounts: feesData._count.id,
        recentPayments: paymentsData.map(p => ({
            id: p.id,
            amount: p.amount,
            paymentMethod: p.payment_method,
            paymentDate: p.payment_date,
            receiptNumber: p.receipt_number,
            studentName: p.enrollment.student.name,
            studentMatricule: p.enrollment.student.matricule
        }))
    };
}

async function getStudentRegistrationStats(yearId?: number) {
    const [newStudents, enrollments, awaitingAssignment] = await Promise.all([
        prisma.student.count({
            where: {
                created_at: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        }),

        yearId ? prisma.enrollment.count({
            where: { academic_year_id: yearId }
        }) : prisma.enrollment.count(),

        yearId ? prisma.enrollment.count({
            where: {
                academic_year_id: yearId,
                sub_class_id: null
            }
        }) : 0
    ]);

    return {
        newStudentsThisMonth: newStudents,
        totalEnrollments: enrollments,
        studentsAwaitingSubclassAssignment: awaitingAssignment,
        registrationCompletionRate: enrollments > 0 ?
            ((enrollments - awaitingAssignment) / enrollments) * 100 : 0
    };
}

async function getPaymentAnalytics(yearId?: number) {
    const paymentStats = await prisma.paymentTransaction.groupBy({
        by: ['payment_method'],
        _count: { id: true },
        _sum: { amount: true },
        where: yearId ? { academic_year_id: yearId } : undefined
    });

    const totalAmount = paymentStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    return {
        paymentMethodBreakdown: paymentStats.map(stat => ({
            method: stat.payment_method,
            transactionCount: stat._count.id,
            totalAmount: stat._sum.amount || 0,
            percentage: totalAmount > 0 ? ((stat._sum.amount || 0) / totalAmount) * 100 : 0
        })),
        totalTransactions: paymentStats.reduce((sum, stat) => sum + stat._count.id, 0),
        totalAmount
    };
}

async function getParentManagementStats() {
    const [parentStudentLinks, recentLinks] = await Promise.all([
        prisma.parentStudent.count(),

        prisma.parentStudent.findMany({
            where: {
                created_at: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            },
            include: {
                parent: true,
                student: true
            }
        })
    ]);

    return {
        totalParentLinks: parentStudentLinks,
        newLinksThisMonth: recentLinks.length,
        recentLinks: recentLinks.map(link => ({
            parentName: link.parent.name,
            parentPhone: link.parent.phone,
            studentName: link.student.name,
            studentMatricule: link.student.matricule,
            linkedAt: link.created_at
        }))
    };
}

/**
 * Enhanced VP Dashboard with Interview Management
 */
export async function getEnhancedVPDashboard(userId: number, academicYearId?: number): Promise<any> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;

        const [
            studentManagement,
            interviewStats,
            subclassManagement,
            teacherTracking
        ] = await Promise.all([
            getVPStudentManagement(yearId),
            getInterviewStatistics(userId, yearId),
            getSubclassManagementStats(userId, yearId),
            getTeacherTrackingStats()
        ]);

        return {
            studentManagement,
            interviewStats,
            subclassManagement,
            teacherTracking,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching Enhanced VP dashboard:', error);
        throw new Error('Failed to fetch enhanced VP dashboard data');
    }
}

async function getVPStudentManagement(yearId?: number) {
    const [unassignedStudents, totalEnrollments, classCapacity] = await Promise.all([
        yearId ? prisma.enrollment.findMany({
            where: {
                academic_year_id: yearId,
                sub_class_id: null
            },
            include: {
                student: true,
                class: true
            }
        }) : [],

        yearId ? prisma.enrollment.count({
            where: { academic_year_id: yearId }
        }) : 0,

        prisma.class.findMany({
            include: {
                sub_classes: {
                    include: {
                        enrollments: yearId ? {
                            where: { academic_year_id: yearId }
                        } : true
                    }
                }
            }
        })
    ]);

    return {
        unassignedStudents: unassignedStudents.map(enrollment => ({
            studentId: enrollment.student.id,
            studentName: enrollment.student.name,
            studentMatricule: enrollment.student.matricule,
            className: enrollment.class.name,
            enrollmentDate: enrollment.enrollment_date,
            hasInterview: false // Would check InterviewMark table
        })),
        totalUnassigned: unassignedStudents.length,
        totalEnrollments,
        assignmentRate: totalEnrollments > 0 ?
            ((totalEnrollments - unassignedStudents.length) / totalEnrollments) * 100 : 0,
        classCapacityStatus: classCapacity.map(cls => ({
            className: cls.name,
            maxCapacity: cls.max_students,
            currentEnrollment: cls.sub_classes.reduce((sum, sc) => sum + sc.enrollments.length, 0),
            availableSpaces: cls.max_students - cls.sub_classes.reduce((sum, sc) => sum + sc.enrollments.length, 0)
        }))
    };
}

async function getInterviewStatistics(vpId: number, yearId?: number) {
    const interviews = await prisma.interviewMark.findMany({
        where: { vp_id: vpId },
        include: { student: true }
    });

    return {
        totalInterviews: interviews.length,
        averageScore: interviews.length > 0 ?
            interviews.reduce((sum, i) => sum + i.marks, 0) / interviews.length : 0,
        recentInterviews: interviews.slice(-10).map(interview => ({
            studentName: interview.student.name,
            studentMatricule: interview.student.matricule,
            marks: interview.marks,
            notes: interview.notes,
            interviewDate: interview.created_at
        }))
    };
}

async function getSubclassManagementStats(userId: number, yearId?: number) {
    const assignments = await prisma.roleAssignment.findMany({
        where: {
            user_id: userId,
            role_type: 'VICE_PRINCIPAL',
            academic_year_id: yearId
        },
        include: {
            sub_class: {
                include: {
                    enrollments: yearId ? {
                        where: { academic_year_id: yearId }
                    } : true
                }
            }
        }
    });

    return {
        assignedSubclasses: assignments.length,
        totalStudentsSupervised: assignments.reduce(
            (sum, assignment) => sum + (assignment.sub_class?.enrollments.length || 0), 0
        )
    };
}

async function getTeacherTrackingStats() {
    const teachers = await prisma.user.findMany({
        where: {
            user_roles: { some: { role: 'TEACHER' } }
        }
    });

    return {
        totalTeachers: teachers.length,
        averageAttendanceRate: 85, // Placeholder
        teachersOnLeave: 2 // Placeholder
    };
} 