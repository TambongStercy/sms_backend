import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';
import { sendNotification } from './notificationService';

export interface TeacherAttendanceStats {
    totalTeachers: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    attendanceRate: number;
    weeklyAttendanceRate: number;
    monthlyAttendanceRate: number;
}

export interface TeacherAttendanceDetail {
    teacherId: number;
    teacherName: string;
    matricule: string;
    department: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
    weeklyHours: number;
    periodsAssigned: number;
    periodsAttended: number;
    recentAbsences: any[];
    performanceScore: number;
}

export interface AttendanceFilters {
    teacherId?: number;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
    attendanceStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'SICK_LEAVE' | 'AUTHORIZED_LEAVE';
    minAttendanceRate?: number;
    maxAttendanceRate?: number;
}

export interface AttendanceTrend {
    date: string;
    totalTeachers: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
}

// Get comprehensive teacher attendance overview
export async function getTeacherAttendanceOverview(
    academicYearId?: number
): Promise<TeacherAttendanceStats> {
    try {
        const currentAcademicYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentAcademicYear) {
            throw new Error('No academic year found');
        }

        const academicYearIdValue = typeof currentAcademicYear === 'number' ? currentAcademicYear : currentAcademicYear.id;

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Get all teachers
        const teachers = await prisma.user.findMany({
            where: {
                user_roles: {
                    some: {
                        role: { in: ['TEACHER', 'HOD'] },
                        academic_year_id: { in: [academicYearIdValue, null] }
                    }
                }
            },
            select: { id: true }
        });

        const totalTeachers = teachers.length;

        // Get today's attendance
        const todayAttendance = await prisma.teacherAbsence.findMany({
            where: {
                created_at: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            select: {
                teacher_id: true,
                reason: true
            }
        });

        const absentToday = todayAttendance.filter(a =>
            a.reason.toLowerCase().includes('absent')
        ).length;

        const lateToday = todayAttendance.filter(a =>
            a.reason.toLowerCase().includes('late')
        ).length;

        const presentToday = totalTeachers - absentToday;

        // Calculate weekly attendance rate
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyAbsences = await prisma.teacherAbsence.count({
            where: {
                created_at: {
                    gte: weekStart,
                    lte: endOfDay
                }
            }
        });

        const weeklyAttendanceRate = totalTeachers > 0
            ? ((totalTeachers * 7 - weeklyAbsences) / (totalTeachers * 7)) * 100
            : 0;

        // Calculate monthly attendance rate
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyAbsences = await prisma.teacherAbsence.count({
            where: {
                created_at: {
                    gte: monthStart,
                    lte: endOfDay
                }
            }
        });

        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const monthlyAttendanceRate = totalTeachers > 0
            ? ((totalTeachers * daysInMonth - monthlyAbsences) / (totalTeachers * daysInMonth)) * 100
            : 0;

        const attendanceRate = totalTeachers > 0 ? (presentToday / totalTeachers) * 100 : 0;

        return {
            totalTeachers,
            presentToday,
            absentToday,
            lateToday,
            attendanceRate,
            weeklyAttendanceRate,
            monthlyAttendanceRate
        };
    } catch (error: any) {
        console.error('Error fetching teacher attendance overview:', error);
        throw error;
    }
}

// Get detailed teacher attendance analytics
export async function getTeacherAttendanceDetails(
    filters: AttendanceFilters,
    page: number = 1,
    limit: number = 20,
    academicYearId?: number
): Promise<{
    teachers: TeacherAttendanceDetail[];
    pagination: any;
    summary: any;
}> {
    try {
        const currentAcademicYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentAcademicYear) {
            throw new Error('No academic year found');
        }

        const academicYearIdValue = typeof currentAcademicYear === 'number' ? currentAcademicYear : currentAcademicYear.id;

        const skip = (page - 1) * limit;

        // Build teacher query
        const teacherWhere: any = {
            user_roles: {
                some: {
                    role: { in: ['TEACHER', 'HOD'] },
                    academic_year_id: { in: [academicYearIdValue, null] }
                }
            }
        };

        if (filters.teacherId) {
            teacherWhere.id = filters.teacherId;
        }

        // Get teachers
        const teachers = await prisma.user.findMany({
            where: teacherWhere,
            include: {
                user_roles: {
                    where: {
                        academic_year_id: { in: [academicYearIdValue, null] }
                    }
                },
                subject_teachers: {
                    include: {
                        subject: true
                    }
                },
                teacher_periods: {
                    where: {
                        academic_year_id: academicYearIdValue
                    }
                }
            },
            skip,
            take: limit
        });

        const total = await prisma.user.count({ where: teacherWhere });

        // Calculate analytics for each teacher
        const teacherDetails: TeacherAttendanceDetail[] = [];

        for (const teacher of teachers) {
            const teacherAnalytics = await calculateTeacherAttendanceAnalytics(
                teacher.id,
                filters,
                academicYearIdValue
            );

            teacherDetails.push({
                teacherId: teacher.id,
                teacherName: teacher.name,
                matricule: teacher.matricule,
                department: teacher.subject_teachers[0]?.subject?.name || 'Unassigned',
                ...teacherAnalytics
            });
        }

        // Calculate summary statistics
        const summary = {
            averageAttendanceRate: teacherDetails.reduce((sum, t) => sum + t.attendanceRate, 0) / teacherDetails.length,
            totalAbsences: teacherDetails.reduce((sum, t) => sum + t.absentDays, 0),
            totalLatedays: teacherDetails.reduce((sum, t) => sum + t.lateDays, 0),
            averagePerformanceScore: teacherDetails.reduce((sum, t) => sum + t.performanceScore, 0) / teacherDetails.length
        };

        return {
            teachers: teacherDetails,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            summary
        };
    } catch (error: any) {
        console.error('Error fetching teacher attendance details:', error);
        throw error;
    }
}

