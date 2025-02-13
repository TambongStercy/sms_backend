// report.service.ts
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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
    subjects: {
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
    }[];
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
}

export async function generateReportCard(studentId: number, academicYearId: number) {
    // 1. Fetch data from database
    const enrollment = await prisma.student_SubClass_Year.findFirst({
        where: { student_id: studentId, academic_year_id: academicYearId },
        include: {
            student: true,
            subclass: {
                include: {
                    class: true,
                    sub_class_subjects: {
                        include: {
                            subject: true,
                            mainTeacher: true,
                        },
                    },
                },
            },
            marks: {
                include: {
                    subclass_subject: {
                        include: {
                            subject: true,
                            mainTeacher: true,
                        },
                    },
                },
            },
            academicYear: true,
        },
    });

    if (!enrollment) throw new Error('Student enrollment not found');

    // 2. Calculate statistics
    const allStudents = await prisma.student_SubClass_Year.findMany({
        where: { subclass_id: enrollment.subclass_id },
        include: {
            marks: {
                include: {
                    subclass_subject: true,
                    student_subclass: true,
                },
            },
        },
    });

    const studentsWithAverages = allStudents.map(student => {
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
            overallAverage: totalWeighted / totalCoefficients,
        };
    }).sort((a, b) => b.overallAverage - a.overallAverage);

    const currentStudent = studentsWithAverages.find(s => s.student_id === studentId)!;

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
            classMaster: enrollment.subclass.sub_class_subjects[0].mainTeacher.name,
            academicYear: `${enrollment.academicYear.start_date.getFullYear()}-${enrollment.academicYear.end_date.getFullYear()}`,
        },
        subjects: enrollment.marks.map(mark => ({
            category: mark.subclass_subject.subject.category,
            name: mark.subclass_subject.subject.name,
            coefficient: mark.subclass_subject.coefficient,
            mark: mark.score,
            weightedMark: mark.score * mark.subclass_subject.coefficient,
            rank: (allStudents.map((student) => student.marks.find(m => m.subclass_subject_id === mark.subclass_subject_id)).sort((a, b) => b!.score - a!.score).findIndex((m) => m?.student_subclass.student_id === studentId) + 1)+'th', // Implement actual ranking logic
            teacher: mark.subclass_subject.mainTeacher.name,
            min: 0, // Implement min calculation
            avg: 0, // Implement avg calculation
            max: 0, // Implement max calculation
            successRate: 0, // Implement success rate calculation
            grade: getGrade(mark.score),
        })),
        statistics: {
            overallAverage: currentStudent.overallAverage.toFixed(2),
            rank: `${studentsWithAverages.indexOf(currentStudent) + 1}th`,
            subjectsPassed: enrollment.marks.filter(m => m.score >= 10).length,
            classStats: {
                lowestAverage: Math.min(...studentsWithAverages.map(s => s.overallAverage)).toFixed(2),
                highestAverage: Math.max(...studentsWithAverages.map(s => s.overallAverage)).toFixed(2),
                successRate: (studentsWithAverages.filter(s => s.overallAverage >= 10).length / studentsWithAverages.length) * 100,
                standardDeviation: calculateStandardDeviation(studentsWithAverages.map(s => s.overallAverage)).toFixed(2),
                classAverage: (studentsWithAverages.reduce((sum, s) => sum + s.overallAverage, 0) / studentsWithAverages.length).toFixed(2),
            },
        },
    };

    // 4. Generate PDF
    const template = fs.readFileSync(path.join(__dirname, 'view/report-template.ejs'), 'utf-8');
    const html = ejs.render(template, reportData);

    const browser = await puppeteer.launch();
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

    // 4. Save the PDF to a file
    const filePath = path.join(__dirname, `reports/${studentId}-${academicYearId}-report.pdf`);
    fs.writeFileSync(filePath, pdf);

    console.log(`PDF saved at ${filePath}`);

    return filePath;
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
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    return Math.sqrt(numbers.map(n => Math.pow(n - avg, 2)).reduce((a, b) => a + b) / numbers.length);
}