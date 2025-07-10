// src/api/v1/services/examService.ts

import prisma, { ExamPaper, ExamPaperQuestion, Mark, ExamSequence, ExamSequenceStatus, ReportType, ReportStatus } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import * as puppeteer from 'puppeteer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import * as StudentAverageService from './studentAverageService';
import getPuppeteerConfig from '../../../utils/puppeteer.config';
import * as PuppeteerManager from '../../../utils/puppeteerManager';
import { reportGenerationQueue } from '../../../config/queue';

export async function createExamPaper(data: {
    name: string;
    subject_id: number;
    academic_year_id?: number;
    exam_date: string;
    duration: number;
}): Promise<ExamPaper> {
    // Get current academic year if not provided
    if (!data.academic_year_id) {
        data.academic_year_id = await getAcademicYearId() || undefined;
        if (!data.academic_year_id) {
            throw new Error("No academic year found and none provided");
        }
    }

    return prisma.examPaper.create({
        data: {
            name: data.name,
            subject_id: data.subject_id,
            academic_year_id: data.academic_year_id,
            exam_date: new Date(data.exam_date),
            duration: data.duration, // Use regular number since schema is now Int
        },
    });
}

/**
 * Creates an exam sequence (evaluation period)
 * This was previously named createExam but mistakenly created an exam paper
 */
export async function createExam(data: {
    sequence_number: number;
    term_id: number;
    academic_year_id?: number;
    start_date?: string;
    end_date?: string;
}): Promise<ExamSequence> {
    // Get current academic year if not provided
    if (!data.academic_year_id) {
        data.academic_year_id = await getAcademicYearId() || undefined;
        if (!data.academic_year_id) {
            throw new Error("No academic year found and none provided");
        }
    }

    return prisma.examSequence.create({
        data: {
            sequence_number: data.sequence_number,
            term_id: data.term_id,
            academic_year_id: data.academic_year_id,
            // start_date: data.start_date ? new Date(data.start_date) : undefined,
            // end_date: data.end_date ? new Date(data.end_date) : undefined,
        },
    });
}

export async function addQuestionsToExam(exam_paper_id: number, data: { question_id: number; order?: number }[]): Promise<ExamPaperQuestion[]> {
    const questionLinks = [];
    for (const q of data) {
        const questionLink = await prisma.examPaperQuestion.create({
            data: {
                exam_paper_id,
                question_id: q.question_id,
                order: q.order,
            },
        });
        questionLinks.push(questionLink);
    }
    return questionLinks;
}

export async function generateExam(exam_paper_id: number): Promise<any> {
    // Add logic for generating exam papers (randomizing questions, etc.)
    return { message: `Exam ${exam_paper_id} generated` };
}

export async function enterExamMarks(data: {
    enrollment_id?: number;
    student_id?: number;
    sub_class_subject_id: number;
    exam_sequence_id: number;
    score: number;
    teacher_id: number;
    academic_year_id?: number;
}): Promise<Mark> {
    // Handle the case where student_id is provided instead of enrollment_id
    if (data.student_id && !data.enrollment_id) {
        // Fetch current academic year ID if not provided
        const yearId = data.academic_year_id ?? await getAcademicYearId();
        if (!yearId) {
            throw new Error("Academic year ID is required to find enrollment by student ID, but none was provided or found.");
        }

        const enrollment = await getStudentSubclassByStudentAndYear(
            data.student_id,
            yearId // Use the determined yearId
        );

        if (!enrollment) {
            throw new Error(`Student with ID ${data.student_id} is not enrolled in the specified academic year (${yearId})`);
        }

        data.enrollment_id = enrollment.id;
    }

    // Ensure enrollment_id is present before creating the mark
    if (!data.enrollment_id) {
        throw new Error("Enrollment ID is required to enter marks.");
    }


    return prisma.mark.create({
        data: {
            enrollment_id: data.enrollment_id,
            sub_class_subject_id: data.sub_class_subject_id,
            exam_sequence_id: data.exam_sequence_id,
            score: data.score,
            teacher_id: data.teacher_id, // Keep using teacher_id for create operations
        },
    });
}

export async function generateReportCards(academicYearId?: number): Promise<any> {
    // Get current academic year if not provided
    const yearId = await getAcademicYearId(academicYearId);

    // Use yearId in your report card generation logic

    // Implement logic for generating report cards (PDF, Excel)
    return { message: 'Report cards generated', academicYearId: yearId };
}

// Get all marks with pagination and filtering
export async function getAllMarks(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions,
    academicYearId?: number
): Promise<PaginatedResult<Mark>> {
    const yearId = await getAcademicYearId(academicYearId);

    const where: any = {};
    const processedFilters: any = { ...filterOptions };
    let enrollmentFilter: any = {}; // Separate filter for enrollment relation
    let include: any = { // Define base includes
        // Always include enrollment relation to get student_id
        enrollment: {
            select: { student_id: true }
        }
    };

    // Build where clause based on filters
    for (const key in processedFilters) {
        const value = processedFilters[key];
        if (value === undefined || value === null || value === '') continue;

        if (key === 'student_id') {
            const studentId = parseInt(value as string);
            if (!isNaN(studentId)) {
                enrollmentFilter.student_id = studentId;
            }
        } else if (key === 'class_id') {
            const classId = parseInt(value as string);
            if (!isNaN(classId)) {
                enrollmentFilter.sub_class = { ...(enrollmentFilter.sub_class || {}), class_id: classId };
            }
        } else if (key === 'sub_class_id' || key === 'sub_class_id') {
            // Handle both sub_class_id and sub_class_id (from camelCase subClassId)
            const sub_classId = parseInt(value as string);
            if (!isNaN(sub_classId)) {
                enrollmentFilter.sub_class_id = sub_classId;
            }
        } else if (key === 'subject_id') {
            const subjectId = parseInt(value as string);
            if (!isNaN(subjectId)) {
                where.sub_class_subject = { subject_id: subjectId };
            }
        } else if (key === 'exam_sequence_id') {
            const examSequenceId = parseInt(value as string);
            if (!isNaN(examSequenceId)) {
                where.exam_sequence_id = examSequenceId;
            }
        } else if (key === 'minScore' || key === 'maxScore') {
            const score = parseFloat(value as string);
            if (!isNaN(score)) {
                where.score = {
                    ...(where.score || {}),
                    [key === 'minScore' ? 'gte' : 'lte']: score
                };
            }
        } else if (key.startsWith('include_')) {
            // Handle includes
            if (value === 'true') {
                if (key === 'include_student') {
                    include.enrollment = {
                        ...(include.enrollment || {}),
                        // If selecting student_id, also include full student + sub_class/class
                        select: undefined, // Remove select if we need full include
                        include: {
                            student: true,
                            sub_class: { include: { class: true } }
                        }
                    };
                } else if (key === 'include_subject') {
                    include.sub_class_subject = { include: { subject: true } };
                } else if (key === 'include_teacher') {
                    include.teacher = true;
                } else if (key === 'include_exam_sequence') {
                    include.exam_sequence = { include: { term: true } };
                }
            }
        }
    }

    // Add debugging
    console.log('--- getAllMarks Debug ---');
    console.log('Received filterOptions:', filterOptions);
    console.log('Converted key check - sub_class_id exists:', 'sub_class_id' in processedFilters);
    console.log('Converted key check - sub_class_id exists:', 'sub_class_id' in processedFilters);
    console.log('Received academicYearId:', academicYearId);
    console.log('Determined yearId:', yearId);

    // Apply enrollment filters if any were added
    if (Object.keys(enrollmentFilter).length > 0) {
        if (yearId) {
            enrollmentFilter.academic_year_id = yearId; // Add academic year to enrollment filter
        }
        where.enrollment = enrollmentFilter;
    } else if (yearId) {
        // If no other enrollment filters but year is specified, filter by year
        where.enrollment = { academic_year_id: yearId };
    }

    console.log('Constructed Prisma Where Clause:', JSON.stringify(where, null, 2));
    console.log('Constructed Prisma Include Clause:', JSON.stringify(include, null, 2));

    return paginate<Mark>(
        prisma.mark,
        paginationOptions,
        where,
        include
    );
}

