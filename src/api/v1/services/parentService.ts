// src/api/v1/services/parentService.ts
import {
    Prisma,
    Student,
    User,
    AcademicYear,
    Enrollment,
    QuizStatus
} from '@prisma/client';
import prisma from '../../../config/db';
import { getCurrentAcademicYear, getAcademicYearId } from '../../../utils/academicYear';
import * as notificationService from './notificationService';

export interface ParentDashboardData {
    totalChildren: number;
    childrenEnrolled: number;
    pendingFees: number;
    totalFeesOwed: number;
    latestGrades: number;
    disciplineIssues: number;
    unreadMessages: number;
    upcomingEvents: number;
    children: ChildOverview[];
}

export interface ChildOverview {
    id: number;
    name: string;
    class_name?: string;
    subclass_name?: string;
    enrollment_status: string;
    photo?: string;
    attendance_rate: number;
    latest_marks: MarkSummary[];
    pending_fees: number;
    discipline_issues: number;
    recent_absences: number;
}

export interface MarkSummary {
    subject_name: string;
    latest_mark: number;
    sequence: string;
    date: Date;
}

export interface ChildDetails {
    id: number;
    name: string;
    matricule: string;
    date_of_birth: Date;
    class_info?: {
        class_name: string;
        subclass_name: string;
        class_master?: string;
    };
    attendance: {
        present_days: number;
        absent_days: number;
        late_days: number;
        attendance_rate: number;
    };
    academic_performance: {
        subjects: SubjectPerformance[];
        overall_average: number;
        position_in_class?: number;
    };
    fees: {
        total_expected: number;
        total_paid: number;
        outstanding_balance: number;
        last_payment_date?: Date;
        payment_history: PaymentRecord[];
    };
    discipline: {
        total_issues: number;
        recent_issues: DisciplineRecord[];
    };
    reports: {
        available_reports: ReportCard[];
    };
}

export interface SubjectPerformance {
    subject_name: string;
    teacher_name: string;
    marks: {
        sequence: string;
        mark: number;
        total: number;
        date: Date;
    }[];
    average: number;
}

export interface PaymentRecord {
    id: number;
    amount: number;
    payment_date: Date;
    payment_method: string;
    receipt_number?: string;
    recorded_by: string;
}

export interface DisciplineRecord {
    id: number;
    type: string;
    description: string;
    date_occurred: Date;
    status: string;
    resolved_at?: Date;
}

export interface ReportCard {
    id: number;
    sequence_name: string;
    academic_year: string;
    generated_at: Date;
    download_url: string;
}

/**
 * Get comprehensive parent dashboard data
 */
