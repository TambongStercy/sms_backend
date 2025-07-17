import { Sequelize, QueryTypes } from 'sequelize';

// Initialize Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    logging: false,
});

// Helper to fetch subclass/class/class_master/academic_year info
async function getSubclassContext(subClassId: number, academicYearId: number) {
    const [result] = await sequelize.query(
        `SELECT sc.id as sub_class_id, sc.name as sub_class_name, scs.id as sub_class_subject_id, 
                c.id as class_id, c.name as class_name, 
                u.id as class_master_id, u.name as class_master_name, 
                ay.id as academic_year_id, ay.start_date, ay.end_date
         FROM "SubClass" sc
         JOIN "Class" c ON sc.class_id = c.id
         LEFT JOIN "User" u ON sc.class_master_id = u.id
         JOIN "AcademicYear" ay ON ay.id = :academicYearId
         LEFT JOIN "SubClassSubject" scs ON scs.sub_class_id = sc.id
         WHERE sc.id = :subClassId
         LIMIT 1`,
        {
            replacements: { subClassId, academicYearId },
            type: QueryTypes.SELECT,
        }
    );
    return result;
}

// Define a type for the mark rows (minimal, can be extended)
interface MarkRow {
    student_id: number;
    student_name: string;
    matricule: string;
    gender: string;
    date_of_birth: string;
    place_of_birth: string;
    enrollment_id: number;
    sub_class_id: number;
    academic_year_id: number;
    repeater: boolean;
    photo: string | null;
    mark_id: number;
    score: number;
    sub_class_subject_id: number;
    exam_sequence_id: number;
    subject_name: string;
    category: string;
    coefficient: number;
    teacher_name: string;
}

interface SubjectDetailsRow {
    sub_class_subject_id: number;
    subject_name: string;
    category: string;
    coefficient: number;
    teacher_name: string;
    subject_id: number;
    teacher_id: number;
}

export async function getAllSubjectsForSubclass(subClassId: number): Promise<SubjectDetailsRow[]> {
    const subjects = await sequelize.query<SubjectDetailsRow>(
        `SELECT
            scs.id AS sub_class_subject_id,
            s.name AS subject_name,
            s.category,
            scs.coefficient,
            u.name AS teacher_name,
            s.id AS subject_id,
            st.teacher_id AS teacher_id
         FROM "SubClassSubject" scs
         JOIN "Subject" s ON scs.subject_id = s.id
         LEFT JOIN "SubjectTeacher" st ON st.subject_id = s.id
         LEFT JOIN "User" u ON st.teacher_id = u.id
         WHERE scs.sub_class_id = :subClassId
         ORDER BY s.name ASC
        `,
        {
            replacements: { subClassId },
            type: QueryTypes.SELECT,
        }
    ) as SubjectDetailsRow[];

    return subjects;
}

export async function getStudentReportCardData(studentId: number, academicYearId: number, examSequenceId: number): Promise<{ marks: MarkRow[]; context: any }> {
    // Fetch marks and related info
    const marks = await sequelize.query<MarkRow>(
        `SELECT s.id as student_id, s.name as student_name, s.matricule, s.gender, s.date_of_birth, s.place_of_birth,
           e.id as enrollment_id, e.sub_class_id, e.academic_year_id, e.repeater, e.photo,
           m.id as mark_id, m.score, m.sub_class_subject_id, m.exam_sequence_id,
           subj.name as subject_name, subj.category, scs.coefficient,
           t.name as teacher_name
    FROM "Student" s
    JOIN "Enrollment" e ON e.student_id = s.id
    JOIN "Mark" m ON m.enrollment_id = e.id
    JOIN "SubClassSubject" scs ON scs.id = m.sub_class_subject_id
    JOIN "Subject" subj ON subj.id = scs.subject_id
    JOIN "User" t ON t.id = m.teacher_id
    WHERE s.id = :studentId
      AND e.academic_year_id = :academicYearId
      AND m.exam_sequence_id = :examSequenceId
    `,
        {
            replacements: { studentId, academicYearId, examSequenceId },
            type: QueryTypes.SELECT,
        }
    ) as MarkRow[];

    // Fetch subclass/class/class_master/academic_year context
    let context = null;
    if (marks.length > 0) {
        context = await getSubclassContext(marks[0].sub_class_id, academicYearId);
    }
    return { marks, context };
}

export async function getSubclassReportCardData(subClassId: number, academicYearId: number, examSequenceId: number): Promise<{ marks: MarkRow[]; context: any }> {
    // Fetch all marks for all students in the subclass
    const marks = await sequelize.query<MarkRow>(
        `SELECT s.id as student_id, s.name as student_name, s.matricule, s.gender, s.date_of_birth, s.place_of_birth,
           e.id as enrollment_id, e.sub_class_id, e.academic_year_id, e.repeater, e.photo,
           m.id as mark_id, m.score, m.sub_class_subject_id, m.exam_sequence_id,
           subj.name as subject_name, subj.category, scs.coefficient,
           t.name as teacher_name
    FROM "Student" s
    JOIN "Enrollment" e ON e.student_id = s.id
    JOIN "Mark" m ON m.enrollment_id = e.id
    JOIN "SubClassSubject" scs ON scs.id = m.sub_class_subject_id
    JOIN "Subject" subj ON subj.id = scs.subject_id
    JOIN "User" t ON t.id = m.teacher_id
    WHERE e.sub_class_id = :subClassId
      AND e.academic_year_id = :academicYearId
      AND m.exam_sequence_id = :examSequenceId
    ORDER BY s.name ASC
    `,
        {
            replacements: { subClassId, academicYearId, examSequenceId },
            type: QueryTypes.SELECT,
        }
    ) as MarkRow[];

    // Fetch subclass/class/class_master/academic_year context
    let context = null;
    if (marks.length > 0) {
        context = await getSubclassContext(subClassId, academicYearId);
    }
    return { marks, context };
}

export default sequelize;