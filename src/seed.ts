// seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

async function main() {
    // 1. Create Academic Year
    const academicYear = await prisma.academicYear.create({
        data: {
            start_date: new Date('2024-09-01'),
            end_date: new Date('2025-06-30'),
        },
    });

    // 2. Create Term
    const term = await prisma.term.create({
        data: {
            name: 'First Term',
            number: 1,
            start_date: new Date('2024-09-01'),
            end_date: new Date('2024-12-31'),
        },
    });

    // 3. Create Exam Sequence
    const examSequence = await prisma.examSequence.create({
        data: {
            sequence_number: 1,
            academic_year_id: academicYear.id,
            term_id: term.id,
        },
    });

    // 4. Create Class and Subclass
    const schoolClass = await prisma.class.create({
        data: {
            name: 'Form 1',
            subclasses: {
                create: {
                    name: 'South',
                },
            },
        },
        include: { subclasses: true },
    });
    const subClass = schoolClass.subclasses[0];

    // 5. Create 12 Subjects
    const categories = ['SCIENCE_AND_TECHNOLOGY', 'LANGUAGES_AND_LITERATURE',
        'HUMAN_AND_SOCIAL_SCIENCE', 'OTHERS'];
    const subjects = await Promise.all(
        Array.from({ length: 12 }).map(async (_, i) => {
            return prisma.subject.create({
                data: {
                    name: `Subject ${i + 1}`,
                    category: categories[i % categories.length] as any,
                },
            });
        })
    );

    // 6. Create 12 Teachers and link to subjects
    const teachers = await Promise.all(
        subjects.map(async (subject, i) => {
            const user = await prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    gender: 'Female',
                    date_of_birth: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }),
                    phone: faker.phone.number(),
                    address: faker.location.streetAddress(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                },
            });

            await prisma.userRole.create({
                data: {
                    user_id: user.id,
                    role: 'TEACHER',
                    academic_year_id: academicYear.id,
                },
            });

            await prisma.subjectTeacher.create({
                data: {
                    subject_id: subject.id,
                    teacher_id: user.id,
                },
            });

            return user;
        })
    );

    // 7. Link subjects to subclass with main teachers
    await Promise.all(
        subjects.map((subject, i) =>
            prisma.subclassSubject.create({
                data: {
                    coefficient: faker.number.int({ min: 1, max: 4 }),
                    subclass_id: subClass.id,
                    subject_id: subject.id,
                    main_teacher_id: teachers[i].id,
                },
            })
        )
    );

    // 8. Create 5 Students
    const students = await Promise.all(
        Array.from({ length: 5 }).map(async (_, i) => {
            const student = await prisma.student.create({
                data: {
                    matricule: `STU${faker.string.alphanumeric(6).toUpperCase()}`,
                    name: faker.person.fullName(),
                    date_of_birth: faker.date.birthdate({ min: 10, max: 15, mode: 'age' }),
                    place_of_birth: faker.location.city(),
                    gender: 'Female',
                    residence: faker.location.streetAddress(),
                    former_school: faker.company.name(),
                },
            });

            // Enroll student in subclass
            const enrollment = await prisma.enrollment.create({
                data: {
                    student_id: student.id,
                    subclass_id: subClass.id,
                    academic_year_id: academicYear.id,
                    repeater: false,
                    photo: faker.image.avatar(),
                },
            });

            return { student, enrollment };
        })
    );

    // 9. Create marks for all students in all subjects
    for (const { enrollment } of students) {
        const subclassSubjects = await prisma.subclassSubject.findMany({
            where: { subclass_id: subClass.id },
        });

        for (const subclassSubject of subclassSubjects) {
            await prisma.mark.create({
                data: {
                    enrollment_id: enrollment.id,
                    subclass_subject_id: subclassSubject.id,
                    teacher_id: subclassSubject.main_teacher_id,
                    exam_sequence_id: examSequence.id,
                    score: faker.number.float({ min: 5, max: 20 }),
                },
            });
        }
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });