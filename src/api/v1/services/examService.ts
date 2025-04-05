// src/api/v1/services/examService.ts

import prisma, { ExamPaper, ExamPaperQuestion, Mark, ExamSequence } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import * as StudentAverageService from './studentAverageService';
import getPuppeteerConfig from '../../../utils/puppeteer.config';

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
            duration: BigInt(data.duration), // Convert to BigInt as expected in schema
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
    subclass_subject_id: number;
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
            subclass_subject_id: data.subclass_subject_id,
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
                enrollmentFilter.subclass = { ...(enrollmentFilter.subclass || {}), class_id: classId };
            }
        } else if (key === 'subclass_id' || key === 'sub_class_id') {
            // Handle both subclass_id and sub_class_id (from camelCase subClassId)
            const subclassId = parseInt(value as string);
            if (!isNaN(subclassId)) {
                enrollmentFilter.subclass_id = subclassId;
            }
        } else if (key === 'subject_id') {
            const subjectId = parseInt(value as string);
            if (!isNaN(subjectId)) {
                where.subclass_subject = { subject_id: subjectId };
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
        } else if (key.startsWith('include')) {
            // Handle includes
            if (value === 'true') {
                if (key === 'includeStudent') {
                    include.enrollment = {
                        ...(include.enrollment || {}),
                        // If selecting student_id, also include full student + subclass/class
                        select: undefined, // Remove select if we need full include
                        include: {
                            student: true,
                            subclass: { include: { class: true } }
                        }
                    };
                } else if (key === 'includeSubject') {
                    include.subclass_subject = { include: { subject: true } };
                } else if (key === 'includeTeacher') {
                    include.teacher = true;
                } else if (key === 'includeExamSequence') {
                    include.exam_sequence = { include: { term: true } };
                }
            }
        }
    }

    // Add debugging
    console.log('--- getAllMarks Debug ---');
    console.log('Received filterOptions:', filterOptions);
    console.log('Converted key check - subclass_id exists:', 'subclass_id' in processedFilters);
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
    if (filterOptions?.includeSubject === 'true') {
        include.subject = true;
    }
    if (filterOptions?.includeQuestions === 'true') {
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

    // Use bracket notation to add the relationship that might have a different name
    include['exam_paper_questions'] = {
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
    subclassId?: number;
    studentId?: number;
}

/**
 * Generates a report card PDF for a student or all students in a subclass
 * @param params Configuration parameters for report card generation
 * @returns Path to the generated PDF file
 */
export async function generateReportCard(params: ReportCardParams): Promise<string> {
    const { academicYearId, examSequenceId, subclassId, studentId } = params;

    // Validate that either subclassId or studentId is provided
    if (!subclassId && !studentId) {
        throw new Error('Either subclassId or studentId must be provided');
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

    // If subclassId is provided, generate report cards for all students in the subclass
    if (subclassId) {
        return generateSubclassReportCards(subclassId, academicYearId, examSequenceId, examSequence);
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
    // Generate report data for a single student
    const reportData = await generateStudentReportData(studentId, academicYearId, examSequenceId, examSequence);

    // Generate PDF for the student
    const html = await renderReportCardHtml(reportData);

    // Generate PDF and save it
    const filePath = path.join(process.cwd(), `src/reports/${studentId}-${academicYearId}-${examSequenceId}-report.pdf`);
    await generatePdf(html, filePath);

    // console.log(`PDF saved at ${filePath}`);
    return filePath;
}

/**
 * Generates report cards for all students in a subclass
 */
async function generateSubclassReportCards(
    subclassId: number,
    academicYearId: number,
    examSequenceId: number,
    examSequence: any
): Promise<string> {
    // Find all enrollments for the subclass in the given academic year
    const enrollments = await prisma.enrollment.findMany({
        where: {
            subclass_id: subclassId,
            academic_year_id: academicYearId
        },
        include: {
            student: true
        },
        orderBy: {
            student: {
                name: 'asc'
            }
        }
    });

    if (enrollments.length === 0) {
        throw new Error('No students found in the specified subclass for the given academic year');
    }

    // Get subclass name for the file name
    const subclass = await prisma.subclass.findUnique({
        where: { id: subclassId },
        include: { class: true }
    });

    // Generate report data for each student
    const reportDataArray: ReportData[] = [];
    for (const enrollment of enrollments) {
        try {
            const studentReportData = await generateStudentReportData(
                enrollment.student_id,
                academicYearId,
                examSequenceId,
                examSequence
            );
            reportDataArray.push(studentReportData);
        } catch (error) {
            console.error(`Error generating report for student ${enrollment.student_id}:`, error);
            // Continue with other students
        }
    }

    if (reportDataArray.length === 0) {
        throw new Error('No report data generated for any student in the subclass');
    }

    // Generate HTML for each report
    const htmlPages = await Promise.all(reportDataArray.map(data => renderReportCardHtml(data)));

    // Combine all HTML pages and generate a single PDF
    const className = subclass?.class.name || 'Unknown';
    const subclassName = subclass?.name || 'Unknown';
    const filePath = path.join(
        process.cwd(),
        `src/reports/${className}-${subclassName}-${academicYearId}-${examSequenceId}-reports.pdf`
    );

    await generateMultiPagePdf(htmlPages, filePath);

    // console.log(`PDF with ${reportDataArray.length} report cards saved at ${filePath}`);
    return filePath;
}

/**
 * Generates the report data for a single student
 */
async function generateStudentReportData(
    studentId: number,
    academicYearId: number,
    examSequenceId: number,
    examSequence: any
): Promise<ReportData> {
    // 1. Fetch data from database
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: studentId,
            academic_year_id: academicYearId
        },
        include: {
            student: true,
            subclass: {
                include: {
                    class: true,
                    subclass_subjects: {
                        include: {
                            subject: true,
                        },
                    },
                    vice_principal_assignments: {
                        include: {
                            user: true,
                        },
                    },
                    class_master: true,
                },
            },
            marks: {
                where: {
                    exam_sequence_id: examSequenceId
                },
                include: {
                    subclass_subject: {
                        include: {
                            subject: true,
                        },
                    },
                    teacher: true
                },
            },
            academic_year: true,
        },
    });

    if (!enrollment) throw new Error('Student enrollment not found');
    if (enrollment.marks.length === 0) throw new Error('No marks found for the student in the given exam sequence');

    // 2. Calculate statistics
    const allStudents = await prisma.enrollment.findMany({
        where: { subclass_id: enrollment.subclass_id },
        include: {
            marks: {
                where: {
                    exam_sequence_id: examSequenceId
                },
                include: {
                    subclass_subject: {
                        include: {
                            subject: true
                        }
                    },
                    enrollment: true,
                },
            },
        },
    });

    const studentsWithAverages = allStudents
        .filter(student => student.marks.length > 0) // Only include students with marks
        .map(student => {
            const totalWeighted = student.marks.reduce(
                (sum, mark) => sum + mark.score * mark.subclass_subject.coefficient,
                0
            );
            const totalCoefficients = student.marks.reduce(
                (sum, mark) => sum + mark.subclass_subject.coefficient,
                0
            );
            return {
                ...student,
                overallAverage: totalCoefficients > 0 ? totalWeighted / totalCoefficients : 0,
            };
        }).sort((a, b) => b.overallAverage - a.overallAverage);

    const currentStudent = studentsWithAverages.find(s => s.student_id === studentId)!;

    // Calculate subject-specific statistics across all students
    const subjectStats = new Map();

    // Initialize subject stats
    enrollment.marks.forEach(mark => {
        if (!subjectStats.has(mark.subclass_subject_id)) {
            subjectStats.set(mark.subclass_subject_id, {
                scores: [],
                min: Infinity,
                max: -Infinity,
                total: 0,
                passed: 0
            });
        }
    });

    // Collect all scores for each subject across all students
    allStudents.forEach(student => {
        student.marks.forEach(mark => {
            const stats = subjectStats.get(mark.subclass_subject_id);
            if (stats) {
                stats.scores.push(mark.score);
                stats.min = Math.min(stats.min, mark.score);
                stats.max = Math.max(stats.max, mark.score);
                stats.total += mark.score;
                if (mark.score >= 10) {
                    stats.passed += 1;
                }
            }
        });
    });

    // Calculate averages and success rates
    subjectStats.forEach(stats => {
        if (stats.scores.length > 0) {
            stats.avg = stats.total / stats.scores.length;
            stats.successRate = (stats.passed / stats.scores.length) * 100;
        } else {
            stats.avg = 0;
            stats.successRate = 0;
        }
    });

    // Process subjects data with stats
    const subjects: SubjectData[] = enrollment.marks.map(mark => {
        const subjectStat = subjectStats.get(mark.subclass_subject_id) || {
            min: 0, max: 0, avg: 0, successRate: 0
        };

        return {
            category: mark.subclass_subject.subject.category,
            name: mark.subclass_subject.subject.name,
            coefficient: mark.subclass_subject.coefficient,
            mark: mark.score,
            weightedMark: mark.score * mark.subclass_subject.coefficient,
            rank: (allStudents.map((student) => student.marks.find(m => m.subclass_subject_id === mark.subclass_subject_id)).sort((a, b) => b!.score - a!.score).findIndex((m) => m?.enrollment.student_id === studentId) + 1) + 'th',
            teacher: mark.teacher.name,
            min: subjectStat.min,
            avg: parseFloat(subjectStat.avg.toFixed(2)),
            max: subjectStat.max,
            successRate: parseFloat(subjectStat.successRate.toFixed(2)),
            grade: getGrade(mark.score),
        };
    });

    // Extract unique categories
    const categorySet = new Set<string>(subjects.map(s => s.category));
    const categories = Array.from(categorySet);

    // Calculate category summaries
    const categorySummaries: CategorySummary[] = categories.map(category => {
        const categorySubjects = subjects.filter(s => s.category === category);
        const totalMark = categorySubjects.reduce((sum, s) => sum + s.mark, 0);
        const totalCoef = categorySubjects.reduce((sum, s) => sum + s.coefficient, 0);
        const totalWeightedMark = categorySubjects.reduce((sum, s) => sum + s.weightedMark, 0);
        const categoryAverage = totalMark / categorySubjects.length;

        // Calculate min, max, avg for the category
        const categoryMin = Math.min(...categorySubjects.map(s => s.min));
        const categoryMax = Math.max(...categorySubjects.map(s => s.max));
        const categoryAvg = categorySubjects.reduce((sum, s) => sum + s.avg, 0) / categorySubjects.length;

        // Calculate success rate for the category
        const categorySuccessRate = categorySubjects.reduce((sum, s) => sum + s.successRate, 0) / categorySubjects.length;

        // Calculate student's rank for this category
        // First, get the average for each student in this category
        const studentCategoryAverages = allStudents.map(student => {
            const studentCatSubjects = student.marks.filter(m => {
                // Check if this mark's subject belongs to the current category
                return m.subclass_subject.subject &&
                    m.subclass_subject.subject.category === category;
            });

            if (studentCatSubjects.length === 0) return { studentId: student.student_id, average: 0 };

            const catTotalWeighted = studentCatSubjects.reduce(
                (sum, mark) => sum + mark.score * mark.subclass_subject.coefficient,
                0
            );
            const catTotalCoef = studentCatSubjects.reduce(
                (sum, mark) => sum + mark.subclass_subject.coefficient,
                0
            );

            return {
                studentId: student.student_id,
                average: catTotalCoef > 0 ? catTotalWeighted / catTotalCoef : 0
            };
        })
            .filter(s => s.average > 0) // Only include students who have marks in this category
            .sort((a, b) => b.average - a.average); // Sort in descending order

        // Find current student's rank
        const studentRankIndex = studentCategoryAverages.findIndex(s => s.studentId === studentId);
        const categoryRank = studentRankIndex >= 0 ? `${studentRankIndex + 1}th` : 'N/A';

        return {
            category,
            totalMark,
            totalCoef,
            totalWeightedMark,
            categoryAverage,
            categoryGrade: getGrade(categoryAverage),
            categoryMin,
            categoryMax,
            categoryAvg,
            categorySuccessRate,
            categoryRank
        };
    });

    // Calculate overall totals
    const totalMark = subjects.reduce((sum, s) => sum + s.mark, 0);
    const totalCoef = subjects.reduce((sum, s) => sum + s.coefficient, 0);
    const totalWeightedMark = subjects.reduce((sum, s) => sum + s.weightedMark, 0);
    const overallAverage = totalWeightedMark / totalCoef;

    // 3. Prepare report data
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
            className: enrollment.subclass.class.name,
            enrolledStudents: allStudents.length,
            classMaster: enrollment.subclass.class_master ? enrollment.subclass.class_master.name : 'Not Assigned',
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
            overallAverage: currentStudent.overallAverage.toFixed(2),
            rank: `${studentsWithAverages.indexOf(currentStudent) + 1}th`,
            subjectsPassed: enrollment.marks.filter(m => m.score >= 10).length,
            classStats: {
                lowestAverage: studentsWithAverages.length > 0
                    ? Math.min(...studentsWithAverages.map(s => s.overallAverage)).toFixed(2)
                    : '0.00',
                highestAverage: studentsWithAverages.length > 0
                    ? Math.max(...studentsWithAverages.map(s => s.overallAverage)).toFixed(2)
                    : '0.00',
                successRate: studentsWithAverages.length > 0
                    ? (studentsWithAverages.filter(s => s.overallAverage >= 10).length / studentsWithAverages.length) * 100
                    : 0,
                standardDeviation: studentsWithAverages.length > 0
                    ? calculateStandardDeviation(studentsWithAverages.map(s => s.overallAverage)).toFixed(2)
                    : '0.00',
                classAverage: studentsWithAverages.length > 0
                    ? (studentsWithAverages.reduce((sum, s) => sum + s.overallAverage, 0) / studentsWithAverages.length).toFixed(2)
                    : '0.00',
            },
        },
        // Add exam sequence information
        examSequence: {
            name: `Evaluation N° ${examSequence.sequence_number}`,
            sequenceNumber: examSequence.sequence_number,
            termName: examSequence.term.name
        }
    };

    // Get the subclass_id from the enrollment for the StudentAverageService call
    const subclassId = enrollment.subclass_id;

    await StudentAverageService.calculateAndSaveStudentAverages(
        examSequenceId,
        subclassId
    );

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
 * Generates a PDF from HTML content
 */