// Get all exam papers with pagination and filtering
export async function getAllExamPapers(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions,
    academicYearId?: number
): Promise<PaginatedResult<ExamPaper>> {
    // Get current academic year ID if not explicitly provided
    const yearId = await getAcademicYearId(academicYearId);

    // Initialize where clause
    const where: any = {};

    // Add academic year filter if available
    if (yearId) {
        where.academic_year_id = yearId;
    }

    // Process other filters provided in filterOptions
    if (filterOptions) {
        if (filterOptions.subject_id) {
            where.subject_id = parseInt(filterOptions.subject_id as string);
        }
        if (filterOptions.name) {
            where.name = {
                contains: filterOptions.name,
                mode: 'insensitive'
            };
        }
        // Add other potential filters from filterOptions here
    }

    // Setup includes based on filterOptions (example)
    const include: any = {};
    if (filterOptions?.include_subject === 'true') {
        include.subject = true;
    }
    if (filterOptions?.include_questions === 'true') {
        include.questions = {
            include: {
                question: true
            }
        };
    }

    // Use the processed filters in the paginate function
    return paginate<ExamPaper>(
        prisma.examPaper,
        paginationOptions,
        where, // Use the constructed where clause
        include // Use constructed includes
    );
}

// Get a specific exam paper with its questions
export async function getExamPaperWithQuestions(examPaperId: number): Promise<ExamPaper | null> {
    // Use a dynamically built include object to avoid type checking issues
    const include: any = {
        subject: true,
        academic_year: true
    };

    // Use the correct relation name 'questions' as defined in the Prisma schema
    include['questions'] = {
        include: { question: true },
        orderBy: { order: 'asc' }
    };

    return prisma.examPaper.findUnique({
        where: { id: examPaperId },
        include
    });
}

// Report card interfaces
interface SubjectData {
    category: string;
    name: string;
    coefficient: number;
    mark: number;
    weightedMark: number;
    rank: string;
    teacher: string;
    min: number;
    avg: number;
    max: number;
    successRate: number;
    grade: string;
}

interface CategorySummary {
    category: string;
    totalMark: number;
    totalCoef: number;
    totalWeightedMark: number;
    categoryAverage: number;
    categoryGrade: string;
    categoryMin: number;
    categoryMax: number;
    categoryAvg: number;
    categorySuccessRate: number;
    categoryRank: string;
}

interface ReportData {
    student: {
        name: string;
        matricule: string;
        dateOfBirth: string;
        placeOfBirth: string;
        gender: string;
        repeater: boolean;
        photo: string;
    };
    classInfo: {
        className: string;
        enrolledStudents: number;
        classMaster: string;
        academicYear: string;
    };
    subjects: SubjectData[];
    categorySummaries: CategorySummary[];
    categories: string[];
    totals: {
        totalMark: number;
        totalCoef: number;
        totalWeightedMark: number;
        overallAverage: number;
        overallGrade: string;
    };
    statistics: {
        overallAverage: string;
        rank: string;
        subjectsPassed: number;
        classStats: {
            lowestAverage: string;
            highestAverage: string;
            successRate: number;
            standardDeviation: string;
            classAverage: string;
        };
    };
    examSequence?: {
        name: string;
        sequenceNumber: number;
        termName: string;
    };
}

// Define the parameter type for generateReportCard
interface ReportCardParams {
    academicYearId: number;
    examSequenceId: number;
    sub_classId?: number;
    studentId?: number;
}

/**
 * Generates a report card PDF for a student or all students in a sub_class
 * @param params Configuration parameters for report card generation
 * @returns Path to the generated PDF file
 */
export async function generateReportCard(params: ReportCardParams): Promise<string> {
    const { academicYearId, examSequenceId, sub_classId, studentId } = params;

    // Validate that either sub_classId or studentId is provided
    if (!sub_classId && !studentId) {
        throw new Error('Either sub_classId or studentId must be provided');
    }

    // Get the exam sequence information
    const examSequence = await prisma.examSequence.findUnique({
        where: { id: examSequenceId },
        include: { term: true }
    });

    if (!examSequence) {
        throw new Error('Exam sequence not found');
    }

    // If studentId is provided, generate a single report card
    if (studentId) {
        return generateSingleReportCard(studentId, academicYearId, examSequenceId, examSequence);
    }

    // If sub_classId is provided, generate report cards for all students in the sub_class
    if (sub_classId) {
        return generateSubclassReportCards(sub_classId, academicYearId, examSequenceId, examSequence);
    }

    throw new Error('Failed to generate report card');
}

/**
 * Generates a report card for a single student
 */
async function generateSingleReportCard(
    studentId: number,
    academicYearId: number,
    examSequenceId: number,
    examSequence: any
): Promise<string> {

    console.time('Student data generation');
    // Generate report data for a single student
    const reportData = await generateStudentReportData(studentId, academicYearId, examSequenceId, examSequence);
    console.timeEnd('Student data generation');

    console.time('Student html render generation');
    // Generate PDF for the student
    const html = await renderReportCardHtml(reportData);
    console.timeEnd('Student html render generation');

    console.time('Student report generation');
    // Generate PDF and save it
    const filePath = path.join(process.cwd(), `src/reports/${studentId}-${academicYearId}-${examSequenceId}-report.pdf`);
    await generatePdf(html, filePath);
    console.timeEnd('Student report generation');

    // console.log(`PDF saved at ${filePath}`);
    return filePath;
}

/**
 * Generates report cards for all students in a sub_class
 */
