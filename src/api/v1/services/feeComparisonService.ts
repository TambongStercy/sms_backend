// src/api/v1/services/feeComparisonService.ts
import prisma from '../../../config/db';
import { getAcademicYearId } from '../../../utils/academicYear';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

export interface FeeDiscrepancy {
    studentId: number;
    studentName: string;
    studentMatricule: string;
    className?: string;
    subClassName?: string;
    discrepancyType: 'MISSING_PRIMARY' | 'MISSING_CONTROL' | 'AMOUNT_MISMATCH' | 'PAYMENT_MISMATCH';
    primaryFee?: {
        id: number;
        amountExpected: number;
        amountPaid: number;
        dueDate: string;
    };
    controlFee?: {
        id: number;
        amountExpected: number;
        amountPaid: number;
        dueDate: string;
    };
    expectedAmountDifference?: number;
    paidAmountDifference?: number;
    variancePercentage?: number;
}

export interface ComparisonSummary {
    academicYearId: number;
    totalStudents: number;
    studentsWithBothFees: number;
    studentsWithOnlyPrimaryFees: number;
    studentsWithOnlyControlFees: number;
    totalDiscrepancies: number;
    discrepancyTypes: {
        missingPrimary: number;
        missingControl: number;
        amountMismatch: number;
        paymentMismatch: number;
    };
    averageVariancePercentage: number;
    totalExpectedAmountDifference: number;
    totalPaidAmountDifference: number;
}

/**
 * Compare primary fees with control fees for discrepancies
 * @param academicYearId Optional academic year ID
 * @param subClassId Optional subclass filter
 * @param classId Optional class filter
 * @param studentId Optional student filter
 * @returns Array of fee discrepancies
 */
export async function getFeeDiscrepancies(
    academicYearId?: number,
    subClassId?: number,
    classId?: number,
    studentId?: number
): Promise<FeeDiscrepancy[]> {
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to compare fees, but none was provided or found.");
    }

    // Build where clause for enrollments
    const where: any = {
        academic_year_id: yearId
    };

    if (studentId) {
        where.student_id = studentId;
    }

    if (subClassId) {
        where.sub_class_id = subClassId;
    }

    if (classId) {
        where.sub_class = {
            class_id: classId
        };
    }

    // Get all enrollments for the academic year with their fees
    const enrollments = await prisma.enrollment.findMany({
        where,
        include: {
            student: true,
            sub_class: {
                include: {
                    class: true
                }
            },
            school_fees: {
                where: {
                    academic_year_id: yearId
                }
            },
            control_school_fees: {
                where: {
                    academic_year_id: yearId
                }
            }
        }
    });

    const discrepancies: FeeDiscrepancy[] = [];

    for (const enrollment of enrollments) {
        const primaryFee = enrollment.school_fees[0]; // Assuming one fee record per enrollment per year
        const controlFee = enrollment.control_school_fees[0];

        const baseDiscrepancy = {
            studentId: enrollment.student_id,
            studentName: enrollment.student.name,
            studentMatricule: enrollment.student.matricule,
            className: enrollment.sub_class?.class?.name,
            subClassName: enrollment.sub_class?.name,
        };

        // Case 1: Missing primary fee
        if (!primaryFee && controlFee) {
            discrepancies.push({
                ...baseDiscrepancy,
                discrepancyType: 'MISSING_PRIMARY',
                controlFee: {
                    id: controlFee.id,
                    amountExpected: controlFee.amount_expected,
                    amountPaid: controlFee.amount_paid,
                    dueDate: controlFee.due_date.toISOString().split('T')[0]
                }
            });
        }

        // Case 2: Missing control fee
        else if (primaryFee && !controlFee) {
            discrepancies.push({
                ...baseDiscrepancy,
                discrepancyType: 'MISSING_CONTROL',
                primaryFee: {
                    id: primaryFee.id,
                    amountExpected: primaryFee.amount_expected,
                    amountPaid: primaryFee.amount_paid,
                    dueDate: primaryFee.due_date.toISOString().split('T')[0]
                }
            });
        }

        // Case 3: Both fees exist - check for mismatches
        else if (primaryFee && controlFee) {
            const expectedDifference = primaryFee.amount_expected - controlFee.amount_expected;
            const paidDifference = primaryFee.amount_paid - controlFee.amount_paid;

            const hasAmountMismatch = Math.abs(expectedDifference) > 0.01; // Allow for small floating point differences
            const hasPaymentMismatch = Math.abs(paidDifference) > 0.01;

            if (hasAmountMismatch || hasPaymentMismatch) {
                const variancePercentage = primaryFee.amount_expected > 0
                    ? Math.abs(expectedDifference / primaryFee.amount_expected) * 100
                    : 0;

                discrepancies.push({
                    ...baseDiscrepancy,
                    discrepancyType: hasAmountMismatch ? 'AMOUNT_MISMATCH' : 'PAYMENT_MISMATCH',
                    primaryFee: {
                        id: primaryFee.id,
                        amountExpected: primaryFee.amount_expected,
                        amountPaid: primaryFee.amount_paid,
                        dueDate: primaryFee.due_date.toISOString().split('T')[0]
                    },
                    controlFee: {
                        id: controlFee.id,
                        amountExpected: controlFee.amount_expected,
                        amountPaid: controlFee.amount_paid,
                        dueDate: controlFee.due_date.toISOString().split('T')[0]
                    },
                    expectedAmountDifference: expectedDifference,
                    paidAmountDifference: paidDifference,
                    variancePercentage: parseFloat(variancePercentage.toFixed(2))
                });
            }
        }
    }

    return discrepancies;
}

