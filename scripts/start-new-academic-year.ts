/**
 * Start a new academic year with a clean student slate while keeping personnel data.
 *
 * What this script does (when invoked with --confirm):
 *   1. Deletes ALL student-tied data (students, enrollments, parents-student links,
 *      marks, fees, payments, discipline, attendance, generated reports, quiz subs).
 *   2. Marks every existing AcademicYear as not current.
 *   3. Creates the new AcademicYear with three Terms and two ExamSequences per Term.
 *
 * What this script KEEPS (personnel + structural data):
 *   - Users and their roles (User, UserRole, RoleAssignment)
 *   - Classes, SubClasses, Subjects
 *   - Periods, SubClassSubject, SubjectTeacher, TeacherPeriod
 *   - All historical AcademicYears, Terms and ExamSequences (just no longer current)
 *
 * Usage:
 *   ts-node scripts/start-new-academic-year.ts --name 2026-2027 \
 *     --start 2026-09-01 --end 2027-06-30 --confirm
 *
 * Without --confirm the script prints a dry-run summary and exits.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Args {
    name: string;
    start: string;
    end: string;
    confirm: boolean;
    keepData: boolean;
}

function parseArgs(): Args {
    const argv = process.argv.slice(2);
    const get = (flag: string): string | undefined => {
        const idx = argv.indexOf(flag);
        if (idx === -1 || idx === argv.length - 1) return undefined;
        return argv[idx + 1];
    };
    const name = get('--name') || '';
    const start = get('--start') || '';
    const end = get('--end') || '';
    const confirm = argv.includes('--confirm');
    const keepData = argv.includes('--keep-data');

    if (!name || !start || !end) {
        console.error('Usage: ts-node scripts/start-new-academic-year.ts --name <YYYY-YYYY> --start <YYYY-MM-DD> --end <YYYY-MM-DD> [--keep-data] [--confirm]');
        process.exit(1);
    }
    return { name, start, end, confirm, keepData };
}

async function wipeStudentData() {
    console.log('Wiping all student-tied data...');

    // Order matters: delete tables that reference others first.
    const deletions: Array<[string, () => Promise<unknown>]> = [
        ['QuizResponse', () => prisma.quizResponse.deleteMany()],
        ['QuizSubmission', () => prisma.quizSubmission.deleteMany()],
        ['Message', () => prisma.message.deleteMany()],
        ['MobileNotification', () => prisma.mobileNotification.deleteMany()],
        ['GeneratedReport', () => prisma.generatedReport.deleteMany()],
        ['StudentSequenceAverage', () => prisma.studentSequenceAverage.deleteMany()],
        ['Mark', () => prisma.mark.deleteMany()],
        ['SaturdayPunishment', () => prisma.saturdayPunishment.deleteMany()],
        ['DisciplinaryAction', () => prisma.disciplinaryAction.deleteMany()],
        ['BrokenProperty', () => prisma.brokenProperty.deleteMany()],
        ['DisciplineIssue', () => prisma.disciplineIssue.deleteMany()],
        ['StudentAbsence', () => prisma.studentAbsence.deleteMany()],
        ['FeeItemPayment', () => prisma.feeItemPayment.deleteMany()],
        ['Refund', () => prisma.refund.deleteMany()],
        ['PaymentTransaction', () => prisma.paymentTransaction.deleteMany()],
        ['ControlPaymentTransaction', () => prisma.controlPaymentTransaction.deleteMany()],
        ['SchoolFees', () => prisma.schoolFees.deleteMany()],
        ['ControlSchoolFees', () => prisma.controlSchoolFees.deleteMany()],
        ['FeeItem', () => prisma.feeItem.deleteMany()],
        ['Enrollment', () => prisma.enrollment.deleteMany()],
        ['InterviewMark', () => prisma.interviewMark.deleteMany()],
        ['ParentStudent', () => prisma.parentStudent.deleteMany()],
        ['Student', () => prisma.student.deleteMany()],
    ];

    for (const [label, run] of deletions) {
        try {
            const r = await run() as { count?: number };
            console.log(`  ${label}: ${r.count ?? 0} deleted`);
        } catch (e: any) {
            console.warn(`  ${label}: skipped (${e.message})`);
        }
    }

    // After clearing students, the PARENT user role records still exist but reference no
    // student. Caller can decide whether to demote/remove those parents separately; we
    // do NOT delete User rows here because the spec is "leave personnel data".
}

async function createNewAcademicYear(args: Args) {
    console.log(`Creating new academic year ${args.name}...`);

    await prisma.academicYear.updateMany({
        where: { is_current: true },
        data: { is_current: false }
    });

    const startDate = new Date(args.start);
    const endDate = new Date(args.end);

    const year = await prisma.academicYear.create({
        data: {
            name: args.name,
            start_date: startDate,
            end_date: endDate,
            is_current: true,
        }
    });

    // Split the academic year into three terms of roughly equal length.
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const segment = Math.floor(totalDays / 3);
    const t1Start = startDate;
    const t1End = new Date(startDate.getTime() + segment * 86400000);
    const t2Start = new Date(t1End.getTime() + 86400000);
    const t2End = new Date(t1End.getTime() + segment * 86400000);
    const t3Start = new Date(t2End.getTime() + 86400000);
    const t3End = endDate;

    const terms = await Promise.all([
        prisma.term.create({
            data: {
                name: 'First Term',
                start_date: t1Start,
                end_date: t1End,
                academic_year_id: year.id,
                fee_deadline: t1End,
            }
        }),
        prisma.term.create({
            data: {
                name: 'Second Term',
                start_date: t2Start,
                end_date: t2End,
                academic_year_id: year.id,
                fee_deadline: t2End,
            }
        }),
        prisma.term.create({
            data: {
                name: 'Third Term',
                start_date: t3Start,
                end_date: t3End,
                academic_year_id: year.id,
                fee_deadline: t3End,
            }
        }),
    ]);

    for (const term of terms) {
        await prisma.examSequence.createMany({
            data: [
                { sequence_number: 1, academic_year_id: year.id, term_id: term.id, status: 'OPEN' },
                { sequence_number: 2, academic_year_id: year.id, term_id: term.id, status: 'OPEN' },
            ]
        });
    }

    console.log(`Created academic year ${year.name} (id=${year.id}) with 3 terms and 6 exam sequences.`);
    return year;
}

async function main() {
    const args = parseArgs();

    console.log('=== start-new-academic-year ===');
    console.log(`Target year: ${args.name} (${args.start} -> ${args.end})`);

    const [userCount, classCount, subjectCount, studentCount, enrollmentCount] = await Promise.all([
        prisma.user.count(),
        prisma.class.count(),
        prisma.subject.count(),
        prisma.student.count(),
        prisma.enrollment.count(),
    ]);

    console.log('\nCurrent state:');
    console.log(`  Users:        ${userCount}  (kept)`);
    console.log(`  Classes:      ${classCount}  (kept)`);
    console.log(`  Subjects:     ${subjectCount}  (kept)`);
    console.log(`  Students:     ${studentCount}  ${args.keepData ? '(KEPT)' : '(DELETED)'}`);
    console.log(`  Enrollments:  ${enrollmentCount}  ${args.keepData ? '(KEPT)' : '(DELETED)'}`);
    console.log(`  Mode:         ${args.keepData ? 'KEEP existing data — only create new academic year' : 'WIPE student data + create new academic year'}`);

    if (!args.confirm) {
        console.log('\nDry-run. Re-run with --confirm to apply.');
        return;
    }

    if (!args.keepData) {
        await wipeStudentData();
    }
    await createNewAcademicYear(args);

    console.log('\nDone.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