async function generateSubclassReportCards(
    sub_classId: number,
    academicYearId: number,
    examSequenceId: number,
    examSequence: any
): Promise<string> {
    console.time('Subclass data fetching and processing');

    // 1. Fetch Subclass and Academic Year Info
    const sub_class = await prisma.subClass.findUnique({
        where: { id: sub_classId },
        include: {
            class: true,
            class_master: true,
            // Fetch subjects defined for this subclass to avoid redundant fetches later
            sub_class_subjects: {
                include: { subject: true }
            }
        }
    });

    if (!sub_class) {
        throw new Error(`Subclass with ID ${sub_classId} not found.`);
    }

    const academic_year = await prisma.academicYear.findUnique({
        where: { id: academicYearId }
    });

    if (!academic_year) {
        throw new Error(`Academic year with ID ${academicYearId} not found.`);
    }
    const academicYearName = `${academic_year.start_date.getFullYear()}-${academic_year.end_date.getFullYear()}`;

    // 2. Fetch all Enrollments and their Marks for the Subclass/Year/Sequence
    const enrollments = await prisma.enrollment.findMany({
        where: {
            sub_class_id: sub_classId,
            academic_year_id: academicYearId
        },
        include: {
            student: true, // Include student details directly
            marks: {
                where: { exam_sequence_id: examSequenceId },
                include: {
                    // No need to include sub_class_subject again if fetched with sub_class
                    // subject: true is needed within sub_class_subject
                    sub_class_subject: {
                        include: {
                            subject: true,
                        }
                    },
                    teacher: true // Include teacher details
                }
            }
        },
        orderBy: {
            student: { name: 'asc' } // Keep sorting
        }
    });

    if (enrollments.length === 0) {
        throw new Error('No students found enrolled in the specified subclass for the given academic year');
    }

    // Filter out enrollments with no marks for this sequence to avoid errors later
    const validEnrollments = enrollments.filter(e => e.marks.length > 0);
    if (validEnrollments.length === 0) {
        throw new Error(`No marks found for any student in subclass ${sub_classId} for exam sequence ${examSequenceId}`);
    }
    const enrolledStudentsCount = enrollments.length; // Total enrolled, even if some have no marks yet

    // 3. Calculate Class-Wide Statistics Once
    console.time('Calculating class-wide stats');

    // Calculate overall averages and ranks for all students with marks
    const studentsWithAverages = validEnrollments.map(enrollment => {
        const totalWeighted = enrollment.marks.reduce(
            (sum, mark) => sum + mark.score * mark.sub_class_subject.coefficient,
            0
        );
        const totalCoefficients = enrollment.marks.reduce(
            (sum, mark) => sum + mark.sub_class_subject.coefficient,
            0
        );
        const overallAverage = totalCoefficients > 0 ? totalWeighted / totalCoefficients : 0;
        return {
            enrollmentId: enrollment.id,
            studentId: enrollment.student_id,
            overallAverage: overallAverage,
        };
    }).sort((a, b) => b.overallAverage - a.overallAverage); // Sort by average desc

    // Calculate subject-specific statistics (min, max, avg, success rate)
    const subjectStats = new Map<number, { scores: number[], min: number, max: number, total: number, passed: number, avg?: number, successRate?: number }>();
    const allMarksFlat = validEnrollments.flatMap(e => e.marks); // Get all marks in one array

    allMarksFlat.forEach(mark => {
        const subClassSubjectId = mark.sub_class_subject_id;
        if (!subjectStats.has(subClassSubjectId)) {
            subjectStats.set(subClassSubjectId, { scores: [], min: Infinity, max: -Infinity, total: 0, passed: 0 });
        }
        const stats = subjectStats.get(subClassSubjectId)!;
        stats.scores.push(mark.score);
        stats.min = Math.min(stats.min, mark.score);
        stats.max = Math.max(stats.max, mark.score);
        stats.total += mark.score;
        if (mark.score >= 10) { // Assuming passing score is 10
            stats.passed += 1;
        }
    });

    subjectStats.forEach(stats => {
        const count = stats.scores.length;
        if (count > 0) {
            stats.avg = stats.total / count;
            stats.successRate = (stats.passed / count) * 100;
        } else {
            stats.avg = 0;
            stats.successRate = 0;
        }
        // Clean up scores array if not needed anymore to save memory
        // delete stats.scores;
    });



    // Calculate class stats (lowest, highest, avg, std dev, success rate)
    const classAverages = studentsWithAverages.map(s => s.overallAverage);
    const classStats = {
        lowestAverage: classAverages.length > 0 ? Math.min(...classAverages).toFixed(2) : '0.00',
        highestAverage: classAverages.length > 0 ? Math.max(...classAverages).toFixed(2) : '0.00',
        successRate: classAverages.length > 0 ? (classAverages.filter(avg => avg >= 10).length / classAverages.length) * 100 : 0,
        standardDeviation: classAverages.length > 0 ? calculateStandardDeviation(classAverages).toFixed(2) : '0.00',
        classAverage: classAverages.length > 0 ? (classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length).toFixed(2) : '0.00',
    };

    console.timeEnd('Calculating class-wide stats');

    // 4. Generate ReportData for each student using pre-fetched data
    console.time('Generating individual report data objects');
    const reportDataArray: ReportData[] = [];
    for (const enrollment of validEnrollments) { // Use validEnrollments
        try {
            // Find student's rank
            const rankIndex = studentsWithAverages.findIndex(s => s.studentId === enrollment.student_id);
            const rank = rankIndex !== -1 ? `${rankIndex + 1}th` : 'N/A';
            const studentAverageData = studentsWithAverages[rankIndex]; // Get precalculated average

            // Prepare subjects data using student's marks and pre-calculated stats
            const subjects: SubjectData[] = enrollment.marks.map(mark => {
                const subClassSubjectId = mark.sub_class_subject_id;
                const stats = subjectStats.get(subClassSubjectId) || { min: 0, max: 0, avg: 0, successRate: 0 };

                // Calculate subject rank for this student (This still requires iterating, but only over averages)
                // This part is still potentially slow if many students/subjects. Consider optimizing if needed.
                // Alternative: Pre-calculate all subject ranks for all students once?
                const subjectScores = allMarksFlat
                    .filter(m => m.sub_class_subject_id === subClassSubjectId)
                    .sort((a, b) => b.score - a.score); // Sort scores for this subject
                const subjectRankIndex = subjectScores.findIndex(m => m.enrollment_id === enrollment.id);
                const subjectRank = subjectRankIndex !== -1 ? `${subjectRankIndex + 1}th` : 'N/A';

                return {
                    category: mark.sub_class_subject.subject.category,
                    name: mark.sub_class_subject.subject.name,
                    coefficient: mark.sub_class_subject.coefficient,
                    mark: mark.score,
                    weightedMark: mark.score * mark.sub_class_subject.coefficient,
                    rank: subjectRank, // Use calculated subject rank
                    teacher: mark.teacher.name,
                    min: stats.min === Infinity ? 0 : stats.min, // Handle case where subject had no marks
                    avg: parseFloat((stats.avg || 0).toFixed(2)),
                    max: stats.max === -Infinity ? 0 : stats.max, // Handle case where subject had no marks
                    successRate: parseFloat((stats.successRate || 0).toFixed(2)),
                    grade: getGrade(mark.score),
                };
            });

            // Prepare category summaries
            const categorySet = new Set<string>(subjects.map(s => s.category));
            const categories = Array.from(categorySet);
            const categorySummaries: CategorySummary[] = categories.map(category => {
                const categorySubjects = subjects.filter(s => s.category === category);
                if (categorySubjects.length === 0) {
                    // Handle cases where a category might somehow have no subjects for this student
                    return {
                        category, totalMark: 0, totalCoef: 0, totalWeightedMark: 0, categoryAverage: 0, categoryGrade: 'N/A',
                        categoryMin: 0, categoryMax: 0, categoryAvg: 0, categorySuccessRate: 0, categoryRank: 'N/A'
                    };
                }
                const totalMark = categorySubjects.reduce((sum, s) => sum + s.mark, 0);
                const totalCoef = categorySubjects.reduce((sum, s) => sum + s.coefficient, 0);
                const totalWeightedMark = categorySubjects.reduce((sum, s) => sum + s.weightedMark, 0);
                // Category average for THIS student
                const categoryAverage = totalCoef > 0 ? totalWeightedMark / totalCoef : 0;

                // Category stats (min, max, avg, success) are class-wide for subjects in this category
                const categorySubjectStats = Array.from(subjectStats.entries())
                    .filter(([subClassSubjectId, _]) => {
                        // Find the subject category for this subClassSubjectId
                        const scs = sub_class.sub_class_subjects.find(s => s.id === subClassSubjectId);
                        return scs?.subject.category === category;
                    })
                    .map(([_, stats]) => stats);

                const categoryMin = categorySubjectStats.length > 0 ? Math.min(...categorySubjectStats.map(s => s.min === Infinity ? 0 : s.min)) : 0;
                const categoryMax = categorySubjectStats.length > 0 ? Math.max(...categorySubjectStats.map(s => s.max === -Infinity ? 0 : s.max)) : 0;
                const categoryAvg = categorySubjectStats.length > 0 ? categorySubjectStats.reduce((sum, s) => sum + (s.avg || 0), 0) / categorySubjectStats.length : 0;
                const categorySuccessRate = categorySubjectStats.length > 0 ? categorySubjectStats.reduce((sum, s) => sum + (s.successRate || 0), 0) / categorySubjectStats.length : 0;

                // Calculate student's rank within this category (requires calculating category average for all students)
                // This is another potentially slow part.
                const studentCategoryAverages = validEnrollments.map(enr => {
                    const studentCatMarks = enr.marks.filter(m => m.sub_class_subject.subject.category === category);
                    if (studentCatMarks.length === 0) return { studentId: enr.student_id, average: 0 };
                    const catTotalWeighted = studentCatMarks.reduce((sum, m) => sum + m.score * m.sub_class_subject.coefficient, 0);
                    const catTotalCoef = studentCatMarks.reduce((sum, m) => sum + m.sub_class_subject.coefficient, 0);
                    return {
                        studentId: enr.student_id,
                        average: catTotalCoef > 0 ? catTotalWeighted / catTotalCoef : 0
                    };
                }).sort((a, b) => b.average - a.average);

                const studentCategoryRankIndex = studentCategoryAverages.findIndex(s => s.studentId === enrollment.student_id);
                const categoryRank = studentCategoryRankIndex >= 0 ? `${studentCategoryRankIndex + 1}th` : 'N/A';


                return {
                    category,
                    totalMark, // Student's total mark in category
                    totalCoef, // Student's total coef in category
                    totalWeightedMark, // Student's total weighted mark
                    categoryAverage, // Student's average in category
                    categoryGrade: getGrade(categoryAverage),
                    categoryMin: parseFloat(categoryMin.toFixed(2)), // Class min for category subjects
                    categoryMax: parseFloat(categoryMax.toFixed(2)), // Class max for category subjects
                    categoryAvg: parseFloat(categoryAvg.toFixed(2)),   // Class avg for category subjects
                    categorySuccessRate: parseFloat(categorySuccessRate.toFixed(2)), // Class success rate for category subjects
                    categoryRank // Student's rank within the category
                };
            });

            // Calculate overall totals for the student
            const totalMark = subjects.reduce((sum, s) => sum + s.mark, 0);
            const totalCoef = subjects.reduce((sum, s) => sum + s.coefficient, 0);
            const totalWeightedMark = subjects.reduce((sum, s) => sum + s.weightedMark, 0);
            const overallAverage = studentAverageData?.overallAverage ?? 0;

            // Assemble the final ReportData object
            const studentReportData: ReportData = {
                student: {
                    name: enrollment.student.name,
                    matricule: enrollment.student.matricule,
                    dateOfBirth: enrollment.student.date_of_birth.toISOString().split('T')[0],
                    placeOfBirth: enrollment.student.place_of_birth,
                    gender: enrollment.student.gender,
                    repeater: enrollment.repeater,
                    photo: enrollment.photo || 'default-photo.jpg', // Still needs embedding logic later
                },
                classInfo: {
                    className: `${sub_class.class.name} ${sub_class.name}`, // Combine class and sub_class name
                    enrolledStudents: enrolledStudentsCount, // Use total enrolled count
                    classMaster: sub_class.class_master?.name ?? 'Not Assigned',
                    academicYear: academicYearName,
                },
                subjects,
                categories,
                categorySummaries,
                totals: {
                    totalMark,
                    totalCoef,
                    totalWeightedMark,
                    overallAverage,
                    overallGrade: getGrade(overallAverage)
                },
                statistics: {
                    overallAverage: overallAverage.toFixed(2),
                    rank: rank, // Use precalculated rank
                    subjectsPassed: enrollment.marks.filter(m => m.score >= 10).length,
                    classStats: classStats // Use precalculated class stats
                },
                examSequence: {
                    name: `Evaluation N° ${examSequence.sequence_number}`,
                    sequenceNumber: examSequence.sequence_number,
                    termName: examSequence.term.name
                }
            };
            reportDataArray.push(studentReportData);

            // Call average calculation service (kept inside loop for now as per original logic)
            // Consider moving this to a bulk operation after the loop if possible
            try {
                await StudentAverageService.calculateAndSaveStudentAverages(examSequenceId, sub_classId);
            } catch (avgError) {
                console.error(`Error calculating/saving average for student ${enrollment.student_id}:`, avgError);
            }

        } catch (error) {
            console.error(`Error generating report data for student ${enrollment.student_id}:`, error);
            // Continue with other students
        }
    }
    console.timeEnd('Generating individual report data objects');

    if (reportDataArray.length === 0) {
        throw new Error('No valid report data could be generated for any student in the subclass.');
    }
    console.timeEnd('Subclass data fetching and processing'); // End overall timer

    // 5. Generate HTML and PDF
    console.time('Subclass html render generation');
    const htmlPages = await Promise.all(reportDataArray.map(data => renderReportCardHtml(data)));
    console.timeEnd('Subclass html render generation');

    const className = sub_class.class.name || 'Unknown';
    const sub_className = sub_class.name || 'Unknown';
    const filePath = path.join(
        process.cwd(),
        `src/reports/${className}-${sub_className}-${academicYearId}-${examSequenceId}-reports.pdf`
    );

    console.time('Subclass report generation');
    await generateMultiPagePdf(htmlPages, filePath); // Uses existing PDF generation
    console.timeEnd('Subclass report generation');

    return filePath;
}