/**
 * Get comprehensive comparison summary
 * @param academicYearId Optional academic year ID
 * @returns Comparison summary statistics
 */
export async function getComparisonSummary(academicYearId?: number): Promise<ComparisonSummary> {
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to get comparison summary, but none was provided or found.");
    }

    // Get all enrollments for the academic year
    const enrollments = await prisma.enrollment.findMany({
        where: {
            academic_year_id: yearId
        },
        include: {
            school_fees: {
                where: {
                    academic_year_id: yearId
                }
            },
            control_school_fees: {
                where: {
                    academic_year_id: yearId
                }
            }
        }
    });

    const summary: ComparisonSummary = {
        academicYearId: yearId,
        totalStudents: enrollments.length,
        studentsWithBothFees: 0,
        studentsWithOnlyPrimaryFees: 0,
        studentsWithOnlyControlFees: 0,
        totalDiscrepancies: 0,
        discrepancyTypes: {
            missingPrimary: 0,
            missingControl: 0,
            amountMismatch: 0,
            paymentMismatch: 0
        },
        averageVariancePercentage: 0,
        totalExpectedAmountDifference: 0,
        totalPaidAmountDifference: 0
    };

    let totalVariance = 0;
    let varianceCount = 0;

    for (const enrollment of enrollments) {
        const hasPrimaryFee = enrollment.school_fees.length > 0;
        const hasControlFee = enrollment.control_school_fees.length > 0;

        if (hasPrimaryFee && hasControlFee) {
            summary.studentsWithBothFees++;

            const primaryFee = enrollment.school_fees[0];
            const controlFee = enrollment.control_school_fees[0];

            const expectedDifference = primaryFee.amount_expected - controlFee.amount_expected;
            const paidDifference = primaryFee.amount_paid - controlFee.amount_paid;

            const hasAmountMismatch = Math.abs(expectedDifference) > 0.01;
            const hasPaymentMismatch = Math.abs(paidDifference) > 0.01;

            if (hasAmountMismatch || hasPaymentMismatch) {
                summary.totalDiscrepancies++;

                if (hasAmountMismatch) {
                    summary.discrepancyTypes.amountMismatch++;
                    summary.totalExpectedAmountDifference += Math.abs(expectedDifference);
                }

                if (hasPaymentMismatch) {
                    summary.discrepancyTypes.paymentMismatch++;
                    summary.totalPaidAmountDifference += Math.abs(paidDifference);
                }

                // Calculate variance percentage
                if (primaryFee.amount_expected > 0) {
                    const variance = Math.abs(expectedDifference / primaryFee.amount_expected) * 100;
                    totalVariance += variance;
                    varianceCount++;
                }
            }
        } else if (hasPrimaryFee && !hasControlFee) {
            summary.studentsWithOnlyPrimaryFees++;
            summary.totalDiscrepancies++;
            summary.discrepancyTypes.missingControl++;
        } else if (!hasPrimaryFee && hasControlFee) {
            summary.studentsWithOnlyControlFees++;
            summary.totalDiscrepancies++;
            summary.discrepancyTypes.missingPrimary++;
        }
    }

    // Calculate average variance percentage
    summary.averageVariancePercentage = varianceCount > 0
        ? parseFloat((totalVariance / varianceCount).toFixed(2))
        : 0;

    return summary;
}

/**
 * Get fee comparison for a specific student
 * @param studentId The ID of the student
 * @param academicYearId Optional academic year ID
 * @returns Student-specific fee comparison
 */
