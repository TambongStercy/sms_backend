// scripts/create-teacher-assignments.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTeacherAssignments() {
    console.log('Creating teacher assignments...');

    try {
        // Get current academic year
        const currentAcademicYear = await prisma.academicYear.findFirst({
            where: { name: '2024-2025' }
        });

        if (!currentAcademicYear) {
            console.error('Academic year 2024-2025 not found');
            return;
        }

        console.log(`Using academic year: ${currentAcademicYear.name} (ID: ${currentAcademicYear.id})`);

        // Get teachers
        const teachers = await prisma.user.findMany({
            where: {
                user_roles: {
                    some: { role: 'TEACHER' }
                }
            },
            include: {
                user_roles: true
            }
        });

        console.log(`Found ${teachers.length} teachers`);

        // Get subjects
        const subjects = await prisma.subject.findMany();
        console.log(`Found ${subjects.length} subjects`);

        // Get subclasses
        const subClasses = await prisma.subClass.findMany({
            include: {
                class: true
            }
        });
        console.log(`Found ${subClasses.length} sub-classes`);

        // Get periods (for creating teacher periods)
        const periods = await prisma.period.findMany({
            where: {
                is_break: false // Only non-break periods
            }
        });
        console.log(`Found ${periods.length} teaching periods`);

        if (teachers.length === 0 || subjects.length === 0 || subClasses.length === 0 || periods.length === 0) {
            console.error('Not enough data found. Please ensure you have teachers, subjects, subclasses, and periods in the database.');
            return;
        }

        // Sample teacher assignments based on common subject-class combinations
        const assignments = [
            // Teacher 1 - Mathematics teacher for Forms 1-3
            {
                teacherEmail: 'teacher1@example.com',
                subjectName: 'Mathematics',
                subClassNames: ['FORM 1N', 'FORM 1M', 'FORM 2N', 'FORM 2M'],
                periodsPerWeek: 6
            },
            // Teacher 2 - English teacher for Forms 1-5
            {
                teacherEmail: 'teacher2@example.com',
                subjectName: 'English Language',
                subClassNames: ['FORM 1S', 'FORM 2S', 'FORM 3N', 'FORM 3M'],
                periodsPerWeek: 5
            },
            // Teacher 1 also teaches Physics to science classes
            {
                teacherEmail: 'teacher1@example.com',
                subjectName: 'Physics',
                subClassNames: ['FORM 4S', 'FORM 5S', 'LSS', 'USS'],
                periodsPerWeek: 4
            },
            // Teacher 2 also teaches Literature
            {
                teacherEmail: 'teacher2@example.com',
                subjectName: 'Literature in English',
                subClassNames: ['FORM 4N', 'FORM 5N', 'LSA', 'USA'],
                periodsPerWeek: 3
            }
        ];

        let subjectTeachersCreated = 0;
        let subjectTeachersSkipped = 0;
        let teacherPeriodsCreated = 0;
        let teacherPeriodsSkipped = 0;

        // Get a user to use as assigned_by (find a manager or super manager)
        const assignedBy = await prisma.user.findFirst({
            where: {
                user_roles: {
                    some: {
                        role: { in: ['SUPER_MANAGER', 'MANAGER', 'PRINCIPAL'] }
                    }
                }
            }
        });

        if (!assignedBy) {
            console.error('No manager/admin user found to assign periods. Please ensure you have users with SUPER_MANAGER, MANAGER, or PRINCIPAL roles.');
            return;
        }

        for (const assignment of assignments) {
            // Find teacher
            const teacher = teachers.find(t => t.email === assignment.teacherEmail);
            if (!teacher) {
                console.warn(`Teacher with email ${assignment.teacherEmail} not found`);
                continue;
            }

            // Find subject
            const subject = subjects.find(s => s.name === assignment.subjectName);
            if (!subject) {
                console.warn(`Subject ${assignment.subjectName} not found`);
                continue;
            }

            // First, create or find SubjectTeacher relationship
            try {
                const existingSubjectTeacher = await prisma.subjectTeacher.findFirst({
                    where: {
                        teacher_id: teacher.id,
                        subject_id: subject.id
                    }
                });

                if (!existingSubjectTeacher) {
                    await prisma.subjectTeacher.create({
                        data: {
                            teacher_id: teacher.id,
                            subject_id: subject.id
                        }
                    });
                    console.log(`✓ Created subject-teacher relationship: ${teacher.name} -> ${subject.name}`);
                    subjectTeachersCreated++;
                } else {
                    console.log(`Subject-teacher relationship already exists: ${teacher.name} -> ${subject.name}`);
                    subjectTeachersSkipped++;
                }
            } catch (error: any) {
                console.error(`Error creating subject-teacher relationship for ${teacher.name} -> ${subject.name}:`, error);
                continue;
            }

            // Process each subclass for this assignment
            for (const subClassName of assignment.subClassNames) {
                const subClass = subClasses.find(sc => sc.name === subClassName);
                if (!subClass) {
                    console.warn(`SubClass ${subClassName} not found`);
                    continue;
                }

                // Create teacher periods for this subject-subclass combination
                const periodsToAssign = periods.slice(0, assignment.periodsPerWeek);

                for (const period of periodsToAssign) {
                    try {
                        // Check if teacher period already exists
                        const existingTeacherPeriod = await prisma.teacherPeriod.findFirst({
                            where: {
                                teacher_id: teacher.id,
                                subject_id: subject.id,
                                period_id: period.id,
                                sub_class_id: subClass.id,
                                academic_year_id: currentAcademicYear.id
                            }
                        });

                        if (existingTeacherPeriod) {
                            console.log(`Teacher period already exists: ${teacher.name} -> ${subject.name} -> ${subClass.name} -> ${period.name}`);
                            teacherPeriodsSkipped++;
                            continue;
                        }

                        // Create teacher period
                        await prisma.teacherPeriod.create({
                            data: {
                                teacher_id: teacher.id,
                                subject_id: subject.id,
                                period_id: period.id,
                                sub_class_id: subClass.id,
                                academic_year_id: currentAcademicYear.id,
                                assigned_by_id: assignedBy.id
                            }
                        });

                        console.log(`✓ Created teacher period: ${teacher.name} -> ${subject.name} -> ${subClass.name} -> ${period.name}`);
                        teacherPeriodsCreated++;

                    } catch (error: any) {
                        if (error.code === 'P2002') {
                            console.log(`Teacher period already exists: ${teacher.name} -> ${subject.name} -> ${subClass.name} -> ${period.name}`);
                            teacherPeriodsSkipped++;
                        } else {
                            console.error(`Error creating teacher period for ${teacher.name} -> ${subject.name} -> ${subClass.name} -> ${period.name}:`, error);
                        }
                    }
                }
            }
        }

        console.log(`\nTeacher assignments summary:`);
        console.log(`Subject-Teacher relationships:`);
        console.log(`- Created: ${subjectTeachersCreated}`);
        console.log(`- Skipped: ${subjectTeachersSkipped}`);
        console.log(`Teacher Periods:`);
        console.log(`- Created: ${teacherPeriodsCreated}`);
        console.log(`- Skipped: ${teacherPeriodsSkipped}`);

        // Show final assignments per teacher
        console.log('\nFinal teacher assignments:');
        for (const teacher of teachers) {
            const subjectTeachers = await prisma.subjectTeacher.findMany({
                where: {
                    teacher_id: teacher.id
                },
                include: {
                    subject: true
                }
            });

            const teacherPeriods = await prisma.teacherPeriod.findMany({
                where: {
                    teacher_id: teacher.id,
                    academic_year_id: currentAcademicYear.id
                },
                include: {
                    subject: true,
                    sub_class: {
                        include: { class: true }
                    },
                    period: true
                }
            });

            if (subjectTeachers.length > 0) {
                console.log(`\n${teacher.name} (${teacher.email}):`);
                console.log(`  Subjects: ${subjectTeachers.map(st => st.subject.name).join(', ')}`);

                // Group periods by subject and subclass
                const groupedPeriods = teacherPeriods.reduce((acc: any, tp) => {
                    const key = `${tp.subject.name} in ${tp.sub_class.name}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(tp.period.name);
                    return acc;
                }, {});

                Object.entries(groupedPeriods).forEach(([key, periods]: [string, any]) => {
                    console.log(`  - ${key}: ${periods.length} periods (${periods.join(', ')})`);
                });
            }
        }

    } catch (error) {
        console.error('Error creating teacher assignments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createTeacherAssignments()
    .catch(console.error); 