/**
 * Generates the report data for a single student (Revised - can be simplified or potentially removed if only subclass reports use the optimized path)
 * Kept for single student report generation endpoint.
 */
async function generateStudentReportData(
    studentId: number,
    academicYearId: number,
    examSequenceId: number,
    examSequence: any // Expects pre-fetched exam sequence
): Promise<ReportData> {
    console.time(`Student ${studentId} data fetch`);
    // 1. Fetch data specifically for this student
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: studentId,
            academic_year_id: academicYearId
        },
        include: {
            student: true,
            academic_year: true,
            sub_class: {
                include: {
                    class: true,
                    class_master: true,
                }
            },
            marks: {
                where: { exam_sequence_id: examSequenceId },
                include: {
                    sub_class_subject: { include: { subject: true } },
                    teacher: true
                },
                orderBy: { // Optional: order marks if needed - Simplified sort
                    sub_class_subject: {
                        subject: {
                            category: 'asc' // Sort by category first
                            // Prisma doesn't allow multiple fields here directly.
                            // If secondary sort by name is critical, it might require post-processing.
                        }
                    }
                }
            }
        },
    });

    if (!enrollment) throw new Error(`Student enrollment not found for ID ${studentId} in year ${academicYearId}`);
    if (!enrollment.sub_class) throw new Error(`Subclass information missing for enrollment ${enrollment.id}`);
    if (enrollment.marks.length === 0) throw new Error(`No marks found for student ${studentId} in exam sequence ${examSequenceId}`);

    const sub_classId = enrollment.sub_class_id; // Get sub_classId for fetching class stats

    // 2. Fetch data needed for class/subject statistics (specific to this student's class)
    // This is less efficient than the subclass method but necessary for single reports
    const allEnrollmentsInSubclass = await prisma.enrollment.findMany({
        where: {
            sub_class_id: sub_classId,
            academic_year_id: academicYearId
        },
        include: {
            marks: {
                where: { exam_sequence_id: examSequenceId },
                include: {
                    sub_class_subject: { include: { subject: true } }
                }
            }
        },
    });
    console.timeEnd(`Student ${studentId} data fetch`);

    console.time(`Student ${studentId} stats calculation`);
    // Filter valid enrollments and calculate averages/ranks
    const validEnrollments = allEnrollmentsInSubclass.filter(e => e.marks.length > 0);
    const studentsWithAverages = validEnrollments.map(enr => {
        const totalWeighted = enr.marks.reduce((sum, mark) => sum + mark.score * mark.sub_class_subject.coefficient, 0);
        const totalCoefficients = enr.marks.reduce((sum, mark) => sum + mark.sub_class_subject.coefficient, 0);
        return {
            studentId: enr.student_id,
            overallAverage: totalCoefficients > 0 ? totalWeighted / totalCoefficients : 0,
        };
    }).sort((a, b) => b.overallAverage - a.overallAverage);

    const rankIndex = studentsWithAverages.findIndex(s => s.studentId === studentId);
    const rank = rankIndex !== -1 ? `${rankIndex + 1}th` : 'N/A';
    const currentStudentAverageData = studentsWithAverages[rankIndex];

    // Calculate subject statistics (similar to subclass method, but scoped to this class)
    const subjectStats = new Map<number, { scores: number[], min: number, max: number, total: number, passed: number, avg?: number, successRate?: number }>();
    const allMarksFlat = validEnrollments.flatMap(e => e.marks);

    allMarksFlat.forEach(mark => {
        const subClassSubjectId = mark.sub_class_subject_id;
        if (!subjectStats.has(subClassSubjectId)) {
            subjectStats.set(subClassSubjectId, { scores: [], min: Infinity, max: -Infinity, total: 0, passed: 0 });
        }
        const stats = subjectStats.get(subClassSubjectId)!;
        stats.scores.push(mark.score);
        stats.min = Math.min(stats.min, mark.score);
        stats.max = Math.max(stats.max, mark.score);
        stats.total += mark.score;
        if (mark.score >= 10) stats.passed += 1;
    });

    subjectStats.forEach(stats => {
        const count = stats.scores.length;
        stats.avg = count > 0 ? stats.total / count : 0;
        stats.successRate = count > 0 ? (stats.passed / count) * 100 : 0;
        // delete stats.scores; // Optional memory saving
    });

    // Calculate class stats
    const classAverages = studentsWithAverages.map(s => s.overallAverage);
    const classStats = {
        lowestAverage: classAverages.length > 0 ? Math.min(...classAverages).toFixed(2) : '0.00',
        highestAverage: classAverages.length > 0 ? Math.max(...classAverages).toFixed(2) : '0.00',
        successRate: classAverages.length > 0 ? (classAverages.filter(avg => avg >= 10).length / classAverages.length) * 100 : 0,
        standardDeviation: classAverages.length > 0 ? calculateStandardDeviation(classAverages).toFixed(2) : '0.00',
        classAverage: classAverages.length > 0 ? (classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length).toFixed(2) : '0.00',
    };

    // 3. Prepare student's specific data
    const subjects: SubjectData[] = enrollment.marks.map(mark => {
        const subClassSubjectId = mark.sub_class_subject_id;
        const stats = subjectStats.get(subClassSubjectId) || { min: 0, max: 0, avg: 0, successRate: 0 };

        // Calculate subject rank for this student
        const subjectScores = allMarksFlat
            .filter(m => m.sub_class_subject_id === subClassSubjectId)
            .sort((a, b) => b.score - a.score);
        const subjectRankIndex = subjectScores.findIndex(m => m.enrollment_id === enrollment.id);
        const subjectRank = subjectRankIndex !== -1 ? `${subjectRankIndex + 1}th` : 'N/A';

        return {
            category: mark.sub_class_subject.subject.category,
            name: mark.sub_class_subject.subject.name,
            coefficient: mark.sub_class_subject.coefficient,
            mark: mark.score,
            weightedMark: mark.score * mark.sub_class_subject.coefficient,
            rank: subjectRank,
            teacher: mark.teacher.name,
            min: stats.min === Infinity ? 0 : stats.min,
            avg: parseFloat((stats.avg || 0).toFixed(2)),
            max: stats.max === -Infinity ? 0 : stats.max,
            successRate: parseFloat((stats.successRate || 0).toFixed(2)),
            grade: getGrade(mark.score),
        };
    });

    const categorySet = new Set<string>(subjects.map(s => s.category));
    const categories = Array.from(categorySet);
    const categorySummaries: CategorySummary[] = categories.map(category => {
        const categorySubjects = subjects.filter(s => s.category === category);
        if (categorySubjects.length === 0) {
            return { category, totalMark: 0, totalCoef: 0, totalWeightedMark: 0, categoryAverage: 0, categoryGrade: 'N/A', categoryMin: 0, categoryMax: 0, categoryAvg: 0, categorySuccessRate: 0, categoryRank: 'N/A' };
        }
        const totalMark = categorySubjects.reduce((sum, s) => sum + s.mark, 0);
        const totalCoef = categorySubjects.reduce((sum, s) => sum + s.coefficient, 0);
        const totalWeightedMark = categorySubjects.reduce((sum, s) => sum + s.weightedMark, 0);
        const categoryAverage = totalCoef > 0 ? totalWeightedMark / totalCoef : 0;

        // Simplified category stats for single report - might differ slightly from batch if student data varies
        const categorySubjectStats = Array.from(subjectStats.entries())
            .filter(([subClassSubjectId, _]) => {
                const studentMark = enrollment.marks.find(m => m.sub_class_subject_id === subClassSubjectId);
                return studentMark?.sub_class_subject.subject.category === category;
            })
            .map(([_, stats]) => stats);

        const categoryMin = categorySubjectStats.length > 0 ? Math.min(...categorySubjectStats.map(s => s.min === Infinity ? 0 : s.min)) : 0;
        const categoryMax = categorySubjectStats.length > 0 ? Math.max(...categorySubjectStats.map(s => s.max === -Infinity ? 0 : s.max)) : 0;
        const categoryAvg = categorySubjectStats.length > 0 ? categorySubjectStats.reduce((sum, s) => sum + (s.avg || 0), 0) / categorySubjectStats.length : 0;
        const categorySuccessRate = categorySubjectStats.length > 0 ? categorySubjectStats.reduce((sum, s) => sum + (s.successRate || 0), 0) / categorySubjectStats.length : 0;

        // Calculate student's rank within this category
        const studentCategoryAverages = validEnrollments.map(enr => {
            const studentCatMarks = enr.marks.filter(m => m.sub_class_subject.subject.category === category);
            if (studentCatMarks.length === 0) return { studentId: enr.student_id, average: 0 };
            const catTotalWeighted = studentCatMarks.reduce((sum, m) => sum + m.score * m.sub_class_subject.coefficient, 0);
            const catTotalCoef = studentCatMarks.reduce((sum, m) => sum + m.sub_class_subject.coefficient, 0);
            return { studentId: enr.student_id, average: catTotalCoef > 0 ? catTotalWeighted / catTotalCoef : 0 };
        }).sort((a, b) => b.average - a.average);
        const studentCategoryRankIndex = studentCategoryAverages.findIndex(s => s.studentId === studentId);
        const categoryRank = studentCategoryRankIndex >= 0 ? `${studentCategoryRankIndex + 1}th` : 'N/A';

        return {
            category,
            totalMark,
            totalCoef,
            totalWeightedMark,
            categoryAverage,
            categoryGrade: getGrade(categoryAverage),
            categoryMin: parseFloat(categoryMin.toFixed(2)),
            categoryMax: parseFloat(categoryMax.toFixed(2)),
            categoryAvg: parseFloat(categoryAvg.toFixed(2)),
            categorySuccessRate: parseFloat(categorySuccessRate.toFixed(2)),
            categoryRank
        };
    });

    const totalMark = subjects.reduce((sum, s) => sum + s.mark, 0);
    const totalCoef = subjects.reduce((sum, s) => sum + s.coefficient, 0);
    const totalWeightedMark = subjects.reduce((sum, s) => sum + s.weightedMark, 0);
    const overallAverage = currentStudentAverageData?.overallAverage ?? 0;
    console.timeEnd(`Student ${studentId} stats calculation`);

    // Assemble ReportData
    const reportData: ReportData = {
        student: {
            name: enrollment.student.name,
            matricule: enrollment.student.matricule,
            dateOfBirth: enrollment.student.date_of_birth.toISOString().split('T')[0],
            placeOfBirth: enrollment.student.place_of_birth,
            gender: enrollment.student.gender,
            repeater: enrollment.repeater,
            photo: enrollment.photo || 'default-photo.jpg',
        },
        classInfo: {
            className: `${enrollment.sub_class.class.name} ${enrollment.sub_class.name}`,
            enrolledStudents: allEnrollmentsInSubclass.length, // Total count in class
            classMaster: enrollment.sub_class.class_master?.name ?? 'Not Assigned',
            academicYear: `${enrollment.academic_year.start_date.getFullYear()}-${enrollment.academic_year.end_date.getFullYear()}`,
        },
        subjects,
        categories,
        categorySummaries,
        totals: {
            totalMark,
            totalCoef,
            totalWeightedMark,
            overallAverage,
            overallGrade: getGrade(overallAverage)
        },
        statistics: {
            overallAverage: overallAverage.toFixed(2),
            rank: rank,
            subjectsPassed: enrollment.marks.filter(m => m.score >= 10).length,
            classStats: classStats
        },
        examSequence: {
            name: `Evaluation N° ${examSequence.sequence_number}`,
            sequenceNumber: examSequence.sequence_number,
            termName: examSequence.term.name
        }
    };

    // Call average calculation service
    try {
        await StudentAverageService.calculateAndSaveStudentAverages(examSequenceId, sub_classId);
    } catch (avgError) {
        console.error(`Error calculating/saving average for student ${studentId}:`, avgError);
    }

    return reportData;
}

