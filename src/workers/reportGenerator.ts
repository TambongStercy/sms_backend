import { Job } from 'bullmq';
import path from 'path';
import fs from 'fs';
import prisma from '../config/db';
import { getWorker, reportGenerationQueueName } from '../config/queue';
import * as reportService from '../api/v1/services/reportService';
import { ReportStatus, ReportType, Enrollment, ExamSequenceStatus } from '@prisma/client';

/**
 * Creates the directory structure for storing reports if it doesn't exist.
 * Example path: src/reports/generated/2024-2025/seq-5/subclass-10/student-123.pdf
 */
const ensureDirectoryExists = (filePath: string) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
        console.log(`Created directory: ${dirname}`);
    }
};

/**
 * Processes a report generation job (now primarily SUBCLASS type).
 */
const processReportJob = async (job: Job) => {
    const { generatedReportId, reportType, studentId, subClassId, academicYearId, examSequenceId } = job.data;
    console.log(`Processing report job ${job.id} (${reportType}) for GeneratedReport ID: ${generatedReportId}`);

    let generatedFilePath: string | null = null;

    try {
        // Mark the report record as PROCESSING
        await prisma.generatedReport.update({
            where: { id: generatedReportId },
            data: { status: ReportStatus.PROCESSING, error_message: null },
        });

        // Determine the final save path
        const basePath = path.join(process.cwd(), 'src', 'reports', 'generated');
        const academicYear = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } });
        const yearFolderName = academicYear?.name?.replace(/\//g, '-') || `year-${academicYearId}`;
        const sequenceFolderName = `seq-${examSequenceId}`;

        if (reportType === ReportType.SUBCLASS && subClassId) {
            const subClassInfo = await prisma.subClass.findUnique({ where: { id: subClassId }, select: { name: true, class: { select: { name: true } } } });
            const subClassFolderName = `subclass-${subClassInfo?.class?.name || ''}-${subClassInfo?.name || subClassId}`.replace(/\s+/g, '-');
            const subclassFileName = `Subclass-${subClassId}-Seq-${examSequenceId}-Report.pdf`;
            const finalSavePath = path.join(basePath, yearFolderName, sequenceFolderName, subClassFolderName, subclassFileName);
            ensureDirectoryExists(finalSavePath);

            console.log(`[Job ${job.id}] Generating combined subclass PDF at: ${finalSavePath}`);
            generatedFilePath = await reportService.generateAndSaveSubclassPdf(subClassId, academicYearId, examSequenceId, finalSavePath);

            if (!generatedFilePath || !fs.existsSync(generatedFilePath)) {
                throw new Error('Subclass PDF generation failed or file not found.');
            }

            const relativeFilePath = path.relative(process.cwd(), generatedFilePath);
            await updateSubclassAndStudentRecords(generatedReportId, relativeFilePath, subClassId, academicYearId, examSequenceId);

        } else if (reportType === ReportType.SINGLE_STUDENT && studentId) {
            const studentInfo = await prisma.student.findUnique({ where: { id: studentId }, select: { name: true, matricule: true } });
            const studentFileName = `Student-${studentInfo?.matricule || studentId}-Seq-${examSequenceId}-Report.pdf`;
            const finalSavePath = path.join(basePath, yearFolderName, sequenceFolderName, 'students', studentFileName);
            ensureDirectoryExists(finalSavePath);

            console.log(`[Job ${job.id}] Generating single student PDF at: ${finalSavePath}`);
            generatedFilePath = await reportService.generateAndSaveSingleStudentPdf(studentId, academicYearId, examSequenceId, finalSavePath);

            if (!generatedFilePath || !fs.existsSync(generatedFilePath)) {
                throw new Error('Single student PDF generation failed or file not found.');
            }

            const relativeFilePath = path.relative(process.cwd(), generatedFilePath);
            await prisma.generatedReport.update({
                where: { id: generatedReportId },
                data: {
                    status: ReportStatus.COMPLETED,
                    file_path: relativeFilePath,
                    page_number: 1,
                    error_message: null,
                },
            });
            console.log(`[Job ${job.id}] Successfully processed SINGLE_STUDENT report job. PDF saved at: ${relativeFilePath}`);

        } else {
            throw new Error(`Invalid job type (${reportType}) or missing required IDs (studentId/subClassId).`);
        }

    } catch (error: any) {
        console.error(`[Job ${job.id}] Error processing report job (GeneratedReport ID: ${generatedReportId}):`, error);
        await prisma.generatedReport.update({
            where: { id: generatedReportId },
            data: { status: ReportStatus.FAILED, error_message: error.message || 'Unknown error during report generation' },
        });
        if (generatedFilePath && fs.existsSync(generatedFilePath)) {
            try { fs.unlinkSync(generatedFilePath); } catch (e) { console.error(`Failed to delete partial file ${generatedFilePath}`); }
        }
        throw error;
    }
};

