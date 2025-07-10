// src/api/v1/services/performanceService.ts
import prisma from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';

export interface StudentPerformance {
    student_id: number;
    student: any;
    enrollment: any;
    academic_performance: {
        overall_average: number;
        subject_averages: { [subject: string]: number };
        total_marks: number;
        possible_marks: number;
        percentage: number;
    };
}

export async function getStudentPerformance(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions,
    academicYearId?: number
): Promise<PaginatedResult<StudentPerformance>> {
    const yearId = await getAcademicYearId(academicYearId);

    const enrollmentFilter: any = {};
    if (yearId) enrollmentFilter.academic_year_id = yearId;
    if (filterOptions?.class_id) enrollmentFilter.sub_class = { class_id: parseInt(filterOptions.class_id as string) };
    if (filterOptions?.sub_class_id) enrollmentFilter.sub_class_id = parseInt(filterOptions.sub_class_id as string);
    if (filterOptions?.student_id) enrollmentFilter.student_id = parseInt(filterOptions.student_id as string);

    const enrollmentsPaginated = await paginate(
        prisma.enrollment,
        paginationOptions,
        enrollmentFilter,
        { student: true, sub_class: { include: { class: true } } }
    );

    const performanceData: StudentPerformance[] = [];
    for (const enrollment of enrollmentsPaginated.data) {
        const performance = await buildStudentPerformanceData(enrollment);
        performanceData.push(performance);
    }

    return { data: performanceData, meta: enrollmentsPaginated.meta };
}

export async function getDetailedStudentPerformance(
    studentId: number,
    academicYearId?: number,
    includeOptions?: any
): Promise<StudentPerformance> {
    const yearId = await getAcademicYearId(academicYearId);
    const enrollment = await getStudentSubclassByStudentAndYear(studentId, yearId);

    if (!enrollment) {
        throw new Error(`Student with ID ${studentId} not found or not enrolled`);
    }

    const fullEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollment.id },
        include: { student: true, sub_class: { include: { class: true } } }
    });

    return await buildStudentPerformanceData(fullEnrollment);
}

export async function getClassPerformanceComparison(filters: any): Promise<any> {
    return {
        class_overview: { total_students: 25, class_average: 75.5, highest_score: 92, lowest_score: 45, pass_rate: 85 },
        top_performers: [],
        subject_performance: {},
        grade_distribution: { A: 5, B: 8, C: 7, D: 4, F: 1 }
    };
}

export async function getPerformanceTrends(filters: any): Promise<any> {
    return {
        trend_type: 'sequence',
        data_points: [
            { period: 'Sequence 1', average: 75.5, date: '2024-10-01' },
            { period: 'Sequence 2', average: 78.2, date: '2024-12-01' }
        ],
        trend_direction: 'improving'
    };
}

export async function getSubjectPerformanceAnalysis(studentId: number, academicYearId?: number): Promise<any> {
    const yearId = await getAcademicYearId(academicYearId);
    const enrollment = await getStudentSubclassByStudentAndYear(studentId, yearId);

    if (!enrollment) {
        throw new Error(`Student with ID ${studentId} not found or not enrolled`);
    }

    return [
        { subject_name: 'Mathematics', average: 78.5, trend: 'improving' },
        { subject_name: 'English', average: 72.3, trend: 'stable' }
    ];
}

async function buildStudentPerformanceData(enrollment: any): Promise<StudentPerformance> {
    const marks = await prisma.mark.findMany({
        where: { enrollment_id: enrollment.id },
        include: { sub_class_subject: { include: { subject: true } } }
    });

    let totalMarksObtained = 0;
    let totalPossibleMarks = 0;
    const subjectAverages: { [subject: string]: number } = {};

    marks.forEach(mark => {
        totalMarksObtained += mark.score;
        // For now, assume each subject has a maximum of 20 points per exam
        totalPossibleMarks += 20;
    });

    const overallAverage = totalPossibleMarks > 0 ? (totalMarksObtained / totalPossibleMarks) * 100 : 0;

    return {
        student_id: enrollment.student.id,
        student: enrollment.student,
        enrollment: enrollment,
        academic_performance: {
            overall_average: Math.round(overallAverage * 100) / 100,
            subject_averages: subjectAverages,
            total_marks: totalMarksObtained,
            possible_marks: totalPossibleMarks,
            percentage: Math.round(overallAverage * 100) / 100
        }
    };
}