/**
 * Renders the HTML for a report card using the EJS template
 */
async function renderReportCardHtml(reportData: ReportData): Promise<string> {
    const template = fs.readFileSync(path.join(process.cwd(), 'src/view/report-template.ejs'), 'utf-8');
    return ejs.render(template, reportData);
}

/**
 * Generates a PDF from HTML content using the shared browser instance
 */
async function generatePdf(html: string, filePath: string): Promise<void> {
    let page: puppeteer.Page | null = null;
    try {
        page = await PuppeteerManager.newPage(); // Get a page from the manager
        await page.setContent(html, { waitUntil: 'networkidle0' }); // Reverted to networkidle0

        const pdf = await page.pdf({
            format: 'A3',
            printBackground: true,
            margin: { top: '4mm', right: '4mm', bottom: '4mm', left: '4mm' },
            preferCSSPageSize: true,
            scale: 0.9, // Keep previous scale
            pageRanges: '1' // Generate only the first page (for single report)
        });

        // Ensure the reports directory exists
        const reportsDir = path.dirname(filePath);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Save the PDF file
        fs.writeFileSync(filePath, pdf);

    } catch (error) {
        console.error(`Error generating single PDF at ${filePath}:`, error);
        // Decide how to handle the error, e.g., re-throw or return an error indicator
        throw error; // Re-throw for the caller to handle
    } finally {
        if (page) {
            try {
                await page.close(); // Close the page, not the browser
            } catch (closeError) {
                console.error(`Error closing Puppeteer page for ${filePath}:`, closeError);
            }
        }
    }
}