export async function getStudentFeeComparison(studentId: number, academicYearId?: number) {
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to compare student fees, but none was provided or found.");
    }

    const enrollment = await prisma.enrollment.findFirst({
        where: {
            student_id: studentId,
            academic_year_id: yearId
        },
        include: {
            student: true,
            sub_class: {
                include: {
                    class: true
                }
            },
            school_fees: {
                where: {
                    academic_year_id: yearId
                },
                include: {
                    payment_transactions: true
                }
            },
            control_school_fees: {
                where: {
                    academic_year_id: yearId
                },
                include: {
                    control_payment_transactions: true
                }
            }
        }
    });

    if (!enrollment) {
        throw new Error(`Student with ID ${studentId} is not enrolled in academic year ${yearId}`);
    }

    const primaryFee = enrollment.school_fees[0];
    const controlFee = enrollment.control_school_fees[0];

    return {
        student: {
            id: enrollment.student.id,
            name: enrollment.student.name,
            matricule: enrollment.student.matricule
        },
        class: {
            name: enrollment.sub_class?.class?.name,
            subClassName: enrollment.sub_class?.name
        },
        academicYearId: yearId,
        primaryFee: primaryFee ? {
            id: primaryFee.id,
            amountExpected: primaryFee.amount_expected,
            amountPaid: primaryFee.amount_paid,
            dueDate: primaryFee.due_date,
            paymentsCount: primaryFee.payment_transactions.length,
            payments: primaryFee.payment_transactions
        } : null,
        controlFee: controlFee ? {
            id: controlFee.id,
            amountExpected: controlFee.amount_expected,
            amountPaid: controlFee.amount_paid,
            dueDate: controlFee.due_date,
            paymentsCount: controlFee.control_payment_transactions.length,
            payments: controlFee.control_payment_transactions
        } : null,
        hasDiscrepancy: primaryFee && controlFee ?
            (Math.abs(primaryFee.amount_expected - controlFee.amount_expected) > 0.01 ||
             Math.abs(primaryFee.amount_paid - controlFee.amount_paid) > 0.01) :
            (!primaryFee || !controlFee),
        discrepancyDetails: primaryFee && controlFee ? {
            expectedAmountDifference: primaryFee.amount_expected - controlFee.amount_expected,
            paidAmountDifference: primaryFee.amount_paid - controlFee.amount_paid,
            variancePercentage: primaryFee.amount_expected > 0
                ? Math.abs((primaryFee.amount_expected - controlFee.amount_expected) / primaryFee.amount_expected) * 100
                : 0
        } : null
    };
}

/**
 * Export fee discrepancy reports
 * @param academicYearId Optional academic year ID
 * @param format Export format
 * @returns Export buffer and metadata
 */
export async function exportDiscrepancyReports(
    academicYearId?: number,
    format: 'csv' | 'xlsx' = 'csv'
): Promise<{ buffer: Buffer, contentType: string, filename: string }> {
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("No academic year found and none provided");
    }

    const discrepancies = await getFeeDiscrepancies(yearId);

    // Map discrepancies to a flatter structure suitable for reports
    const reportData = discrepancies.map(discrepancy => ({
        studentName: discrepancy.studentName,
        studentMatricule: discrepancy.studentMatricule,
        className: discrepancy.className || 'N/A',
        subClassName: discrepancy.subClassName || 'N/A',
        discrepancyType: discrepancy.discrepancyType,
        primaryExpected: discrepancy.primaryFee?.amountExpected || 0,
        primaryPaid: discrepancy.primaryFee?.amountPaid || 0,
        controlExpected: discrepancy.controlFee?.amountExpected || 0,
        controlPaid: discrepancy.controlFee?.amountPaid || 0,
        expectedDifference: discrepancy.expectedAmountDifference || 0,
        paidDifference: discrepancy.paidAmountDifference || 0,
        variancePercentage: discrepancy.variancePercentage || 0
    }));

    let buffer: Buffer;
    let contentType: string;
    let filename: string = `fee_discrepancy_report_${yearId}`;

    if (format === 'csv') {
        const fields = [
            { label: 'Student Name', value: 'studentName' },
            { label: 'Matricule', value: 'studentMatricule' },
            { label: 'Class', value: 'className' },
            { label: 'Subclass', value: 'subClassName' },
            { label: 'Discrepancy Type', value: 'discrepancyType' },
            { label: 'Primary Expected (FCFA)', value: 'primaryExpected' },
            { label: 'Primary Paid (FCFA)', value: 'primaryPaid' },
            { label: 'Control Expected (FCFA)', value: 'controlExpected' },
            { label: 'Control Paid (FCFA)', value: 'controlPaid' },
            { label: 'Expected Difference (FCFA)', value: 'expectedDifference' },
            { label: 'Paid Difference (FCFA)', value: 'paidDifference' },
            { label: 'Variance %', value: 'variancePercentage' }
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);
        buffer = Buffer.from(csv);
        contentType = 'text/csv';
        filename += '.csv';
    } else {
        // Excel format
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(reportData, {
            header: ['studentName', 'studentMatricule', 'className', 'subClassName', 'discrepancyType',
                    'primaryExpected', 'primaryPaid', 'controlExpected', 'controlPaid',
                    'expectedDifference', 'paidDifference', 'variancePercentage']
        });

        // Set column headers
        const headers = [
            'Student Name', 'Matricule', 'Class', 'Subclass', 'Discrepancy Type',
            'Primary Expected (FCFA)', 'Primary Paid (FCFA)', 'Control Expected (FCFA)', 'Control Paid (FCFA)',
            'Expected Difference (FCFA)', 'Paid Difference (FCFA)', 'Variance %'
        ];

        headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].v = header;
        });

        worksheet['!cols'] = Array(headers.length).fill({ wch: 15 });
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Discrepancies');
        buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename += '.xlsx';
    }

    return { buffer, contentType, filename };
}