// Calculate individual teacher attendance analytics
async function calculateTeacherAttendanceAnalytics(
    teacherId: number,
    filters: AttendanceFilters,
    academicYearId: number
): Promise<Omit<TeacherAttendanceDetail, 'teacherId' | 'teacherName' | 'matricule' | 'department'>> {
    try {
        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().getFullYear(), 0, 1);
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();

        // Get teacher absences
        const absences = await prisma.teacherAbsence.findMany({
            where: {
                teacher_id: teacherId,
                created_at: {
                    gte: dateFrom,
                    lte: dateTo
                }
            },
            include: {
                teacher_period: {
                    include: {
                        period: true,
                        subject: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Get teacher periods
        const teacherPeriods = await prisma.teacherPeriod.findMany({
            where: {
                teacher_id: teacherId,
                academic_year_id: academicYearId
            }
        });

        // Calculate attendance metrics
        const totalDaysInPeriod = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        const absentDays = absences.filter(a => a.reason.toLowerCase().includes('absent')).length;
        const lateDays = absences.filter(a => a.reason.toLowerCase().includes('late')).length;
        const presentDays = totalDaysInPeriod - absentDays;
        const attendanceRate = totalDaysInPeriod > 0 ? (presentDays / totalDaysInPeriod) * 100 : 0;

        // Calculate weekly hours (assuming 5 days per week)
        const weeklyHours = teacherPeriods.length;

        // Calculate periods attended vs assigned
        const periodsAssigned = teacherPeriods.length * totalDaysInPeriod;
        const periodsAttended = periodsAssigned - absences.length;

        // Calculate performance score (weighted average of attendance rate and period attendance)
        const performanceScore = (attendanceRate * 0.6) + ((periodsAttended / Math.max(periodsAssigned, 1)) * 100 * 0.4);

        // Get recent absences (last 10)
        const recentAbsences = absences.slice(0, 10).map(absence => ({
            date: absence.created_at,
            reason: absence.reason,
            period: absence.teacher_period?.period?.name || 'General',
            subject: absence.teacher_period?.subject?.name || 'N/A'
        }));

        return {
            totalDays: totalDaysInPeriod,
            presentDays,
            absentDays,
            lateDays,
            attendanceRate,
            weeklyHours,
            periodsAssigned,
            periodsAttended,
            recentAbsences,
            performanceScore
        };
    } catch (error: any) {
        throw new Error(`Failed to calculate teacher attendance analytics: ${error.message}`);
    }
}

// Get attendance trends over time
export async function getAttendanceTrends(
    dateFrom: string,
    dateTo: string,
    academicYearId?: number
): Promise<AttendanceTrend[]> {
    try {
        const currentAcademicYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentAcademicYear) {
            throw new Error('No academic year found');
        }

        const academicYearIdValue = typeof currentAcademicYear === 'number' ? currentAcademicYear : currentAcademicYear.id;

        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        const trends: AttendanceTrend[] = [];

        // Get total teachers for the period
        const totalTeachers = await prisma.user.count({
            where: {
                user_roles: {
                    some: {
                        role: { in: ['TEACHER', 'HOD'] },
                        academic_year_id: { in: [academicYearIdValue, null] }
                    }
                }
            }
        });

        // Generate daily trends
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dailyAbsences = await prisma.teacherAbsence.findMany({
                where: {
                    created_at: {
                        gte: dayStart,
                        lte: dayEnd
                    }
                }
            });

            const absentCount = dailyAbsences.filter(a => a.reason.toLowerCase().includes('absent')).length;
            const lateCount = dailyAbsences.filter(a => a.reason.toLowerCase().includes('late')).length;
            const presentCount = totalTeachers - absentCount;
            const attendanceRate = totalTeachers > 0 ? (presentCount / totalTeachers) * 100 : 0;

            trends.push({
                date: date.toISOString().split('T')[0],
                totalTeachers,
                presentCount,
                absentCount,
                lateCount,
                attendanceRate
            });
        }

        return trends;
    } catch (error: any) {
        console.error('Error fetching attendance trends:', error);
        throw error;
    }
}

// Get teacher attendance alerts
export async function getTeacherAttendanceAlerts(
    academicYearId?: number
): Promise<any[]> {
    try {
        const currentAcademicYear = academicYearId ?
            await prisma.academicYear.findUnique({ where: { id: academicYearId } }) :
            await getCurrentAcademicYear();

        if (!currentAcademicYear) {
            throw new Error('No academic year found');
        }

        const academicYearIdValue = typeof currentAcademicYear === 'number' ? currentAcademicYear : currentAcademicYear.id;

        const alerts = [];

        // Get teachers with low attendance rate (< 85%)
        const lowAttendanceTeachers = await prisma.user.findMany({
            where: {
                user_roles: {
                    some: {
                        role: { in: ['TEACHER', 'HOD'] },
                        academic_year_id: { in: [academicYearIdValue, null] }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                matricule: true
            }
        });

        for (const teacher of lowAttendanceTeachers) {
            const analytics = await calculateTeacherAttendanceAnalytics(
                teacher.id,
                {},
                academicYearIdValue
            );

            if (analytics.attendanceRate < 85) {
                alerts.push({
                    type: 'LOW_ATTENDANCE',
                    severity: 'HIGH',
                    teacher: teacher,
                    attendanceRate: analytics.attendanceRate,
                    message: `${teacher.name} has low attendance rate: ${analytics.attendanceRate.toFixed(1)}%`
                });
            }
        }

        // Get teachers with frequent recent absences (> 3 in last 7 days)
        const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentAbsences = await prisma.teacherAbsence.findMany({
            where: {
                created_at: {
                    gte: recentDate
                }
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        matricule: true
                    }
                }
            }
        });

        const absencesByTeacher = recentAbsences.reduce((acc, absence) => {
            const teacherId = absence.teacher_id;
            if (!acc[teacherId]) {
                acc[teacherId] = {
                    teacher: absence.teacher,
                    count: 0
                };
            }
            acc[teacherId].count++;
            return acc;
        }, {} as any);

        Object.values(absencesByTeacher).forEach((data: any) => {
            if (data.count > 3) {
                alerts.push({
                    type: 'FREQUENT_ABSENCES',
                    severity: 'MEDIUM',
                    teacher: data.teacher,
                    absenceCount: data.count,
                    message: `${data.teacher.name} has ${data.count} absences in the last 7 days`
                });
            }
        });

        return alerts;
    } catch (error: any) {
        console.error('Error fetching teacher attendance alerts:', error);
        throw error;
    }
}

// Record teacher attendance
export async function recordTeacherAttendance(
    teacherId: number,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'SICK_LEAVE' | 'AUTHORIZED_LEAVE',
    reason?: string,
    periodId?: number,
    recordedBy?: number
): Promise<any> {
    try {
        if (status === 'ABSENT' || status === 'LATE' || status === 'SICK_LEAVE' || status === 'AUTHORIZED_LEAVE') {
            // Record absence
            const absence = await prisma.teacherAbsence.create({
                data: {
                    teacher_id: teacherId,
                    reason: reason || status,
                    teacher_period_id: periodId,
                    assigned_by_id: recordedBy || 1 // System user
                }
            });

            // Send notification for unauthorized absences
            if (status === 'ABSENT' && recordedBy) {
                await sendNotification({
                    user_id: teacherId,
                    message: `Attendance Alert: Your absence has been recorded. Please contact administration if this is incorrect.`
                });
            }

            return absence;
        }

        // For PRESENT status, we could create a positive attendance record
        // but typically only absences are recorded
        return { status: 'PRESENT', message: 'Attendance recorded as present' };
    } catch (error: any) {
        console.error('Error recording teacher attendance:', error);
        throw error;
    }
}

// Get department attendance summary
export async function getDepartmentAttendanceSummary(
    academicYearId?: number
): Promise<any[]> {
    try {
        const currentAcademicYear = academicYearId || await getCurrentAcademicYear();
        if (!currentAcademicYear) {
            throw new Error('No academic year found');
        }

        const academicYearIdValue = typeof currentAcademicYear === 'number' ? currentAcademicYear : currentAcademicYear.id;

        const subjects = await prisma.subject.findMany({
            include: {
                subject_teachers: {
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                name: true,
                                matricule: true
                            }
                        }
                    }
                }
            }
        });

        const departmentSummaries = [];

        for (const subject of subjects) {
            const teachers = subject.subject_teachers.map(st => st.teacher);
            const teacherIds = teachers.map(t => t.id);

            if (teacherIds.length === 0) continue;

            // Get attendance data for this department
            const absences = await prisma.teacherAbsence.count({
                where: {
                    teacher_id: { in: teacherIds },
                    created_at: {
                        gte: new Date(new Date().getFullYear(), 0, 1) // This year
                    }
                }
            });

            const totalDays = teachers.length * 365; // Approximate
            const attendanceRate = totalDays > 0 ? ((totalDays - absences) / totalDays) * 100 : 0;

            departmentSummaries.push({
                department: subject.name,
                totalTeachers: teachers.length,
                totalAbsences: absences,
                attendanceRate,
                teachers: teachers.map(t => ({
                    id: t.id,
                    name: t.name,
                    matricule: t.matricule
                }))
            });
        }

        return departmentSummaries.sort((a, b) => b.attendanceRate - a.attendanceRate);
    } catch (error: any) {
        console.error('Error fetching department attendance summary:', error);
        throw error;
    }
} 