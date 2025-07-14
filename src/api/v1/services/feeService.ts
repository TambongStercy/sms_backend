// src/api/v1/services/feeService.ts
import prisma, { SchoolFees, PaymentTransaction, PaymentMethod } from '../../../config/db';
import { getAcademicYearId, getStudentSubclassByStudentAndYear } from '../../../utils/academicYear';
import { shouldPayNewStudentFees, getStudentStatus, StudentStatus } from '../../../utils/studentStatus';
import { paginate, PaginationOptions, FilterOptions, PaginatedResult } from '../../../utils/pagination';
import { Parser } from 'json2csv'; // For CSV export
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'; // For PDF export
import { Document, Paragraph, Packer, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx'; // For DOCX export
import fs from 'fs';
import path from 'path';

// Helper for generating CSV
async function generateCSV(data: any[]): Promise<Buffer> {
    const fields = [
        { label: 'Fee ID', value: 'feeId' },
        { label: 'Student Name', value: 'studentName' },
        { label: 'Matricule', value: 'studentMatricule' },
        { label: 'Class', value: 'className' },
        { label: 'Subclass', value: 'subClassName' },
        { label: 'Expected Amount (FCFA)', value: 'expectedAmount' },
        { label: 'Paid Amount (FCFA)', value: 'paidAmount' },
        { label: 'Outstanding (FCFA)', value: 'outstanding' },
        { label: 'Payment %', value: 'paymentPercentage' },
        { label: 'Due Date', value: 'dueDate' },
        { label: 'Payments Count', value: 'paymentsCount' }
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    return Buffer.from(csv);
}

// Helper for generating PDF
async function generatePDF(data: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageMargin = 50;
    const tableStartY = 700;
    const rowHeight = 25;
    const headerHeight = 30;
    const columnPadding = 5;

    const columns = [
        { header: 'Fee ID', key: 'feeId', width: 60, align: AlignmentType.LEFT },
        { header: 'Student Name', key: 'studentName', width: 120, align: AlignmentType.LEFT },
        { header: 'Matricule', key: 'studentMatricule', width: 80, align: AlignmentType.LEFT },
        { header: 'Class', key: 'className', width: 70, align: AlignmentType.LEFT },
        { header: 'Expected (FCFA)', key: 'expectedAmount', width: 80, align: AlignmentType.RIGHT },
        { header: 'Paid (FCFA)', key: 'paidAmount', width: 80, align: AlignmentType.RIGHT },
        { header: 'Outstanding (FCFA)', key: 'outstanding', width: 80, align: AlignmentType.RIGHT },
        { header: 'Due Date', key: 'dueDate', width: 70, align: AlignmentType.LEFT },
    ];

    let page = pdfDoc.addPage();
    let y = tableStartY;

    const drawHeader = () => {
        page.drawText('Fee Report', {
            x: pageMargin,
            y: y + 50,
            font: boldFont,
            size: 20,
            color: rgb(0, 0.53, 0.71),
        });

        y -= headerHeight; // Move Y for table header
        let x = pageMargin;
        for (const col of columns) {
            page.drawRectangle({
                x,
                y,
                width: col.width,
                height: headerHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            page.drawText(col.header, {
                x: x + columnPadding,
                y: y + (headerHeight / 2) - 5, // Center vertically
                font: boldFont,
                size: 9,
                color: rgb(0, 0, 0),
            });
            x += col.width;
        }
        y -= rowHeight; // Move Y for first data row
    };

    drawHeader();

    for (const item of data) {
        if (y < pageMargin + rowHeight) { // Check if new page is needed
            page = pdfDoc.addPage();
            y = tableStartY;
            drawHeader(); // Redraw header on new page
        }

        let x = pageMargin;
        for (const col of columns) {
            page.drawRectangle({
                x,
                y,
                width: col.width,
                height: rowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });
            let text = String(item[col.key]);
            if (col.key === 'expectedAmount' || col.key === 'paidAmount' || col.key === 'outstanding') {
                text = `FCFA ${parseFloat(text).toFixed(2)}`;
            }

            let textX = x + columnPadding;
            if (col.align === AlignmentType.RIGHT) {
                const textWidth = font.widthOfTextAtSize(text, 9);
                textX = x + col.width - textWidth - columnPadding;
            }
            page.drawText(text, {
                x: textX,
                y: y + (rowHeight / 2) - 5,
                font,
                size: 9,
                color: rgb(0, 0, 0),
            });
            x += col.width;
        }
        y -= rowHeight; // Move to the next row
    }

    return Buffer.from(await pdfDoc.save());
}

// Helper for generating DOCX
async function generateDOCX(data: any[]): Promise<Buffer> {
    const tableRows = data.map(item => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(String(item.feeId))] }),
            new TableCell({ children: [new Paragraph(item.studentName)] }),
            new TableCell({ children: [new Paragraph(item.studentMatricule)] }),
            new TableCell({ children: [new Paragraph(item.className)] }),
            new TableCell({ children: [new Paragraph(item.subClassName)] }),
            new TableCell({ children: [new Paragraph(`FCFA ${item.expectedAmount}`)] }),
            new TableCell({ children: [new Paragraph(`FCFA ${item.paidAmount}`)] }),
            new TableCell({ children: [new Paragraph(`FCFA ${item.outstanding}`)] }),
            new TableCell({ children: [new Paragraph(`${item.paymentPercentage}%`)] }),
            new TableCell({ children: [new Paragraph(item.dueDate)] }),
            new TableCell({ children: [new Paragraph(String(item.paymentsCount))] }),
        ],
    }));

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Fee Report',
                            size: 48,
                            bold: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Table({
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('Fee ID')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Student Name')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Matricule')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Class')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Subclass')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Expected Amount')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Paid Amount')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Outstanding')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Payment %')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Due Date')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                                new TableCell({ children: [new Paragraph('Payments Count')], borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 } } }),
                            ],
                        }),
                        ...tableRows,
                    ],
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                }),
            ],
        }],
    });

    return Buffer.from(await Packer.toBuffer(doc));
}


