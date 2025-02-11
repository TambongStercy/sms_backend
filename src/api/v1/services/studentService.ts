// src/api/v1/services/studentService.ts
import prisma, { Student, Parent_Student, Gender } from '../../../config/db';


export async function getAllStudents(): Promise<Student[]> {
    return prisma.student.findMany();
}

export async function createStudent(data: {
    matricule: string;
    name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    residence: string;
    former_school: string;
}): Promise<Student> {

    if (!Object.values(Gender).includes(data.gender as Gender)) {
        throw new Error("Invalid gender. Choose a valid gender.");
    }


    return prisma.student.create({
        data: {
            matricule: data.matricule,
            name: data.name,
            place_of_birth: data.place_of_birth,
            gender: data.gender as Gender,
            residence: data.residence,
            former_school: data.former_school,
            date_of_birth: new Date(data.date_of_birth),
        },
    });
}

export async function getStudentById(id: number): Promise<Student | null> {
    return prisma.student.findUnique({
        where: { id },
        include: {
            parents: true,
            student_sub_class_years: true,
        },
    });
}

export async function linkParent(student_id: number, data: { parent_id: number }): Promise<Parent_Student> {
    return prisma.parent_Student.create({
        data: {
            student_id,
            parent_id: data.parent_id,
        },
    });
}

export async function enrollStudent(
    student_id: number,
    data: { subclass_id: number; academic_year_id: number; photo: string }
): Promise<any> {
    return prisma.student_SubClass_Year.create({
        data: {
            student_id,
            subclass_id: data.subclass_id,
            academic_year_id: data.academic_year_id,
            photo: data.photo,
        },
    });
}