async function updateSubclassAndStudentRecords(
    subclassReportId: number,
    filePath: string,
    subClassId: number,
    academicYearId: number,
    examSequenceId: number
) {
    await prisma.generatedReport.update({
        where: { id: subclassReportId },
        data: { status: ReportStatus.COMPLETED, file_path: filePath, error_message: null },
    });

    const processedEnrollments = await prisma.enrollment.findMany({
        where: {
            sub_class_id: subClassId,
            academic_year_id: academicYearId,
            marks: { some: { exam_sequence_id: examSequenceId } }
        },
        select: { student_id: true },
        orderBy: { student: { name: 'asc' } }
    });

    const studentUpdatePromises = processedEnrollments.map((enrollment, index) =>
        prisma.generatedReport.upsert({
            where: {
                report_type_exam_sequence_id_academic_year_id_student_id: {
                    report_type: ReportType.SINGLE_STUDENT,
                    exam_sequence_id: examSequenceId,
                    academic_year_id: academicYearId,
                    student_id: enrollment.student_id,
                }
            },
            update: {
                status: ReportStatus.COMPLETED,
                file_path: filePath,
                page_number: index + 1,
                error_message: null,
                sub_class_id: subClassId,
            },
            create: {
                report_type: ReportType.SINGLE_STUDENT,
                exam_sequence_id: examSequenceId,
                academic_year_id: academicYearId,
                student_id: enrollment.student_id,
                sub_class_id: subClassId,
                status: ReportStatus.COMPLETED,
                file_path: filePath,
                page_number: index + 1,
            },
        })
    );

    const allSubclassEnrollments = await prisma.enrollment.findMany({
        where: { sub_class_id: subClassId, academic_year_id: academicYearId },
        select: { student_id: true }
    });
    const processedStudentIds = new Set(processedEnrollments.map(e => e.student_id));
    const studentsWithoutMarks = allSubclassEnrollments.filter(e => !processedStudentIds.has(e.student_id));

    const failedUpdatePromises = studentsWithoutMarks.map(enrollment =>
        prisma.generatedReport.upsert({
            where: {
                report_type_exam_sequence_id_academic_year_id_student_id: {
                    report_type: ReportType.SINGLE_STUDENT,
                    exam_sequence_id: examSequenceId,
                    academic_year_id: academicYearId,
                    student_id: enrollment.student_id,
                }
            },
            update: {
                status: ReportStatus.FAILED,
                error_message: "Student had no marks for this sequence.",
                file_path: null,
                page_number: null,
                sub_class_id: subClassId,
            },
            create: {
                report_type: ReportType.SINGLE_STUDENT,
                exam_sequence_id: examSequenceId,
                academic_year_id: academicYearId,
                student_id: enrollment.student_id,
                sub_class_id: subClassId,
                status: ReportStatus.FAILED,
                error_message: "Student had no marks for this sequence.",
            },
        })
    );

    await Promise.all([...studentUpdatePromises, ...failedUpdatePromises]);
    console.log(`Updated ${processedEnrollments.length} successful and ${studentsWithoutMarks.length} failed student report records for subclass ${subClassId}.`);
}


// --- Helper Function to Update ExamSequence Status ---

/**
 * Checks the status of all SUBCLASS report jobs for a given ExamSequence
 * and updates the ExamSequence status accordingly.
 */