/**
 * Generates a multi-page PDF from multiple HTML pages using the shared browser instance
 */
async function generateMultiPagePdf(htmlPages: string[], filePath: string): Promise<void> {
    let page: puppeteer.Page | null = null;
    try {
        // Combine the HTML with page breaks and generate a single PDF
        const combinedHtml = htmlPages.map(html => {
            const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
            return `<div class=\"report-page\">${bodyContent}</div>`;
        }).join('\n');

        // Create a wrapper HTML with CSS for page breaks and scaling (keep existing styles)
        const wrapperHtml = `
    <!DOCTYPE html>
    <html>
    <head>
            <meta charset=\"UTF-8\">
        <title>Combined Report Cards</title>
            <script src=\"https://cdn.tailwindcss.com\"></script>
        <style>
                /* Keep existing styles from previous version */
            html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
            }
            @media print {
                .report-page {
                    page-break-after: always;
                    box-sizing: border-box;
                    transform-origin: center;
                    margin-top: 20px;
                    margin-bottom: 20px;
                        transform: scale(0.85);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 90vh;
                }
                table, tr, td, th {
                    page-break-inside: avoid;
                }
                @page {
                    size: A3 portrait;
                    margin: 0;
                }
                .text-xs {
                    font-size: 0.7rem !important;
                }
                .text-sm {
                    font-size: 0.8rem !important;
                }
                .p-4 {
                    padding: 0.75rem !important;
                }
                .p-1 {
                    padding: 0.15rem !important;
                }
                .mb-4, .my-4 {
                    margin-bottom: 0.5rem !important;
                }
                table {
                    font-size: 0.7rem !important;
                }
                .container {
                    max-width: 95% !important;
                    padding: 0.5rem !important;
                    margin: 0 auto !important;
                }
            }
            .report-page {
                position: relative;
                box-sizing: border-box;
                width: 100%;
                max-width: 100%;
                padding: 10px;
                margin: 20px auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 90vh;
            }
            .container {
                margin: 0 auto !important;
                width: 95% !important;
            }
        </style>
    </head>
    <body>
        ${combinedHtml}
    </body>
    </html>`;

        // Ensure the reports directory exists
        const reportsDir = path.dirname(filePath);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Generate a single PDF with all pages using the manager
        page = await PuppeteerManager.newPage();
        await page.setContent(wrapperHtml, { waitUntil: 'networkidle0' }); // Reverted to networkidle0

        const pdf = await page.pdf({
            format: 'A3',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, // Keep existing margins
            preferCSSPageSize: true,
            scale: 0.95, // Keep existing scale
            // No pageRanges needed here, print all pages
        });

        // Save the combined PDF
        fs.writeFileSync(filePath, pdf);

    } catch (error) {
        console.error(`Error generating multi-page PDF at ${filePath}:`, error);
        // Decide how to handle the error
        throw error; // Re-throw for the caller to handle
    } finally {
        if (page) {
            try {
                await page.close(); // Close the page, not the browser
            } catch (closeError) {
                console.error(`Error closing Puppeteer page for ${filePath}:`, closeError);
            }
        }
    }
}

