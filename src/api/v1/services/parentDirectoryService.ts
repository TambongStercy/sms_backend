import prisma from '../../../config/db';
import { getCurrentAcademicYear } from '../../../utils/academicYear';

/**
 * Curated contact directory for parents.
 *
 * Returns three groups:
 *   - fixed_staff: Principal, VP, Bursar, Dean of Studies (school-level contacts)
 *   - child_teachers: teachers currently teaching subjects to any of the parent's children
 *   - hods_by_subject: HOD for every subject in the school, grouped by subject
 *
 * Frontend uses this to render the "start a chat" screen.
 */

const FIXED_ROLES = ['PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'DEAN_OF_STUDIES'] as const;

const USER_SELECT = {
    id: true,
    name: true,
    matricule: true,
    photo: true,
    user_roles: { select: { role: true } },
} as const;

export async function getParentContacts(parentId: number) {
    const currentYear = await getCurrentAcademicYear();

    // 1. Fixed staff — one per role, most recently assigned wins (deterministic)
    const fixedStaff = await prisma.user.findMany({
        where: {
            status: 'ACTIVE',
            user_roles: { some: { role: { in: FIXED_ROLES as any } } },
        },
        select: USER_SELECT,
        orderBy: { name: 'asc' },
    });

    // 2. Child teachers — via ParentStudent → Student → Enrollment → SubClass
    const parentLinks = await prisma.parentStudent.findMany({
        where: { parent_id: parentId },
        select: { student_id: true, student: { select: { id: true, name: true, matricule: true } } },
    });
    const studentIds = parentLinks.map(p => p.student_id);

    let childTeachers: any[] = [];
    if (studentIds.length && currentYear) {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                student_id: { in: studentIds },
                academic_year_id: currentYear.id,
            },
            select: {
                student_id: true,
                sub_class: {
                    select: {
                        id: true,
                        name: true,
                        sub_class_subjects: {
                            select: {
                                subject: {
                                    select: {
                                        id: true,
                                        name: true,
                                        subject_teachers: {
                                            select: { teacher: { select: USER_SELECT } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const seenTeachers = new Map<number, any>();
        for (const e of enrollments) {
            const student = parentLinks.find(p => p.student_id === e.student_id)?.student;
            if (!e.sub_class) continue;
            for (const scs of e.sub_class.sub_class_subjects) {
                for (const st of scs.subject.subject_teachers) {
                    const t = st.teacher;
                    const key = t.id;
                    if (!seenTeachers.has(key)) {
                        seenTeachers.set(key, {
                            ...t,
                            teaches: [],
                        });
                    }
                    seenTeachers.get(key).teaches.push({
                        student: student ? { id: student.id, name: student.name } : null,
                        subject: { id: scs.subject.id, name: scs.subject.name },
                        sub_class: { id: e.sub_class.id, name: e.sub_class.name },
                    });
                }
            }
        }
        childTeachers = [...seenTeachers.values()];
    }

    // 3. HODs by subject — every subject with a HOD
    const subjects = await prisma.subject.findMany({
        where: { hod_id: { not: null } },
        select: {
            id: true,
            name: true,
            hod: { select: USER_SELECT },
        },
        orderBy: { name: 'asc' },
    });
    const hodsBySubject = subjects
        .filter(s => s.hod)
        .map(s => ({ subject: { id: s.id, name: s.name }, hod: s.hod }));

    return {
        fixed_staff: fixedStaff,
        child_teachers: childTeachers,
        hods_by_subject: hodsBySubject,
    };
}