export async function getAllFees(
    paginationOptions?: PaginationOptions,
    filterOptions?: FilterOptions,
    academicYearId?: number
): Promise<PaginatedResult<SchoolFees>> {
    const yearId = await getAcademicYearId(academicYearId);

    const where: any = {};

    if (yearId) {
        where.academic_year_id = yearId;
    }

    if (filterOptions) {
        // Consolidated search by name/ID and new studentIdentifier (name or matricule)
        if (filterOptions.search || filterOptions.studentIdentifier) {
            const searchString = (filterOptions.search || filterOptions.studentIdentifier) as string;
            // The matricule can contain non-numeric characters, so direct parseInt is not sufficient for matricule search.
            // For student name or matricule, 'contains' with insensitive mode is appropriate.
            where.OR = [
                // Search by student name
                {
                    enrollment: {
                        student: {
                            name: { contains: searchString, mode: 'insensitive' }
                        }
                    }
                },
                // Search by student matricule
                {
                    enrollment: {
                        student: {
                            matricule: { contains: searchString, mode: 'insensitive' }
                        }
                    }
                },
                // Search by parent name (existing logic)
                {
                    enrollment: {
                        student: {
                            parents: {
                                some: {
                                    parent: {
                                        name: { contains: searchString, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    }
                }
            ];

            // If searchString is a valid number, also search by student ID (which is an int)
            const searchId = parseInt(searchString, 10);
            if (!isNaN(searchId)) {
                where.OR.push({
                    enrollment: {
                        student_id: searchId
                    }
                });
            }
        }

        // Filter by class name (existing)
        if (filterOptions.className) {
            where.enrollment = {
                ...(where.enrollment || {}),
                sub_class: {
                    ...(where.enrollment?.sub_class || {}),
                    class: {
                        name: { contains: filterOptions.className, mode: 'insensitive' }
                    }
                }
            };
        }

        // Filter by subclass name (existing)
        if (filterOptions.subclassName) {
            where.enrollment = {
                ...(where.enrollment || {}),
                sub_class: {
                    ...(where.enrollment?.sub_class || {}),
                    name: { contains: filterOptions.subclassName, mode: 'insensitive' }
                }
            };
        }

        // New: Filter by class_id
        if (filterOptions.classId) {
            const classId = parseInt(filterOptions.classId as string);
            if (!isNaN(classId)) {
                where.enrollment = {
                    ...(where.enrollment || {}),
                    sub_class: {
                        ...(where.enrollment?.sub_class || {}),
                        class_id: classId
                    }
                };
            }
        }

        // New: Filter by sub_class_id
        if (filterOptions.subClassId) {
            const subClassId = parseInt(filterOptions.subClassId as string);
            if (!isNaN(subClassId)) {
                where.enrollment = {
                    ...(where.enrollment || {}),
                    sub_class_id: subClassId
                };
            }
        }

        // Filter by due date (existing)
        if (filterOptions.dueDate) {
            const dueDate = new Date(filterOptions.dueDate as string);
            if (!isNaN(dueDate.getTime())) {
                where.due_date = { lte: dueDate };
            }
        }

        if (filterOptions.dueBeforeDate) {
            const dueBeforeDate = new Date(filterOptions.dueBeforeDate as string);
            if (!isNaN(dueBeforeDate.getTime())) {
                where.due_date = { lte: dueBeforeDate };
            }
        }

        if (filterOptions.dueAfterDate) {
            const dueAfterDate = new Date(filterOptions.dueAfterDate as string);
            if (!isNaN(dueAfterDate.getTime())) {
                where.due_date = { gte: dueAfterDate };
            }
        }

        // New: Filter by payment status
        if (filterOptions.paymentStatus) {
            const status = (filterOptions.paymentStatus as string).toLowerCase();
            switch (status) {
                case 'paid':
                    break;
                case 'partial':
                    break;
                case 'unpaid':
                    break;
            }
        }
    }

    const include: any = {
        enrollment: {
            include: {
                student: {
                    include: { parents: { include: { parent: true } } }
                },
                sub_class: {
                    include: { class: true }
                }
            }
        },
        academic_year: true,
        payment_transactions: true
    };

    let fees = await prisma.schoolFees.findMany({
        where,
        include,
        orderBy: [
            { enrollment: { sub_class: { class: { name: 'asc' } } } },
            { enrollment: { student: { name: 'asc' } } }
        ],
    });

    // Apply payment status filter after fetching if it requires dynamic comparison
    if (filterOptions?.paymentStatus) {
        const status = (filterOptions.paymentStatus as string).toLowerCase();
        fees = fees.filter(fee => {
            switch (status) {
                case 'paid':
                    return fee.amount_paid >= fee.amount_expected;
                case 'partial':
                    return fee.amount_paid > 0 && fee.amount_paid < fee.amount_expected;
                case 'unpaid':
                    return fee.amount_paid <= 0;
                default:
                    return true; // No filter applied for unknown status
            }
        });
    }

    // Manual pagination if filter applied after fetching (less efficient for large datasets)
    const totalCount = await prisma.schoolFees.count({ where }); // Get total count for pagination metadata
    const paginatedResult: PaginatedResult<SchoolFees> = {
        data: fees,
        meta: {
            total: totalCount,
            totalPages: paginationOptions?.limit ? Math.ceil(totalCount / paginationOptions.limit) : 1,
            page: paginationOptions?.page || 1,
            limit: paginationOptions?.limit || totalCount,
        }
    };

    return paginatedResult;
}

/**
 * Get a specific fee by ID
 * @param id The ID of the fee record
 * @returns The fee record or null if not found
 */
export async function getFeeById(id: number): Promise<SchoolFees | null> {
    return prisma.schoolFees.findUnique({
        where: { id },
        include: {
            enrollment: {
                include: {
                    student: true,
                    sub_class: {
                        include: {
                            class: true
                        }
                    }
                }
            },
            academic_year: true,
            payment_transactions: true
        }
    });
}

export async function createFee(data: {
    amount_expected: number;
    amount_paid: number;
    academic_year_id?: number;
    due_date: string;
    enrollment_id?: number;
    student_id?: number;
    payment_method?: string;
}): Promise<SchoolFees> {
    // Handle the case where student_id is provided instead of enrollment_id
    if (data.student_id && !data.enrollment_id) {
        // Convert student_id to number if it's a string
        const studentId = typeof data.student_id === 'string' ? parseInt(data.student_id, 10) : data.student_id;

        const enrollment = await getStudentSubclassByStudentAndYear(
            studentId,
            data.academic_year_id
        );

        if (!enrollment) {
            throw new Error(`Student with ID ${studentId} is not enrolled in the specified academic year`);
        }

        data.enrollment_id = enrollment.id;
    }

    // Get current academic year if not provided
    if (!data.academic_year_id) {
        data.academic_year_id = await getAcademicYearId() || undefined;
        if (!data.academic_year_id) {
            throw new Error("No academic year found and none provided");
        }
    }

    if (data.payment_method) {
        data.payment_method = normalizePaymentMethod(data.payment_method);
    }

    if (data.amount_paid) {
        data.amount_paid = typeof data.amount_paid === 'string'
            ? parseFloat(data.amount_paid)
            : data.amount_paid;
    }

    // Validate that enrollment exists
    if (!data.enrollment_id) {
        throw new Error("Enrollment ID is required");
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: { id: data.enrollment_id }
    });
    if (!enrollment) {
        throw new Error(`Enrollment with ID ${data.enrollment_id} not found`);
    }

    return prisma.schoolFees.create({
        data: {
            amount_expected: data.amount_expected,
            amount_paid: data.amount_paid,
            academic_year_id: data.academic_year_id,
            due_date: new Date(data.due_date),
            enrollment_id: data.enrollment_id!
        }
    });
}

/**
 * Update an existing fee record
 * @param id The ID of the fee to update
 * @param data The updated fee data
 * @returns The updated fee record
 */
export async function updateFee(
    id: number,
    data: {
        amount_expected?: number;
        amount_paid?: number;
        payment_method?: string;
        due_date?: string;
    }
): Promise<SchoolFees> {
    // First check if the fee exists
    const fee = await prisma.schoolFees.findUnique({
        where: { id }
    });

    if (!fee) {
        throw new Error(`Fee with ID ${id} not found`);
    }

    // Build update data object
    const updateData: any = {};

    if (data.amount_expected !== undefined) {
        updateData.amount_expected = data.amount_expected;
    }

    if (data.amount_paid !== undefined) {
        updateData.amount_paid = data.amount_paid;
    }

    if (data.payment_method !== undefined) {
        updateData.payment_method = normalizePaymentMethod(data.payment_method);
    }

    if (data.due_date !== undefined) {
        updateData.due_date = new Date(data.due_date);
    }

    return prisma.schoolFees.update({
        where: { id },
        data: updateData,
        include: {
            enrollment: {
                include: {
                    student: true,
                    sub_class: {
                        include: { class: true }
                    }
                }
            },
            academic_year: true,
            payment_transactions: true
        }
    });
}

/**
 * Delete an existing fee record
 * @param id The ID of the fee to delete
 * @returns The deleted fee record
 */
export async function deleteFee(id: number): Promise<SchoolFees> {
    // Check if there are any associated payment transactions
    const paymentCount = await prisma.paymentTransaction.count({
        where: { fee_id: id }
    });

    if (paymentCount > 0) {
        throw new Error('Cannot delete fee with existing payment records. Please delete associated payments first.');
    }

    return prisma.schoolFees.delete({
        where: { id }
    });
}

/**
 * Get all fees for a specific student
 * @param studentId The ID of the student
 * @param academicYearId Optional academic year ID
 * @returns Array of fees
 */
export async function getStudentFees(studentId: number, academicYearId?: number): Promise<SchoolFees[]> {
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to fetch student fees, but none was provided or found.");
    }

    return prisma.schoolFees.findMany({
        where: {
            enrollment: {
                student_id: studentId,
                academic_year_id: yearId
            }
        },
        include: {
            enrollment: {
                include: {
                    student: true,
                    sub_class: {
                        include: { class: true }
                    }
                }
            },
            academic_year: true,
            payment_transactions: true
        },
        orderBy: { due_date: 'asc' }
    });
}

/**
 * Get fee summary for a sub_class
 * @param sub_classId The ID of the sub_class
 * @param academicYearId Optional academic year ID
 * @returns Fee summary object
 */
export async function getSubclassFeesSummary(sub_classId: number, academicYearId?: number): Promise<any> {
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to fetch subclass fees summary, but none was provided or found.");
    }

    // Get all fees for students in the specified sub_class for the academic year
    const fees = await prisma.schoolFees.findMany({
        where: {
            academic_year_id: yearId,
            enrollment: {
                sub_class_id: sub_classId
            }
        },
        include: {
            payment_transactions: true
        }
    });

    const totalExpected = fees.reduce((sum, fee) => sum + fee.amount_expected, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amount_paid, 0);
    const outstanding = totalExpected - totalPaid;
    const paymentPercentage = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;

    // Get sub_class and class names for context
    const subClassInfo = await prisma.subClass.findUnique({
        where: { id: sub_classId },
        include: { class: true }
    });

    return {
        subClassId: sub_classId,
        subClassName: subClassInfo?.name || 'N/A',
        className: subClassInfo?.class?.name || 'N/A',
        academicYearId: yearId,
        totalStudentsWithFees: fees.length,
        totalExpected: totalExpected,
        totalPaid: totalPaid,
        outstanding: outstanding,
        paymentPercentage: parseFloat(paymentPercentage.toFixed(2))
    };
}

/**
 * Normalizes payment method string to an enum value
 */
function normalizePaymentMethod(method: string): 'EXPRESS_UNION' | 'CCA' | 'F3DC' {
    const upperMethod = method.toUpperCase();
    if (Object.values(PaymentMethod).includes(upperMethod as PaymentMethod)) {
        return upperMethod as 'EXPRESS_UNION' | 'CCA' | 'F3DC';
    }
    // Default to a known method or throw an error if the method is invalid
    throw new Error(`Invalid payment method: ${method}`);
}

export async function recordPayment(data: {
    amount: number;
    payment_date: string;
    receipt_number?: string;
    payment_method: string;
    enrollment_id?: number;
    student_id?: number;
    academic_year_id?: number;
    fee_id: number;
    recorded_by_id?: number;
}): Promise<PaymentTransaction> {
    // Convert student_id to enrollment_id if student_id is provided
    if (data.student_id && !data.enrollment_id) {
        const studentId = typeof data.student_id === 'string' ? parseInt(data.student_id, 10) : data.student_id;
        const yearId = data.academic_year_id || await getAcademicYearId();
        if (!yearId) {
            throw new Error("Academic year ID is required to find enrollment by student ID, but none was provided or found.");
        }
        const enrollment = await getStudentSubclassByStudentAndYear(studentId, yearId);
        if (!enrollment) {
            throw new Error(`Student with ID ${studentId} not enrolled in academic year ${yearId}`);
        }
        data.enrollment_id = enrollment.id;
    }

    if (!data.enrollment_id) {
        throw new Error('Enrollment ID is required to record a payment.');
    }

    const normalizedPaymentMethod = normalizePaymentMethod(data.payment_method);

    const createData: any = {
        fee_id: data.fee_id,
        amount: data.amount,
        payment_date: new Date(data.payment_date),
        receipt_number: data.receipt_number,
        payment_method: normalizedPaymentMethod,
    };

    if (data.recorded_by_id !== undefined) {
        createData.recorded_by_id = data.recorded_by_id;
    }

    const payment = await prisma.paymentTransaction.create({
        data: createData,
    });

    // Update the amount_paid in the SchoolFees record
    await prisma.schoolFees.update({
        where: { id: data.fee_id },
        data: {
            amount_paid: {
                increment: data.amount // Add the new payment amount to the total paid
            }
        }
    });

    return payment;
}

export async function exportFeeReports(
    academicYearId?: number,
    subClassId?: number,
    classId?: number,
    studentIdentifier?: string,
    paymentStatus?: string,
    format: 'csv' | 'pdf' | 'docx' = 'csv' // Default to CSV
): Promise<{ buffer: Buffer, contentType: string, filename: string }> {
    try {
        const yearId = await getAcademicYearId(academicYearId);

        if (!yearId) {
            throw new Error("No academic year found and none provided");
        }

        // Build where clause based on the new filters
        const where: any = {
            academic_year_id: yearId
        };

        if (subClassId) {
            where.enrollment = {
                ...(where.enrollment || {}),
                sub_class_id: subClassId
            };
        }

        if (classId) {
            where.enrollment = {
                ...(where.enrollment || {}),
                sub_class: {
                    ...(where.enrollment?.sub_class || {}),
                    class_id: classId
                }
            };
        }

        if (studentIdentifier) {
            const searchId = parseInt(studentIdentifier, 10);
            where.enrollment = {
                ...(where.enrollment || {}),
                student: {
                    OR: [
                        { name: { contains: studentIdentifier, mode: 'insensitive' } },
                        { matricule: { contains: studentIdentifier, mode: 'insensitive' } }
                    ]
                }
            };
        }

        // Get all fees for the academic year with filters
        let fees = await prisma.schoolFees.findMany({
            where: where,
            include: {
                enrollment: {
                    include: {
                        student: true,
                        sub_class: {
                            include: {
                                class: true
                            }
                        }
                    }
                },
                academic_year: true,
                payment_transactions: true
            },
            orderBy: [
                { enrollment: { sub_class: { class: { name: 'asc' } } } },
                { enrollment: { student: { name: 'asc' } } }
            ]
        });

        // Apply payment status filter after fetching
        if (paymentStatus) {
            const status = (paymentStatus as string).toLowerCase();
            fees = fees.filter(fee => {
                switch (status) {
                    case 'paid':
                        return fee.amount_paid >= fee.amount_expected;
                    case 'partial':
                        return fee.amount_paid > 0 && fee.amount_paid < fee.amount_expected;
                    case 'unpaid':
                        return fee.amount_paid <= 0;
                    default:
                        return true; // No filter applied for unknown status
                }
            });
        }

        // Map fees to a flatter structure suitable for reports
        const reportData = fees.map(fee => ({
            feeId: fee.id,
            studentName: fee.enrollment.student.name,
            studentMatricule: fee.enrollment.student.matricule,
            className: fee.enrollment.sub_class?.class.name || 'No Class',
            subClassName: fee.enrollment.sub_class?.name || 'No Subclass',
            expectedAmount: parseFloat(fee.amount_expected.toFixed(2)),
            paidAmount: parseFloat(fee.amount_paid.toFixed(2)),
            outstanding: parseFloat((fee.amount_expected - fee.amount_paid).toFixed(2)),
            paymentPercentage: fee.amount_expected > 0 ?
                parseFloat(((fee.amount_paid / fee.amount_expected) * 100).toFixed(2)) : 0,
            dueDate: fee.due_date.toISOString().split('T')[0], // Format date
            paymentsCount: fee.payment_transactions.length
        }));

        let buffer: Buffer;
        let contentType: string;
        let filename: string = `fee_report_${yearId}`;

        switch (format) {
            case 'csv':
                buffer = await generateCSV(reportData);
                contentType = 'text/csv';
                filename += '.csv';
                break;
            case 'pdf':
                buffer = await generatePDF(reportData);
                contentType = 'application/pdf';
                filename += '.pdf';
                break;
            case 'docx':
                buffer = await generateDOCX(reportData);
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                filename += '.docx';
                break;
            default:
                throw new Error('Unsupported format');
        }

        return { buffer, contentType, filename };

    } catch (error: any) {
        console.error('Error in exportFeeReports:', error);
        throw error;
    }
}

/**
 * Retrieves all payment transactions for a specific fee record
 * @param feeId The ID of the fee record
 * @returns Array of payment transactions or null if the fee doesn't exist
 */
export async function getFeePayments(feeId: number): Promise<PaymentTransaction[] | null> {
    // First check if the fee exists
    const feeExists = await prisma.schoolFees.findUnique({
        where: { id: feeId }
    });

    if (!feeExists) {
        return null;
    }

    // Get all payment transactions for this fee
    return prisma.paymentTransaction.findMany({
        where: { fee_id: feeId },
        orderBy: { payment_date: 'desc' }
    });
}

/**
 * Updates all student fees when a class fee structure changes
 * @param classId The ID of the class that had its fee structure updated
 * @param academicYearId Optional academic year ID (defaults to current)
 * @returns The number of updated fee records
 */
export async function updateFeesOnClassFeeChange(classId: number, academicYearId?: number): Promise<number> {
    // Get current academic year if not provided
    const yearId = await getAcademicYearId(academicYearId);

    if (!yearId) {
        throw new Error("Academic year ID is required to update fees, but none was provided or found.");
    }

    // Get the updated class info
    const classInfo = await prisma.class.findUnique({
        where: { id: classId }
    });

    if (!classInfo) {
        throw new Error(`Class with ID ${classId} not found`);
    }

    // Find all enrollments for this class in the given academic year
    const enrollments = await prisma.enrollment.findMany({
        where: {
            academic_year_id: yearId,
            sub_class: {
                class_id: classId
            }
        },
        include: {
            student: true,
            sub_class: true,
            school_fees: {
                where: {
                    academic_year_id: yearId // Ensure we only get fees for this academic year
                }
            }
        }
    });

    console.log(`Found ${enrollments.length} enrollments to update fees for class ${classId}`);

    // Track the number of updates
    let updatedCount = 0;

    // For each enrollment, update or create their fees based on class structure
    for (const enrollment of enrollments) {
        // Calculate the expected fee amount based on class structure
        // This can be customized based on your fee structure logic
        let feeAmount = classInfo.base_fee;

        // Add term-specific fees based on the current term
        const currentTerm = await prisma.term.findFirst({
            where: {
                academic_year_id: yearId,
                start_date: { lte: new Date() },
                end_date: { gte: new Date() }
            }
        });

        if (currentTerm) {
            if (currentTerm.name.toLowerCase().includes('first')) {
                feeAmount += classInfo.first_term_fee;
            } else if (currentTerm.name.toLowerCase().includes('second')) {
                feeAmount += classInfo.second_term_fee;
            } else if (currentTerm.name.toLowerCase().includes('third')) {
                feeAmount += classInfo.third_term_fee;
            }
        }

        // Add miscellaneous fees
        feeAmount += classInfo.miscellaneous_fee;

        // Add extra fees based on student status (new vs old)
        // Use the enhanced student status logic
        const shouldPayNewFees = await shouldPayNewStudentFees(enrollment.student_id, yearId);
        if (shouldPayNewFees) {
            feeAmount += classInfo.new_student_fee;
        } else {
            feeAmount += classInfo.old_student_fee;
        }

        console.log(`Calculated fee amount for student ${enrollment.student.name}: ${feeAmount}`);

        // Check if this enrollment already has fee records for this academic year
        if (enrollment.school_fees.length > 0) {
            // Update existing fee records
            for (const fee of enrollment.school_fees) {
                const updatedFee = await prisma.schoolFees.update({
                    where: { id: fee.id },
                    data: {
                        amount_expected: feeAmount
                    }
                });
                console.log(`Updated fee record ${fee.id} for student ${enrollment.student.name}. New expected amount: ${updatedFee.amount_expected}`);
                updatedCount++;
            }
        } else {
            // Create a new fee record if none exists
            const newFee = await prisma.schoolFees.create({
                data: {
                    enrollment_id: enrollment.id,
                    academic_year_id: yearId,
                    amount_expected: feeAmount,
                    amount_paid: 0,
                    due_date: currentTerm ? currentTerm.fee_deadline || new Date() : new Date()
                }
            });
            console.log(`Created new fee record ${newFee.id} for student ${enrollment.student.name}. Expected amount: ${newFee.amount_expected}`);
            updatedCount++;
        }
    }
    return updatedCount;
}

/**
 * Creates a fee record for a newly enrolled student.
 * This function should be called during the student enrollment process.
 * @param enrollmentId The ID of the new enrollment record.
 * @returns The newly created SchoolFees record.
 */
export async function createFeeForNewEnrollment(enrollmentId: number): Promise<SchoolFees> {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            student: true,
            sub_class: {
                include: { class: true }
            },
            academic_year: true
        }
    });

    if (!enrollment) {
        throw new Error(`Enrollment with ID ${enrollmentId} not found.`);
    }
    if (!enrollment.academic_year_id || !enrollment.sub_class?.class_id) {
        throw new Error('Enrollment must have an academic year and associated class to create fees.');
    }

    const classInfo = await prisma.class.findUnique({
        where: { id: enrollment.sub_class.class_id }
    });

    if (!classInfo) {
        throw new Error(`Class with ID ${enrollment.sub_class.class_id} not found.`);
    }

    // Calculate the expected fee amount based on class structure
    let feeAmount = classInfo.base_fee;

    // Add term-specific fees based on the current term
    const currentTerm = await prisma.term.findFirst({
        where: {
            academic_year_id: enrollment.academic_year_id,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() }
        }
    });

    if (currentTerm) {
        if (currentTerm.name.toLowerCase().includes('first')) {
            feeAmount += classInfo.first_term_fee;
        } else if (currentTerm.name.toLowerCase().includes('second')) {
            feeAmount += classInfo.second_term_fee;
        } else if (currentTerm.name.toLowerCase().includes('third')) {
            feeAmount += classInfo.third_term_fee;
        }
    }

    // Add miscellaneous fees
    feeAmount += classInfo.miscellaneous_fee;

    // Add extra fees based on student status (new vs old)
    const shouldPayNewFees = await shouldPayNewStudentFees(enrollment.student_id, enrollment.academic_year_id);
    if (shouldPayNewFees) {
        feeAmount += classInfo.new_student_fee;
    } else {
        feeAmount += classInfo.old_student_fee;
    }

    return prisma.schoolFees.create({
        data: {
            enrollment_id: enrollment.id,
            academic_year_id: enrollment.academic_year_id,
            amount_expected: feeAmount,
            amount_paid: 0,
            due_date: currentTerm ? currentTerm.fee_deadline || new Date() : new Date()
        }
    });
}