async function checkAndUpdateSequenceStatus(examSequenceId: number): Promise<void> {
    console.log(`[Sequence ${examSequenceId}] Checking overall report generation status...`);
    try {
        const sequenceReports = await prisma.generatedReport.findMany({
            where: {
                exam_sequence_id: examSequenceId,
                report_type: ReportType.SUBCLASS, // Check status of the combined subclass jobs
            },
            select: { status: true },
        });

        if (sequenceReports.length === 0) {
            // This case might happen if the sequence finalization failed before jobs were added
            // or if there were no subclasses with marks. The sequence might already be AVAILABLE/FAILED.
            console.log(`[Sequence ${examSequenceId}] No SUBCLASS report records found. Status check inconclusive.`);
            // Optionally, double-check sequence status here if needed.
            return;
        }

        const hasFailed = sequenceReports.some(r => r.status === ReportStatus.FAILED);
        const allCompleted = sequenceReports.every(r => r.status === ReportStatus.COMPLETED);
        const anyProcessing = sequenceReports.some(r => r.status === ReportStatus.PENDING || r.status === ReportStatus.PROCESSING);

        let finalStatus: ExamSequenceStatus | null = null;

        if (hasFailed) {
            finalStatus = ExamSequenceStatus.REPORTS_FAILED;
        } else if (allCompleted) {
            finalStatus = ExamSequenceStatus.REPORTS_AVAILABLE;
        } else if (anyProcessing) {
            finalStatus = ExamSequenceStatus.REPORTS_GENERATING; // Still processing
        } else {
            // Should ideally not happen if all statuses are covered
            console.warn(`[Sequence ${examSequenceId}] Unexpected combination of report statuses. Defaulting to REPORTS_GENERATING.`);
            finalStatus = ExamSequenceStatus.REPORTS_GENERATING;
        }

        // Get current sequence status to avoid redundant updates
        const currentSequence = await prisma.examSequence.findUnique({
            where: { id: examSequenceId },
            select: { status: true },
        });

        if (currentSequence && currentSequence.status !== finalStatus) {
            await prisma.examSequence.update({
                where: { id: examSequenceId },
                data: { status: finalStatus },
            });
            console.log(`[Sequence ${examSequenceId}] Status updated to ${finalStatus}.`);
        } else if (currentSequence) {
            console.log(`[Sequence ${examSequenceId}] Status already ${currentSequence.status}. No update needed.`);
        } else {
            console.error(`[Sequence ${examSequenceId}] Could not find ExamSequence to update status.`);
        }

    } catch (error) {
        console.error(`[Sequence ${examSequenceId}] Error checking/updating sequence status:`, error);
    }
}

// --- Worker Initialization ---
console.log(`Initializing report generation worker...`);
const worker = getWorker(reportGenerationQueueName, processReportJob);

worker.on('completed', async (job: Job) => {
    console.log(`Job ${job.id} (GeneratedReport ID: ${job.data.generatedReportId}) completed successfully.`);
    // When a subclass job completes, check if all jobs for the sequence are done.
    if (job.data.reportType === ReportType.SUBCLASS && job.data.examSequenceId) {
        await checkAndUpdateSequenceStatus(job.data.examSequenceId);
    }
});

worker.on('failed', async (job: Job | undefined, err: Error) => {
    if (job) {
        console.error(`Job ${job.id} (GeneratedReport ID: ${job.data.generatedReportId}) failed after ${job.attemptsMade} attempts with error: ${err.message}`);
        // If a subclass job fails definitively, mark the whole sequence as failed.
        if (job.data.reportType === ReportType.SUBCLASS && job.data.examSequenceId) {
            console.log(`[Sequence ${job.data.examSequenceId}] Marking sequence as REPORTS_FAILED due to job failure.`);
            try {
                await prisma.examSequence.update({
                    where: { id: job.data.examSequenceId },
                    // Only update if it's not already failed (to avoid race conditions)
                    data: { status: ExamSequenceStatus.REPORTS_FAILED },
                });
                // Optionally call checkAndUpdateSequenceStatus here too for consistency, though it should result in FAILED.
                // await checkAndUpdateSequenceStatus(job.data.examSequenceId);
            } catch (updateError) {
                console.error(`[Sequence ${job.data.examSequenceId}] Error updating sequence status to FAILED:`, updateError);
            }
        }
    } else {
        console.error(`A job failed without job data: ${err.message}`, err);
    }
});

console.log(`Report generation worker listening for jobs on queue "${reportGenerationQueueName}".`); 