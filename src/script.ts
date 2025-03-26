// report.service.ts
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import getPuppeteerConfig from './utils/puppeteer.config';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

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
    const filePath = path.join(__dirname, `reports/${studentId}-${academicYearId}-${examSequenceId}-report.pdf`);
    await generatePdf(html, filePath);

    console.log(`PDF saved at ${filePath}`);
    return filePath;
}

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

    console.log(reportDataArray.length);

    // Generate HTML for each report
    const htmlPages = await Promise.all(reportDataArray.map(data => renderReportCardHtml(data)));

    // Combine all HTML pages and generate a single PDF
    const className = subclass?.class.name || 'Unknown';
    const subclassName = subclass?.name || 'Unknown';
    const filePath = path.join(
        __dirname,
        `reports/${className}-${subclassName}-${academicYearId}-${examSequenceId}-reports.pdf`
    );

    await generateMultiPagePdf(htmlPages, filePath);

    console.log(`PDF with ${reportDataArray.length} report cards saved at ${filePath}`);
    return filePath;
}

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
                            main_teacher: true,
                        },
                    },
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
                            main_teacher: true,
                        },
                    },
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
            teacher: mark.subclass_subject.main_teacher.name,
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
            classMaster: enrollment.subclass.subclass_subjects[0]?.main_teacher.name || 'Not Assigned',
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

    return reportData;
}

async function renderReportCardHtml(reportData: ReportData): Promise<string> {
    const template = fs.readFileSync(path.join(__dirname, 'view/report-template.ejs'), 'utf-8');
    return ejs.render(template, reportData);
}

async function generatePdf(html: string, filePath: string): Promise<void> {
    const browser = await puppeteer.launch(getPuppeteerConfig());
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
        format: 'A3',
        printBackground: true,
        margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
        preferCSSPageSize: true,
        pageRanges: '1'
    });

    await browser.close();

    // Ensure the reports directory exists
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save the PDF file
    fs.writeFileSync(filePath, pdf);
}

async function generateMultiPagePdf(htmlPages: string[], filePath: string): Promise<void> {
    // Instead of trying to merge PDF buffers, we'll combine the HTML with page breaks
    // and generate a single PDF from the combined HTML
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
    const reportsDir = path.join(__dirname, 'reports');
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
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, // Equal margins
        preferCSSPageSize: true,
        scale: 0.95, // Slightly larger scale for better centering
    });

    await browser.close();

    // Save the combined PDF
    fs.writeFileSync(filePath, pdf);
}

function getGrade(mark: number): string {
    if (mark >= 18) return 'A+';
    if (mark >= 16) return 'A';
    if (mark >= 15) return 'B+';
    if (mark >= 14) return 'B';
    if (mark >= 12) return 'C+';
    if (mark >= 10) return 'C';
    return 'D';
}

function calculateStandardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    return Math.sqrt(numbers.map(n => Math.pow(n - avg, 2)).reduce((a, b) => a + b) / numbers.length);
}

// Example usage:
// For a single student
// generateReportCard({
//     academicYearId: 1,
//     examSequenceId: 1,
//     studentId: 1
// }).then(console.log).catch(console.error);

// For all students in a subclass
generateReportCard({
    academicYearId: 1,
    examSequenceId: 1,
    subclassId: 1
}).then(console.log).catch(console.error);