// src/api/v1/services/disciplineService.ts
import { StudentAbsence, TeacherAbsence, DisciplineIssue } from '@prisma/client';
import prisma from '../../../config/db';

export async function recordStudentAttendance(data: {
    student_id: number;
    assigned_by_id: number;
    sub_teach_period_year_id?: number;
}): Promise<StudentAbsence> {
    return prisma.studentAbsence.create({
        data,
    });
}

export async function recordTeacherAttendance(data: {
    teacher_id: number;
    assigned_by_id: number;
    reason: string;
    sub_teach_period_year_id?: number;
}): Promise<TeacherAbsence> {
    return prisma.teacherAbsence.create({
        data,
    });
}

export async function recordDisciplineIssue(data: {
    student_id: number;
    description: string;
    notes?: string;
    assigned_by_id: number;
    reviewed_by_id: number;
}): Promise<DisciplineIssue> {
    return prisma.disciplineIssue.create({
        data,
    });
}

export async function getDisciplineHistory(studentId: number): Promise<DisciplineIssue[]> {
    return prisma.disciplineIssue.findMany({
        where: { student_id: studentId },
    });
}