/**
 * Calculates the standard deviation of a set of numbers
 */
function calculateStandardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    return Math.sqrt(numbers.map(n => Math.pow(n - avg, 2)).reduce((a, b) => a + b) / numbers.length);
}

/**
 * Determines the grade based on a mark
 */
function getGrade(mark: number): string {
    if (mark >= 18) return 'A+';
    if (mark >= 16) return 'A';
    if (mark >= 15) return 'B+';
    if (mark >= 14) return 'B';
    if (mark >= 12) return 'C+';
    if (mark >= 10) return 'C';
    return 'D';
}

/**
 * Get all exams with optional pagination and filtering
 */
export async function getAllExams(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions
): Promise<PaginatedResult<ExamSequence>> {

    // Get current academic year ID if academic_year_id filter is not explicitly set
    let yearId = filterOptions?.academic_year_id ? parseInt(filterOptions.academic_year_id as string) : undefined;
    if (!yearId) {
        yearId = await getAcademicYearId() ?? undefined;
    }

    // Initialize where clause
    const where: any = {};

    // Add academic year filter if available
    if (yearId) {
        where.academic_year_id = yearId;
    }

    // Process other filters from filterOptions
    if (filterOptions) {
        if (filterOptions.term_id) {
            where.term_id = parseInt(filterOptions.term_id as string);
        }
        if (filterOptions.sequence_number) {
            where.sequence_number = parseInt(filterOptions.sequence_number as string);
        }
        // Remove academic_year_id from filterOptions as it's handled separately
        delete filterOptions.academic_year_id;
    }

    // Setup includes
    const include: any = {};
    if (filterOptions?.includeTerm === 'true') {
        include.term = true;
        delete filterOptions.includeTerm; // Remove from filters after handling
    }
    if (filterOptions?.includeAcademicYear === 'true') {
        include.academic_year = true;
        delete filterOptions.includeAcademicYear; // Remove from filters after handling
    }

    // Use paginate utility
    return paginate<ExamSequence>(
        prisma.examSequence,
        paginationOptions,
        where, // Pass the constructed where clause
        include // Pass the constructed include object
    );
}

/**
 * Get a specific exam by its ID
 */
export async function getExamById(id: number): Promise<ExamSequence | null> {
    return prisma.examSequence.findUnique({
        where: { id },
        include: {
            term: true,
            academic_year: true,
            marks: {
                include: {
                    enrollment: {
                        include: {
                            student: true,
                            sub_class: true
                        }
                    },
                    sub_class_subject: {
                        include: {
                            subject: true
                        }
                    }
                }
            }
        }
    });
}

/**
 * Delete an exam by its ID
 */
export async function deleteExam(id: number): Promise<ExamSequence> {
    // First delete related marks
    await prisma.mark.deleteMany({
        where: { exam_sequence_id: id }
    });

    // Then delete the exam sequence
    return prisma.examSequence.delete({
        where: { id }
    });
}

/**
 * Create or update a mark (Upsert)
 */
export async function createMark(data: {
    exam_id: number;
    student_id: number;
    subject_id: number;
    mark: number;
    teacher_id: number;
}): Promise<Mark> {
    // Validate the mark score
    if (data.mark < 0 || data.mark > 20) {
        throw new Error('Mark must be between 0 and 20');
    }

    // 1. Find the ExamSequence to get the correct academic year
    const examSequence = await prisma.examSequence.findUnique({
        where: { id: data.exam_id },
        select: { academic_year_id: true } // Select only the academic year ID
    });

    if (!examSequence || !examSequence.academic_year_id) {
        // If examSequence.academic_year_id could potentially be null based on your schema,
        // you might need to fetch the current academic year as a fallback.
        // const currentAcademicYearId = await getAcademicYearId();
        // if (!currentAcademicYearId) {
        //     throw new Error('Could not determine academic year for the exam or current year.');
        // }
        // academicYearId = currentAcademicYearId;
        throw new Error(`Exam sequence with ID ${data.exam_id} not found or has no associated academic year.`);
    }
    const academicYearId = examSequence.academic_year_id;

    // 2. Find the enrollment for this student IN THE CORRECT ACADEMIC YEAR
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: data.student_id,
            academic_year_id: academicYearId
        },
        select: { id: true, sub_class_id: true } // Select only needed fields
    });

    if (!enrollment) {
        throw new Error(`Student enrollment not found for student ID ${data.student_id} in academic year ${academicYearId}`);
    }

    // 3. Find the sub_class_subject for this subject within the student's sub_class
    const sub_classSubject = await prisma.subClassSubject.findFirst({
        where: {
            subject_id: data.subject_id,
            sub_class_id: enrollment.sub_class_id
        },
        select: { id: true } // Select only the ID
    });

    if (!sub_classSubject) {
        throw new Error(`Subject ID ${data.subject_id} is not assigned to student's sub_class ID ${enrollment.sub_class_id}`);
    }

    // 4. Prepare data for create and update
    const markData = {
        exam_sequence_id: data.exam_id,
        enrollment_id: enrollment.id,
        sub_class_subject_id: sub_classSubject.id,
        teacher_id: data.teacher_id,
        score: data.mark
    };

    // 5. Use upsert to create or update the mark
    return prisma.mark.upsert({
        where: {
            exam_sequence_id_enrollment_id_sub_class_subject_id: {
                exam_sequence_id: data.exam_id,
                enrollment_id: enrollment.id,
                sub_class_subject_id: sub_classSubject.id
            }
        },
        update: { // Only update score and teacher_id on conflict
            score: data.mark,
            teacher_id: data.teacher_id
        },
        create: markData,
        include: { // Include relations in the response
            exam_sequence: true,
            enrollment: {
                include: {
                    student: true
                }
            },
            sub_class_subject: {
                include: {
                    subject: true
                }
            },
            teacher: true
        }
    });
}

