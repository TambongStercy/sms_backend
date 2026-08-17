/**
 * The retrieval corpus for the assistant.
 *
 * The database has 89 tables. Handing all of them to a 4B model on a 4 GB card
 * would blow the context and slow generation to a crawl, and most of a school's
 * questions touch a handful of tables. So each entry below describes one table
 * in the terms a question would use, and the retriever picks the few that match
 * before anything reaches the model.
 *
 * `keywords` is what the retriever scores against — it should read like the
 * words a bursar or principal would actually type, not like column names.
 * `columns` is what the model is shown, and is deliberately a subset: listing
 * every column invites the model to select things nobody asked for.
 */

export interface CatalogEntry {
    table: string;
    description: string;
    columns: string;
    keywords: string[];
    joins?: string;
}

export const SCHEMA_CATALOG: CatalogEntry[] = [
    {
        table: 'Student',
        description: 'One row per student ever registered. Not scoped to a year — a student stays here after leaving, so counts of "current" students must go through Enrollment.',
        columns: 'id, name, matricule, date_of_birth, place_of_birth, gender, residence, former_school, status, first_enrollment_year_id, admission_academic_year_id, created_at',
        keywords: ['student', 'students', 'pupil', 'pupils', 'child', 'children', 'learner', 'matricule', 'gender', 'boy', 'girl', 'male', 'female', 'age', 'born', 'birth'],
        joins: 'Enrollment.student_id = Student.id',
    },
    {
        table: 'Enrollment',
        description: 'Links a student to a class and subclass for one academic year. This is the table that answers "how many students are in X" — one row per student per year.',
        columns: 'id, student_id, class_id, sub_class_id, academic_year_id, repeater, photo, created_at',
        keywords: ['enrolled', 'enrolment', 'enrollment', 'in class', 'in form', 'how many students', 'class size', 'repeater', 'repeating', 'roll', 'registered'],
        joins: 'Enrollment.class_id = Class.id, Enrollment.sub_class_id = SubClass.id, Enrollment.student_id = Student.id, Enrollment.academic_year_id = AcademicYear.id',
    },
    {
        table: 'Class',
        description: 'A year group such as FORM 1 or LOWER SIXTH ARTS. Names are upper case.',
        columns: 'id, name, level, base_fee, new_student_fee, old_student_fee, first_term_fee, second_term_fee, third_term_fee, academic_year_id',
        keywords: ['class', 'classes', 'form', 'form 1', 'form 2', 'form 3', 'form 4', 'form 5', 'sixth', 'lower sixth', 'upper sixth', 'arts', 'science', 'level', 'year group'],
        joins: 'SubClass.class_id = Class.id',
    },
    {
        table: 'SubClass',
        description: 'A stream within a class, e.g. FORM 1 N or FORM 1 MS. Each belongs to exactly one Class.',
        columns: 'id, name, class_id, class_master_id',
        keywords: ['subclass', 'sub class', 'stream', 'section', 'arm', 'class master'],
        joins: 'SubClass.class_id = Class.id',
    },
    {
        table: 'SchoolFees',
        description: 'The fee owed by one enrolment for one year: amount_expected against amount_paid. Outstanding balance is amount_expected - amount_paid; a student "owes" when that is greater than zero.',
        columns: 'id, amount_expected, amount_paid, academic_year_id, enrollment_id, due_date, created_at',
        keywords: ['fee', 'fees', 'owing', 'owe', 'owes', 'debt', 'debtor', 'balance', 'outstanding', 'unpaid', 'arrears', 'paid', 'expected', 'due', 'school fees'],
        joins: 'SchoolFees.enrollment_id = Enrollment.id',
    },
    {
        table: 'PaymentTransaction',
        description: 'An individual payment against a fee record. Sum these for revenue collected over a period.',
        columns: 'id, enrollment_id, academic_year_id, amount, payment_date, receipt_number, payment_method, fee_id, recorded_by_id',
        keywords: ['payment', 'payments', 'paid', 'collected', 'revenue', 'income', 'receipt', 'transaction', 'cash', 'momo', 'mobile money', 'bank', 'today', 'this month'],
        joins: 'PaymentTransaction.enrollment_id = Enrollment.id',
    },
    {
        table: 'User',
        description: 'Every person with a login: teachers, bursars, principals, parents. Role is held in UserRole, not here. The password column is not readable.',
        columns: 'id, name, gender, date_of_birth, phone, whatsapp_number, address, email, matricule, status, total_hours_per_week, created_at',
        keywords: ['user', 'users', 'staff', 'teacher', 'teachers', 'personnel', 'employee', 'bursar', 'principal', 'parent', 'parents', 'account'],
        joins: 'UserRole.user_id = User.id',
    },
    {
        table: 'UserRole',
        description: 'Which roles a user holds, optionally scoped to an academic year. Role values include SUPER_MANAGER, PRINCIPAL, VICE_PRINCIPAL, TEACHER, BURSAR, PARENT, DISCIPLINE_MASTER, GUIDANCE_COUNSELOR, HOD, MANAGER.',
        columns: 'id, user_id, role, academic_year_id',
        keywords: ['role', 'roles', 'teacher', 'teachers', 'bursar', 'principal', 'parent', 'staff count', 'how many teachers', 'permission'],
        joins: 'UserRole.user_id = User.id',
    },
    {
        table: 'AcademicYear',
        description: 'A school year. is_current marks the active one — year-scoped questions should filter on it unless a specific year is named.',
        columns: 'id, name, start_date, end_date, is_current, report_deadline',
        keywords: ['academic year', 'year', 'current year', 'session', 'term dates'],
    },
    {
        table: 'Subject',
        description: 'A taught subject, with its category.',
        columns: 'id, name, category, hod_id',
        keywords: ['subject', 'subjects', 'course', 'discipline', 'hod', 'head of department'],
        joins: 'SubClassSubject.subject_id = Subject.id',
    },
    {
        table: 'Mark',
        description: 'A score for one enrolment, in one subject, for one exam sequence.',
        columns: 'id, enrollment_id, sub_class_subject_id, exam_sequence_id, score, teacher_id',
        keywords: ['mark', 'marks', 'score', 'scores', 'grade', 'grades', 'result', 'results', 'average', 'exam', 'performance', 'pass', 'fail'],
        joins: 'Mark.enrollment_id = Enrollment.id, Mark.exam_sequence_id = ExamSequence.id',
    },
    {
        table: 'StudentAbsence',
        description: 'A recorded student absence.',
        columns: 'id, enrollment_id, assigned_by_id, absence_type, created_at',
        keywords: ['absent', 'absence', 'absences', 'attendance', 'missed', 'away', 'truant'],
        joins: 'StudentAbsence.enrollment_id = Enrollment.id',
    },
    {
        table: 'DisciplineIssue',
        description: 'A disciplinary incident logged against an enrolment.',
        columns: 'id, enrollment_id, issue_type, description, notes, assigned_by_id, reviewed_by_id, created_at',
        keywords: ['discipline', 'disciplinary', 'issue', 'incident', 'misconduct', 'behaviour', 'behavior', 'punishment', 'offence'],
        joins: 'DisciplineIssue.enrollment_id = Enrollment.id',
    },
    {
        table: 'ExamSequence',
        description: 'One evaluation period (a sequence) inside a term.',
        columns: 'id, sequence_number, term_id, academic_year_id, status, start_date, end_date',
        keywords: ['sequence', 'exam', 'evaluation', 'assessment', 'test'],
        joins: 'ExamSequence.term_id = Term.id',
    },
    {
        table: 'Term',
        description: 'A term within an academic year.',
        columns: 'id, name, start_date, end_date, academic_year_id, fee_deadline',
        keywords: ['term', 'terms', 'first term', 'second term', 'third term', 'semester'],
    },
];

/** Tables the assistant is permitted to name. Anything else is rejected. */
export const ALLOWED_TABLES: ReadonlySet<string> = new Set(
    SCHEMA_CATALOG.map(e => e.table)
);

/** Renders the retrieved subset into the block shown to the model. */
export function renderSchema(entries: CatalogEntry[]): string {
    return entries
        .map(e => {
            const lines = [
                `TABLE "${e.table}"`,
                `  purpose: ${e.description}`,
                `  columns: ${e.columns}`,
            ];
            if (e.joins) lines.push(`  joins:   ${e.joins}`);
            return lines.join('\n');
        })
        .join('\n\n');
}
