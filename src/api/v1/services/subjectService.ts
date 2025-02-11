// src/api/v1/services/subjectService.ts
import { Subject, Subject_Teacher, SubClass_Subject, SubjectCategory } from '@prisma/client';
import prisma from '../../../config/db';

export async function getAllSubjects(): Promise<Subject[]> {
    return prisma.subject.findMany();
}

export async function createSubject(data: { name: string; category: string }): Promise<Subject> {
    return prisma.subject.create({
        data: {
            name: data.name,
            category: data.category as SubjectCategory,
        },
    });
}

export async function assignTeacher(subject_id: number, data: { teacher_id: number }): Promise<Subject_Teacher> {
    return prisma.subject_Teacher.create({
        data: {
            subject_id,
            teacher_id: data.teacher_id,
        },
    });
}

export async function linkSubjectToSubClass(subject_id: number, data: { subclass_id: number; coefficient: number }): Promise<SubClass_Subject> {
    return prisma.subClass_Subject.create({
        data: {
            subject_id,
            subclass_id: data.subclass_id,
            coefficient: data.coefficient,
        },
    });
}