/**
 * Update an existing mark
 */
export async function updateMark(
    id: number,
    data: { mark?: number; comment?: string; teacher_id?: number; }
): Promise<Mark> {
    // Validate the mark score if it's being updated
    if (data.mark !== undefined && (data.mark < 0 || data.mark > 20)) {
        throw new Error('Mark must be between 0 and 20');
    }

    // Build the update data object
    const updateData: any = {};

    // Add score if provided
    if (data.mark !== undefined) {
        updateData.score = data.mark;
    }

    // Add teacher_id if provided
    if (data.teacher_id !== undefined) {
        updateData.teacher_id = data.teacher_id;
    }

    return prisma.mark.update({
        where: { id },
        data: updateData,
        include: {
            exam_sequence: true,
            enrollment: {
                include: {
                    student: true
                }
            },
            sub_class_subject: {
                include: {
                    subject: true
                }
            }
        }
    });
}

/**
 * Delete a mark
 */
export async function deleteMark(id: number): Promise<Mark> {
    return prisma.mark.delete({
        where: { id }
    });
}

/**
 * Updates the status of an ExamSequence and triggers report generation if finalized.
 */
export async function updateExamSequenceStatus(
    examSequenceId: number,
    newStatus: ExamSequenceStatus
): Promise<ExamSequence> {
    const examSequence = await prisma.examSequence.findUnique({
        where: { id: examSequenceId },
        include: { academic_year: true } // Needed for academic year context
    });

    if (!examSequence) {
        throw new Error(`Exam sequence with ID ${examSequenceId} not found`);
    }
    if (!examSequence.academic_year_id) {
        throw new Error(`Exam sequence ${examSequenceId} does not have an associated academic year.`);
    }

    const updatedSequence = await prisma.examSequence.update({
        where: { id: examSequenceId },
        data: { status: newStatus },
    });

    // If the status is set to FINALIZED, trigger background report generation
    if (newStatus === ExamSequenceStatus.FINALIZED) {
        console.log(`Exam sequence ${examSequenceId} finalized. Triggering report generation...`);

        // Update status to REPORTS_GENERATING immediately
        await prisma.examSequence.update({
            where: { id: examSequenceId },
            data: { status: ExamSequenceStatus.REPORTS_GENERATING },
        });

        try {
            // Find all distinct sub_classes associated with marks in this sequence
            const marksInSequence = await prisma.mark.findMany({
                where: { exam_sequence_id: examSequenceId },
                distinct: ['enrollment_id'], // Get distinct enrollments first
                select: {
                    enrollment: {
                        select: {
                            id: true,
                            student_id: true,
                            sub_class_id: true,
                        }
                    }
                }
            });

            if (marksInSequence.length === 0) {
                console.warn(`No marks found for exam sequence ${examSequenceId}. Skipping report generation.`);
                // Optionally set status back or to FAILED/AVAILABLE immediately
                await prisma.examSequence.update({
                    where: { id: examSequenceId },
                    data: { status: ExamSequenceStatus.REPORTS_AVAILABLE }, // Or FAILED if appropriate
                });
                return updatedSequence; // Return the sequence updated to REPORTS_GENERATING
            }

            const enrollments = marksInSequence.map(m => m.enrollment).filter(e => e !== null) as {
                id: number;
                student_id: number;
                sub_class_id: number;
            }[];

            // --- REMOVE Queueing jobs for INDIVIDUAL student reports ---
            /*
            const individualJobPromises = enrollments.map(async (enrollment) => {
                // ... removed individual job queuing logic ...
            });
            */

            // --- Queue jobs ONLY for combined SUBCLASS reports ---
            const distinctSubClassIds = [...new Set(enrollments.map(e => e.sub_class_id))];
            console.log(`[${examSequenceId}] Found distinct subclasses for combined reports: ${distinctSubClassIds.join(', ')}`);

            const subclassJobPromises = distinctSubClassIds.map(async (subClassId) => {
                // Create or find existing GeneratedReport record for the subclass manually
                let reportRecord = await prisma.generatedReport.findFirst({
                    where: {
                        report_type: ReportType.SUBCLASS,
                        exam_sequence_id: examSequenceId,
                        academic_year_id: examSequence.academic_year_id!,
                        sub_class_id: subClassId,
                    }
                });

                if (reportRecord) {
                    // Update existing record if found (reset status)
                    reportRecord = await prisma.generatedReport.update({
                        where: { id: reportRecord.id },
                        data: { status: ReportStatus.PENDING, error_message: null, page_number: null, file_path: null } // Reset fields on retry
                    });
                } else {
                    // Create new record if not found
                    reportRecord = await prisma.generatedReport.create({
                        data: {
                            report_type: ReportType.SUBCLASS,
                            exam_sequence_id: examSequenceId,
                            academic_year_id: examSequence.academic_year_id!,
                            sub_class_id: subClassId,
                            status: ReportStatus.PENDING,
                        }
                    });
                }

                // Add job to the queue for the subclass
                const subclassJobName = `generate-subclass-report-subclass-${subClassId}-seq-${examSequenceId}`;
                const subclassJobId = `subclass-report-${reportRecord.id}`; // Unique job ID
                await reportGenerationQueue.add(subclassJobName, { // Used imported queue
                    generatedReportId: reportRecord.id, // ID of the SUBCLASS record
                    reportType: ReportType.SUBCLASS,
                    subClassId: subClassId,
                    academicYearId: examSequence.academic_year_id!,
                    examSequenceId: examSequenceId,
                }, { jobId: subclassJobId }); // Prevent duplicate jobs
                console.log(`[${examSequenceId}] Added combined report job (${subclassJobId}) for subclass ${subClassId}`);
            });

            // Wait for all subclass job additions to complete
            await Promise.all(subclassJobPromises);
            console.log(`[${examSequenceId}] All combined subclass report generation jobs added.`);

        } catch (error) {
            console.error(`Error triggering report generation jobs for sequence ${examSequenceId}:`, error);
            // Attempt to mark sequence as FAILED if job creation failed
            try {
                await prisma.examSequence.update({
                    where: { id: examSequenceId },
                    data: { status: ExamSequenceStatus.REPORTS_FAILED },
                });
            } catch (statusUpdateError) {
                console.error(`Failed to update sequence ${examSequenceId} status to REPORTS_FAILED:`, statusUpdateError);
            }
            // Re-throw the original error if needed
            // throw error;
        }
    }

    return updatedSequence;
}

export async function deleteExamPaper(id: number): Promise<ExamPaper> {
    // Check if exam paper exists
    const examPaper = await prisma.examPaper.findUnique({
        where: { id }
    });

    if (!examPaper) {
        throw new Error(`Exam paper with ID ${id} not found`);
    }

    // Delete the exam paper by ID
    return prisma.examPaper.delete({
        where: { id }
    });
}