async function generatePdf(html: string, filePath: string): Promise<void> {
    const browser = await puppeteer.launch(getPuppeteerConfig());
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
        format: 'A3',
        printBackground: true,
        margin: { top: '4mm', right: '4mm', bottom: '4mm', left: '4mm' },
        preferCSSPageSize: true,
        scale: 0.9,
        pageRanges: '1'
    });

    await browser.close();

    // Ensure the reports directory exists
    const reportsDir = path.dirname(filePath);
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save the PDF file
    fs.writeFileSync(filePath, pdf);
}

/**
 * Generates a multi-page PDF from multiple HTML pages
 */
async function generateMultiPagePdf(htmlPages: string[], filePath: string): Promise<void> {
    // Combine the HTML with page breaks and generate a single PDF
    const combinedHtml = htmlPages.map(html => {
        // Extract the body content from each HTML
        const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
        return `<div class="report-page">${bodyContent}</div>`;
    }).join('\n');

    // Create a wrapper HTML with CSS for page breaks and scaling
    const wrapperHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Combined Report Cards</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
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
                    transform: scale(0.85); /* Scale down slightly to fit content */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 90vh;
                }
                /* Avoid page breaks inside elements */
                table, tr, td, th {
                    page-break-inside: avoid;
                }
                @page {
                    size: A3 portrait;
                    margin: 0;
                }
                /* Reduce font sizes */
                .text-xs {
                    font-size: 0.7rem !important;
                }
                .text-sm {
                    font-size: 0.8rem !important;
                }
                /* Reduce spacing */
                .p-4 {
                    padding: 0.75rem !important;
                }
                .p-1 {
                    padding: 0.15rem !important;
                }
                .mb-4, .my-4 {
                    margin-bottom: 0.5rem !important;
                }
                /* Adjust table sizes */
                table {
                    font-size: 0.7rem !important;
                }
                /* Make content more compact */
                .container {
                    max-width: 95% !important;
                    padding: 0.5rem !important;
                    margin: 0 auto !important;
                }
            }
            /* Ensure each report fits on a page and is centered */
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
            /* Center the container within the page */
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

    // Generate a single PDF with all pages
    const browser = await puppeteer.launch(getPuppeteerConfig());
    const page = await browser.newPage();
    await page.setContent(wrapperHtml, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
        format: 'A3',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        preferCSSPageSize: true,
        scale: 0.95,
    });

    await browser.close();

    // Save the combined PDF
    fs.writeFileSync(filePath, pdf);
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
                            subclass: true
                        }
                    },
                    subclass_subject: {
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

    // Find the enrollment for this student
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: data.student_id
            // Consider adding academic_year_id filter here based on exam_id if needed
            // to ensure the correct enrollment is selected if a student has multiple.
        }
    });

    if (!enrollment) {
        throw new Error('Student enrollment not found for the specified student ID');
    }

    // Find the subclass_subject for this subject within the student's subclass
    const subclassSubject = await prisma.subclassSubject.findFirst({
        where: {
            subject_id: data.subject_id,
            subclass_id: enrollment.subclass_id
        }
    });

    if (!subclassSubject) {
        throw new Error('Subject is not assigned to student\'s subclass');
    }

    // Prepare data for create and update
    const markData = {
        exam_sequence_id: data.exam_id,
        enrollment_id: enrollment.id,
        subclass_subject_id: subclassSubject.id,
        teacher_id: data.teacher_id, // Keep using teacher_id for create operations
        score: data.mark
    };

    const updateData = {
        score: data.mark,
        teacher_id: data.teacher_id // Use teacher_id directly for update too
    };

    // Use upsert to create or update the mark
    return prisma.mark.upsert({
        where: {
            // Use the unique composite key defined in the schema
            exam_sequence_id_enrollment_id_subclass_subject_id: {
                exam_sequence_id: data.exam_id,
                enrollment_id: enrollment.id,
                subclass_subject_id: subclassSubject.id
            }
        },
        update: updateData, // Data to update if record exists
        create: markData,    // Data to create if record doesn't exist
        include: { // Include relations in the response
            exam_sequence: true,
            enrollment: {
                include: {
                    student: true
                }
            },
            subclass_subject: {
                include: {
                    subject: true
                }
            },
            teacher: true // Include the teacher associated with the mark
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
            subclass_subject: {
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