export async function getParentDashboard(parentId: number, academicYearId?: number): Promise<ParentDashboardData> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;

        // Get all children linked to this parent
        const parentStudentLinks = await prisma.parentStudent.findMany({
            where: { parent_id: parentId },
            include: {
                student: {
                    include: {
                        enrollments: {
                            where: yearId ? { academic_year_id: yearId } : {},
                            include: {
                                sub_class: {
                                    include: { class: true }
                                },
                                marks: {
                                    include: {
                                        sub_class_subject: {
                                            include: {
                                                subject: true
                                            }
                                        }
                                    },
                                    orderBy: { created_at: 'desc' },
                                    take: 5
                                },
                                discipline_issues: true,
                                school_fees: true,
                                absences: {
                                    where: {
                                        created_at: {
                                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const children: ChildOverview[] = [];
        let totalFeesOwed = 0;
        let totalDisciplineIssues = 0;
        let totalLatestGrades = 0;

        for (const link of parentStudentLinks) {
            const student = link.student;
            const currentEnrollment = student.enrollments[0]; // Current year enrollment

            // Calculate attendance rate (placeholder - implement actual logic)
            const attendanceRate = 85; // percentage

            // Get latest marks
            const latestMarks: MarkSummary[] = currentEnrollment?.marks?.slice(0, 3).map(mark => ({
                subject_name: mark.sub_class_subject.subject.name,
                latest_mark: mark.score || 0,
                sequence: 'Recent', // TODO: Get sequence from exam_sequence
                date: mark.created_at
            })) || [];

            // Calculate pending fees
            const pendingFees = currentEnrollment?.school_fees?.reduce((total, fee) =>
                total + (fee.amount_expected - fee.amount_paid), 0
            ) || 0;

            // Count discipline issues
            const disciplineIssues = currentEnrollment?.discipline_issues?.length || 0;

            // Count recent absences
            const recentAbsences = currentEnrollment?.absences?.length || 0;

            const childOverview: ChildOverview = {
                id: student.id,
                name: student.name,
                class_name: currentEnrollment?.sub_class?.class?.name,
                subclass_name: currentEnrollment?.sub_class?.name,
                enrollment_status: student.status,
                photo: currentEnrollment?.photo || undefined,
                attendance_rate: attendanceRate,
                latest_marks: latestMarks,
                pending_fees: pendingFees,
                discipline_issues: disciplineIssues,
                recent_absences: recentAbsences
            };

            children.push(childOverview);
            totalFeesOwed += pendingFees;
            totalDisciplineIssues += disciplineIssues;
            totalLatestGrades += latestMarks.length;
        }

        // Get unread messages for parent
        const unreadMessages = await notificationService.getUnreadNotificationCount(parentId);

        // Get upcoming events (placeholder)
        const upcomingEvents = 3;

        return {
            totalChildren: children.length,
            childrenEnrolled: children.filter(child => child.enrollment_status === 'ASSIGNED_TO_CLASS').length,
            pendingFees: children.filter(child => child.pending_fees > 0).length,
            totalFeesOwed,
            latestGrades: totalLatestGrades,
            disciplineIssues: totalDisciplineIssues,
            unreadMessages,
            upcomingEvents,
            children
        };
    } catch (error) {
        console.error('Error fetching parent dashboard:', error);
        throw new Error('Failed to fetch parent dashboard data');
    }
}

/**
 * Get detailed information about a specific child
 */
export async function getChildDetails(parentId: number, studentId: number, academicYearId?: number): Promise<ChildDetails> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;

        // Verify parent-student relationship
        console.log(`DEBUG: Looking for parent-student relationship: parentId=${parentId}, studentId=${studentId}`);

        const parentStudentLink = await prisma.parentStudent.findFirst({
            where: {
                parent_id: parentId,
                student_id: studentId
            }
        });

        if (!parentStudentLink) {
            // Debug: Log all relationships for this parent
            const allParentRelationships = await prisma.parentStudent.findMany({
                where: { parent_id: parentId },
                include: { student: { select: { id: true, name: true, matricule: true } } }
            });
            console.log(`DEBUG: All relationships for parent ${parentId}:`, allParentRelationships);

            throw new Error('Parent-student relationship not found');
        }

        // Get basic student data first
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // Get enrollments separately to avoid complex conditional includes
        const enrollments = await prisma.enrollment.findMany({
            where: {
                student_id: studentId,
                ...(yearId ? { academic_year_id: yearId } : {})
            },
            include: {
                sub_class: {
                    include: {
                        class: true,
                        class_master: { select: { name: true } }
                    }
                },
                marks: {
                    include: {
                        sub_class_subject: {
                            include: {
                                subject: true
                            }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                },
                school_fees: {
                    include: {
                        payment_transactions: {
                            include: {
                                recorded_by: { select: { name: true } }
                            },
                            orderBy: { created_at: 'desc' }
                        }
                    }
                },
                discipline_issues: {
                    orderBy: { created_at: 'desc' }
                },
                absences: {
                    orderBy: { created_at: 'desc' },
                    take: 30
                }
            }
        });

        // Get reports separately (handle potential missing table gracefully)
        let reports = [];
        try {
            reports = await prisma.generatedReport.findMany({
                where: {
                    student_id: studentId,
                    ...(yearId ? { academic_year_id: yearId } : {})
                },
                include: {
                    exam_sequence: {
                        select: {
                            sequence_number: true,
                            term: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    academic_year: {
                        select: { name: true }
                    }
                },
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            console.log('Note: GeneratedReport query failed, continuing without reports:', error);
            reports = [];
        }

        const currentEnrollment = enrollments[0];

        // Calculate attendance data
        const totalSchoolDays = 180; // Academic year days
        const absentDays = currentEnrollment?.absences?.length || 0;
        const presentDays = totalSchoolDays - absentDays;
        const lateDays = 5; // Placeholder
        const attendanceRate = (presentDays / totalSchoolDays) * 100;

        // Process academic performance
        const subjectPerformanceMap = new Map<number, SubjectPerformance>();

        currentEnrollment?.marks?.forEach(mark => {
            try {
                // Safe access to nested relations
                const subjectId = mark.sub_class_subject?.subject?.id;
                const subjectName = mark.sub_class_subject?.subject?.name;

                if (!subjectId || !subjectName) {
                    console.log('Warning: Missing subject data for mark:', mark.id);
                    return;
                }

                if (!subjectPerformanceMap.has(subjectId)) {
                    subjectPerformanceMap.set(subjectId, {
                        subject_name: subjectName,
                        teacher_name: 'Teacher Name', // TODO: Get from teacher assignment
                        marks: [],
                        average: 0
                    });
                }

                const performance = subjectPerformanceMap.get(subjectId)!;
                performance.marks.push({
                    sequence: 'Sequence', // TODO: Get from exam_sequence
                    mark: mark.score || 0,
                    total: 20, // TODO: Get from exam configuration
                    date: mark.created_at
                });
            } catch (error) {
                console.log('Warning: Error processing mark:', mark.id, error);
            }
        });

        // Calculate averages
        const subjects = Array.from(subjectPerformanceMap.values()).map(subject => {
            const totalMarks = subject.marks.reduce((sum, mark) => sum + mark.mark, 0);
            subject.average = subject.marks.length > 0 ? totalMarks / subject.marks.length : 0;
            return subject;
        });

        const overallAverage = subjects.length > 0
            ? subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length
            : 0;

        // Process fees data (with error handling)
        let fees, totalExpected = 0, totalPaid = 0, outstandingBalance = 0;
        let paymentHistory: PaymentRecord[] = [];
        let lastPaymentDate: Date | undefined;

        try {
            fees = currentEnrollment?.school_fees?.[0];
            totalExpected = fees?.amount_expected || 0;
            totalPaid = fees?.amount_paid || 0;
            outstandingBalance = totalExpected - totalPaid;

            paymentHistory = fees?.payment_transactions?.map(transaction => ({
                id: transaction.id,
                amount: transaction.amount,
                payment_date: transaction.payment_date,
                payment_method: transaction.payment_method,
                receipt_number: transaction.receipt_number || undefined,
                recorded_by: transaction.recorded_by?.name || 'Unknown'
            })) || [];

            lastPaymentDate = paymentHistory.length > 0 ? paymentHistory[0].payment_date : undefined;
        } catch (error) {
            console.log('Warning: Error processing fees data:', error);
        }

        // Process discipline data - Fix the property names to match schema
        const disciplineRecords: DisciplineRecord[] = currentEnrollment?.discipline_issues?.map(issue => ({
            id: issue.id,
            type: issue.issue_type, // Fixed: use issue_type instead of type
            description: issue.description,
            date_occurred: issue.created_at, // Fixed: use created_at as date_occurred since schema doesn't have date_occurred
            status: 'PENDING', // Fixed: hardcode status since schema doesn't have this field
            resolved_at: undefined // Fixed: schema doesn't have resolved_at field
        })) || [];

        // Process report cards
        const reportCards: ReportCard[] = reports?.map(report => ({
            id: report.id,
            sequence_name: `${report.exam_sequence?.term?.name || 'Term'} - Sequence ${report.exam_sequence?.sequence_number || 'N/A'}`,
            academic_year: report.academic_year?.name || 'Unknown Year',
            generated_at: report.created_at,
            download_url: `/api/v1/report-cards/${report.id}/download`
        })) || [];

        return {
            id: student.id,
            name: student.name,
            matricule: student.matricule,
            date_of_birth: student.date_of_birth,
            class_info: currentEnrollment?.sub_class ? {
                class_name: currentEnrollment.sub_class.class.name,
                subclass_name: currentEnrollment.sub_class.name,
                class_master: currentEnrollment.sub_class.class_master?.name
            } : undefined,
            attendance: {
                present_days: presentDays,
                absent_days: absentDays,
                late_days: lateDays,
                attendance_rate: attendanceRate
            },
            academic_performance: {
                subjects,
                overall_average: overallAverage,
                position_in_class: undefined // TODO: Calculate position
            },
            fees: {
                total_expected: totalExpected,
                total_paid: totalPaid,
                outstanding_balance: outstandingBalance,
                last_payment_date: lastPaymentDate,
                payment_history: paymentHistory
            },
            discipline: {
                total_issues: disciplineRecords.length,
                recent_issues: disciplineRecords.slice(0, 5)
            },
            reports: {
                available_reports: reportCards
            }
        };
    } catch (error) {
        console.error('Error fetching child details:', error);
        throw new Error('Failed to fetch child details');
    }
}

/**
 * Send a message from a parent to a school staff member.
 */
export async function sendMessageToStaff(
    parentId: number,
    data: {
        recipient_id: number;
        subject: string;
        message: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        student_id?: number;
    }
): Promise<any> {
    try {
        // If student_id is provided, verify parent-student relationship
        if (data.student_id) {
            const parentStudentLink = await prisma.parentStudent.findFirst({
                where: {
                    parent_id: parentId,
                    student_id: data.student_id
                }
            });

            if (!parentStudentLink) {
                throw new Error('Parent-student relationship not found');
            }
        }

        // Create a message record
        const message = await prisma.message.create({
            data: {
                sender_id: parentId,
                receiver_id: data.recipient_id,
                subject: data.subject,
                content: data.message,
                // The student_id can be stored in a metadata field if you add one to the Message model
                // or handled differently depending on requirements.
            }
        });

        return message;
    } catch (error) {
        console.error('Error sending message to staff:', error);
        throw new Error('Failed to send message to staff');
    }
}

/**
 * Get all quiz results for a specific child
 */
export async function getChildQuizResults(parentId: number, studentId: number, academicYearId?: number): Promise<any[]> {
    try {
        // Verify parent-student relationship first
        const parentStudentLink = await prisma.parentStudent.findFirst({
            where: {
                parent_id: parentId,
                student_id: studentId
            }
        });

        if (!parentStudentLink) {
            throw new Error('Parent-student relationship not found');
        }

        // Check if student exists
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { enrollments: true }
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // If no specific academic year provided, try to use current year first, then any year
        let yearId = academicYearId;
        if (!yearId) {
            const currentYear = await getCurrentAcademicYear();
            yearId = currentYear?.id;
        }

        // Build query conditions
        const whereConditions: any = {
            student_id: studentId
        };

        // Only add academic year filter if we have a valid year ID
        if (yearId) {
            whereConditions.academic_year_id = yearId;
        }

        const submissions = await prisma.quizSubmission.findMany({
            where: whereConditions,
            include: {
                quiz: {
                    include: {
                        subject: true
                    }
                }
            },
            orderBy: {
                submitted_at: 'desc'
            }
        });

        return submissions.map(s => ({
            submissionId: s.id,
            quizTitle: s.quiz.title,
            subject: s.quiz.subject.name,
            score: s.score,
            totalMarks: s.total_marks,
            percentage: s.percentage,
            status: s.status,
            submittedAt: s.submitted_at
        }));
    } catch (error: any) {
        console.error('Error fetching child quiz results:', error);
        throw new Error(`Failed to fetch quiz results: ${error.message}`);
    }
}

/**
 * Get quiz results for parent's children
 */
export async function getChildrenQuizResults(parentId: number, academicYearId?: number): Promise<any[]> {
    try {
        const yearId = academicYearId || (await getCurrentAcademicYear())?.id;

        // Get all children linked to this parent
        const parentStudentLinks = await prisma.parentStudent.findMany({
            where: { parent_id: parentId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        matricule: true
                    }
                }
            }
        });

        if (parentStudentLinks.length === 0) {
            return [];
        }

        const studentIds = parentStudentLinks.map(link => link.student.id);

        // Get completed quiz submissions for all children
        const quizSubmissions = await prisma.quizSubmission.findMany({
            where: {
                student_id: { in: studentIds },
                ...(yearId && { academic_year_id: yearId }),
                status: QuizStatus.COMPLETED
            },
            include: {
                quiz: {
                    include: {
                        subject: true
                    }
                },
                student: {
                    select: {
                        id: true,
                        name: true,
                        matricule: true
                    }
                }
            },
            orderBy: { submitted_at: 'desc' }
        });

        // Format the results
        return quizSubmissions.map(submission => ({
            submission_id: submission.id,
            student_name: submission.student.name,
            student_id: submission.student.id,
            student_matricule: submission.student.matricule,
            quiz_title: submission.quiz.title,
            subject: submission.quiz.subject.name,
            score: submission.score || 0,
            total_marks: submission.total_marks || submission.quiz.total_marks,
            percentage: submission.percentage || 0,
            submitted_at: submission.submitted_at,
            time_taken: submission.time_taken
        }));
    } catch (error) {
        console.error('Error fetching children quiz results:', error);
        throw new Error('Failed to fetch quiz results');
    }
}

/**
 * Get school announcements relevant to parents
 */
export async function getSchoolAnnouncements(parentId: number, limit: number = 10): Promise<any[]> {
    try {
        const announcements = await prisma.announcement.findMany({
            where: {
                audience: { in: ['BOTH', 'EXTERNAL'] }
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            include: {
                created_by: { select: { name: true, matricule: true } }
            }
        });

        return announcements.map(announcement => ({
            id: announcement.id,
            title: announcement.title,
            content: announcement.message,
            author: announcement.created_by?.name || 'Anonymous',
            created_at: announcement.created_at
        }));
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw new Error('Failed to fetch announcements');
    }
}

/**
 * Get detailed analytics for a specific child.
 */
export async function getChildAnalytics(parentId: number, studentId: number, academicYearId?: number): Promise<any> {
    try {
        // Verify parent-student relationship first
        const parentStudentLink = await prisma.parentStudent.findFirst({
            where: {
                parent_id: parentId,
                student_id: studentId
            }
        });

        if (!parentStudentLink) {
            throw new Error('Parent-student relationship not found');
        }

        // Try to get academic year ID
        let yearId = academicYearId;
        if (!yearId) {
            const currentYear = await getCurrentAcademicYear();
            yearId = currentYear?.id;
        }

        // Fetch student and enrollment details - try specific year first, then any enrollment
        let student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                enrollments: yearId ? { where: { academic_year_id: yearId } } : true
            }
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // If no enrollments found for specific year, try to get any enrollment
        if (student.enrollments.length === 0 && yearId) {
            student = await prisma.student.findUnique({
                where: { id: studentId },
                include: { enrollments: { orderBy: { created_at: 'desc' } } }
            });
        }

        // If still no enrollments, provide basic analytics
        if (!student || student.enrollments.length === 0) {
            return {
                studentInfo: {
                    id: studentId,
                    name: student?.name || 'Unknown',
                    classInfo: null
                },
                performanceAnalytics: {
                    overall_average: 0,
                    total_assessments: 0,
                    improvement_trend: 'No data',
                    performance_grade: 'N/A',
                    strengths: [],
                    areas_for_improvement: []
                },
                attendanceAnalytics: {
                    overall_attendance_rate: 0,
                    total_absences: 0,
                    monthly_trends: [],
                    attendance_status: 'No data',
                    recent_absences: []
                },
                quizAnalytics: {
                    total_quizzes: 0,
                    average_score: 0,
                    improvement_trend: 'No data',
                    subject_performance: [],
                    recent_quizzes: []
                },
                subjectTrends: [],
                comparativeAnalytics: {
                    class_comparison: 'No enrollment data',
                    relative_performance: 'N/A'
                }
            };
        }

        const enrollment = student.enrollments[0];
        const actualYearId = enrollment.academic_year_id;

        const marks = await prisma.mark.findMany({ where: { enrollment_id: enrollment.id } });

        const [
            performanceAnalytics,
            attendanceAnalytics,
            quizAnalytics,
            subjectTrends,
            comparativeAnalytics
        ] = await Promise.all([
            calculatePerformanceAnalytics(marks),
            calculateAttendanceAnalytics(enrollment.id, actualYearId),
            calculateQuizAnalytics(studentId, actualYearId),
            calculateSubjectTrends(marks),
            calculateComparativeAnalytics(studentId, enrollment.sub_class_id, actualYearId)
        ]);

        return {
            studentInfo: {
                id: student.id,
                name: student.name,
                classInfo: enrollment.sub_class_id ? {
                    className: 'Class Info Not Available',
                    subclassName: 'Subclass Info Not Available'
                } : null,
            },
            performanceAnalytics,
            attendanceAnalytics,
            quizAnalytics,
            subjectTrends,
            comparativeAnalytics,
        };
    } catch (error: any) {
        console.error('Error generating child analytics:', error);
        throw new Error(`Failed to generate analytics: ${error.message}`);
    }
}

/**
 * Calculate performance analytics from marks
 */
async function calculatePerformanceAnalytics(marks: any[]): Promise<any> {
    if (marks.length === 0) {
        return {
            overall_average: 0,
            total_assessments: 0,
            improvement_trend: 'No data',
            performance_grade: 'N/A',
            strengths: [],
            areas_for_improvement: []
        };
    }

    // Group marks by subject - Fix typing by properly typing the accumulator
    const subjectMarks: Record<string, number[]> = marks.reduce((acc, mark) => {
        const subjectName = mark.sub_class_subject?.subject?.name;
        if (!subjectName) return acc; // Skip marks without subject info
        if (!acc[subjectName]) {
            acc[subjectName] = [];
        }
        acc[subjectName].push(mark.score || 0);
        return acc;
    }, {} as Record<string, number[]>);

    // Calculate overall average
    const totalMarks = marks.reduce((sum, mark) => sum + (mark.score || 0), 0);
    const overallAverage = totalMarks / marks.length;

    // Calculate improvement trend (compare first half vs second half of marks)
    const midpoint = Math.floor(marks.length / 2);
    const firstHalfAvg = marks.slice(0, midpoint).reduce((sum, mark) => sum + (mark.score || 0), 0) / midpoint;
    const secondHalfAvg = marks.slice(midpoint).reduce((sum, mark) => sum + (mark.score || 0), 0) / (marks.length - midpoint);

    let improvementTrend = 'Stable';
    if (secondHalfAvg > firstHalfAvg + 2) {
        improvementTrend = 'Improving';
    } else if (secondHalfAvg < firstHalfAvg - 2) {
        improvementTrend = 'Declining';
    }

    // Calculate subject averages for strengths/weaknesses
    const subjectAverages = Object.entries(subjectMarks).map(([subject, marksList]) => ({
        subject,
        average: marksList.reduce((sum: number, mark: number) => sum + mark, 0) / marksList.length
    }));

    // Sort by performance
    subjectAverages.sort((a, b) => b.average - a.average);

    const strengths = subjectAverages.slice(0, 3).map(s => ({
        subject: s.subject,
        average: s.average.toFixed(1)
    }));

    const areasForImprovement = subjectAverages.slice(-3).map(s => ({
        subject: s.subject,
        average: s.average.toFixed(1),
        recommendation: generateRecommendation(s.average)
    }));

    return {
        overall_average: overallAverage.toFixed(2),
        total_assessments: marks.length,
        improvement_trend: improvementTrend,
        performance_grade: getPerformanceGrade(overallAverage),
        strengths,
        areas_for_improvement: areasForImprovement,
        subject_breakdown: subjectAverages
    };
}

/**
 * Calculate attendance analytics
 */
async function calculateAttendanceAnalytics(enrollmentId: number, academicYearId: number): Promise<any> {
    // Get absence records
    const absences = await prisma.studentAbsence.findMany({
        where: {
            enrollment_id: enrollmentId
        },
        orderBy: { created_at: 'asc' }
    });

    const totalSchoolDays = 180; // Estimate for academic year
    const totalAbsences = absences.length;
    const attendanceRate = ((totalSchoolDays - totalAbsences) / totalSchoolDays) * 100;

    // Calculate trends
    const currentMonth = new Date().getMonth();
    const monthlyAttendance = [];

    for (let month = 0; month < currentMonth + 1; month++) {
        const monthAbsences = absences.filter(absence =>
            new Date(absence.created_at).getMonth() === month
        ).length;

        const monthAttendanceRate = ((20 - monthAbsences) / 20) * 100; // ~20 school days per month
        monthlyAttendance.push({
            month: getMonthName(month),
            attendance_rate: monthAttendanceRate.toFixed(1),
            absences: monthAbsences
        });
    }

    return {
        overall_attendance_rate: attendanceRate.toFixed(1),
        total_absences: totalAbsences,
        monthly_trends: monthlyAttendance,
        attendance_status: getAttendanceStatus(attendanceRate),
        recent_absences: absences.slice(-5).map(absence => ({
            date: absence.created_at.toISOString().split('T')[0],
            type: absence.absence_type
        }))
    };
}

/**
 * Calculate quiz performance analytics
 */
async function calculateQuizAnalytics(studentId: number, academicYearId: number): Promise<any> {
    const quizSubmissions = await prisma.quizSubmission.findMany({
        where: {
            student_id: studentId,
            academic_year_id: academicYearId,
            status: QuizStatus.COMPLETED
        },
        include: {
            quiz: {
                include: {
                    subject: true
                }
            }
        },
        orderBy: { submitted_at: 'asc' }
    });

    if (quizSubmissions.length === 0) {
        return {
            total_quizzes: 0,
            average_score: 0,
            improvement_trend: 'No data',
            subject_performance: [],
            recent_quizzes: []
        };
    }

    const totalQuizzes = quizSubmissions.length;
    const averageScore = quizSubmissions.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / totalQuizzes;

    // Calculate improvement trend
    const midpoint = Math.floor(totalQuizzes / 2);
    const firstHalfAvg = quizSubmissions.slice(0, midpoint).reduce((sum, sub) => sum + (sub.percentage || 0), 0) / midpoint;
    const secondHalfAvg = quizSubmissions.slice(midpoint).reduce((sum, sub) => sum + (sub.percentage || 0), 0) / (totalQuizzes - midpoint);

    let improvementTrend = 'Stable';
    if (secondHalfAvg > firstHalfAvg + 5) {
        improvementTrend = 'Improving';
    } else if (secondHalfAvg < firstHalfAvg - 5) {
        improvementTrend = 'Declining';
    }

    // Subject-wise quiz performance
    const subjectPerformance = quizSubmissions.reduce((acc, submission) => {
        const subjectName = submission.quiz.subject.name;
        if (!acc[subjectName]) {
            acc[subjectName] = [];
        }
        acc[subjectName].push(submission.percentage || 0);
        return acc;
    }, {} as Record<string, number[]>);

    const subjectAnalytics = Object.entries(subjectPerformance).map(([subject, scores]) => ({
        subject,
        average: (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1),
        quiz_count: scores.length,
        best_score: Math.max(...scores).toFixed(1),
        latest_score: scores[scores.length - 1].toFixed(1)
    }));

    return {
        total_quizzes: totalQuizzes,
        average_score: averageScore.toFixed(1),
        improvement_trend: improvementTrend,
        subject_performance: subjectAnalytics,
        recent_quizzes: quizSubmissions.slice(-5).map(sub => ({
            quiz_title: sub.quiz.title,
            subject: sub.quiz.subject.name,
            score: sub.percentage?.toFixed(1),
            date: sub.submitted_at?.toISOString().split('T')[0]
        }))
    };
}

/**
 * Calculate subject-wise performance trends
 */
async function calculateSubjectTrends(marks: any[]): Promise<any[]> {
    // Group marks by subject and sort by date - Fix typing
    const subjectMarks: Record<string, any[]> = marks.reduce((acc, mark) => {
        const subjectName = mark.sub_class_subject?.subject?.name;
        if (!subjectName) return acc; // Skip marks without subject info
        if (!acc[subjectName]) {
            acc[subjectName] = [];
        }
        acc[subjectName].push({
            mark: mark.score || 0,
            date: mark.created_at,
            sequence: mark.exam_sequence?.name || 'Unknown'
        });
        return acc;
    }, {} as Record<string, any[]>);

    // Calculate trends for each subject
    return Object.entries(subjectMarks).map(([subject, subjectMarksList]) => {
        // Sort by date
        subjectMarksList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const currentAverage = subjectMarksList.reduce((sum, mark) => sum + mark.mark, 0) / subjectMarksList.length;

        // Calculate trend (linear regression approximation)
        let trend = 'Stable';
        if (subjectMarksList.length >= 3) {
            const firstThird = subjectMarksList.slice(0, Math.ceil(subjectMarksList.length / 3));
            const lastThird = subjectMarksList.slice(-Math.ceil(subjectMarksList.length / 3));

            const firstAvg = firstThird.reduce((sum, mark) => sum + mark.mark, 0) / firstThird.length;
            const lastAvg = lastThird.reduce((sum, mark) => sum + mark.mark, 0) / lastThird.length;

            if (lastAvg > firstAvg + 2) {
                trend = 'Improving';
            } else if (lastAvg < firstAvg - 2) {
                trend = 'Declining';
            }
        }

        return {
            subject,
            current_average: currentAverage.toFixed(1),
            trend,
            total_assessments: subjectMarksList.length,
            highest_mark: Math.max(...subjectMarksList.map(m => m.mark)),
            lowest_mark: Math.min(...subjectMarksList.map(m => m.mark)),
            recent_marks: subjectMarksList.slice(-3).map(mark => ({
                mark: mark.mark,
                sequence: mark.sequence,
                date: mark.date.toISOString().split('T')[0]
            }))
        };
    });
}

/**
 * Calculate comparative analytics (student vs class average)
 */
async function calculateComparativeAnalytics(studentId: number, subClassId: number | null, academicYearId: number): Promise<any> {
    if (!subClassId) {
        return {
            class_comparison: 'No class assignment',
            relative_performance: 'N/A'
        };
    }

    // Get all students in the same subclass
    const classmates = await prisma.enrollment.findMany({
        where: {
            sub_class_id: subClassId,
            academic_year_id: academicYearId
        },
        include: {
            marks: {
                include: {
                    sub_class_subject: {
                        include: {
                            subject: true
                        }
                    }
                }
            }
        }
    });

    const studentMarks = classmates.find(c => c.student_id === studentId)?.marks || [];
    const studentAverage = studentMarks.length > 0
        ? studentMarks.reduce((sum, mark) => sum + (mark.score || 0), 0) / studentMarks.length
        : 0;

    // Calculate class average
    const allMarks = classmates.flatMap(c => c.marks);
    const classAverage = allMarks.length > 0
        ? allMarks.reduce((sum, mark) => sum + (mark.score || 0), 0) / allMarks.length
        : 0;

    // Calculate ranking
    const studentAverages = classmates.map(c => {
        const marks = c.marks;
        return {
            student_id: c.student_id,
            average: marks.length > 0 ? marks.reduce((sum, mark) => sum + (mark.score || 0), 0) / marks.length : 0
        };
    }).sort((a, b) => b.average - a.average);

    const studentRank = studentAverages.findIndex(s => s.student_id === studentId) + 1;

    return {
        class_comparison: {
            student_average: studentAverage.toFixed(1),
            class_average: classAverage.toFixed(1),
            difference: (studentAverage - classAverage).toFixed(1),
            performance_status: studentAverage >= classAverage ? 'Above Average' : 'Below Average'
        },
        ranking: {
            position: studentRank,
            total_students: classmates.length,
            percentile: ((classmates.length - studentRank + 1) / classmates.length * 100).toFixed(0)
        }
    };
}

// Helper functions
function getPerformanceGrade(average: number): string {
    if (average >= 17) return 'Excellent (A)';
    if (average >= 14) return 'Very Good (B)';
    if (average >= 12) return 'Good (C)';
    if (average >= 10) return 'Fair (D)';
    return 'Needs Improvement (F)';
}

function generateRecommendation(average: number): string {
    if (average < 10) return 'Focus on fundamentals and seek additional help';
    if (average < 12) return 'Practice more exercises and review concepts';
    if (average < 14) return 'Work on consistency and exam techniques';
    return 'Maintain current performance level';
}

function getAttendanceStatus(rate: number): string {
    if (rate >= 95) return 'Excellent';
    if (rate >= 90) return 'Good';
    if (rate >= 85) return 'Fair';
    return 'Needs Improvement';
}

function getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
} 