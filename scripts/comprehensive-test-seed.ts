import { PrismaClient, Gender, StudentStatus, Role, DisciplineType, AbsenceType, MessageStatus, AverageStatus, Student, Enrollment, User, Class, SubClass, Subject, Period, SchoolFees, Mark, StudentSequenceAverage, Message, DisciplineIssue, StudentAbsence, TeacherAbsence, InterviewMark, TeacherPeriod, QuizTemplate, QuizQuestion, QuizSubmission, QuizResponse, QuizStatus, PaymentMethod, DayOfWeek, SubjectCategory, ExamSequence, Term, Announcement } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive test seeding...');

    // Clear existing data
    await clearDatabase();

    // 1. Create Academic Years
    const academicYears = await seedAcademicYears();
    const currentYear = academicYears.find(y => y.is_current)!;

    // 2. Create Users with various roles
    const users = await seedUsers();

    // 3. Create UserRoles
    await seedUserRoles(users, currentYear.id);

    // 4. Create Classes and SubClasses
    const { classes, subclasses } = await seedClassesAndSubclasses();

    // 5. Create Subjects
    const subjects = await seedSubjects(users);

    // 6. Create Students
    const students = await seedStudents();

    // 7. Create Enrollments
    const enrollments = await seedEnrollments(students, classes, subclasses, currentYear.id);

    // 8. Create Parent-Student relationships
    await seedParentStudentRelationships(users, students);

    // 9. Create Teacher assignments
    await seedTeacherAssignments(users, subjects, subclasses);

    // 10. Create Terms and Exam Sequences
    const { terms, examSequences } = await seedTermsAndExamSequences(currentYear.id);

    // 11. Create School Fees
    await seedSchoolFees(enrollments, users, currentYear.id);

    // 12. Create Periods
    const periods = await seedPeriods();

    // 13. Create Teacher Periods (Timetable)
    await seedTeacherPeriods(users, subjects, periods, subclasses, currentYear.id);

    // 14. Create Marks
    await seedMarks(enrollments, users, examSequences, subjects, subclasses);

    // 15. Create Student Sequence Averages
    await seedStudentSequenceAverages(enrollments, examSequences);

    // 16. Create Quiz System (commented out - tables don't exist yet)
    // await seedQuizSystem(users, subjects, classes, students, currentYear.id);

    // 17. Create Discipline Issues
    await seedDisciplineIssues(enrollments, users);

    // 18. Create Attendance Records
    await seedAttendanceRecords(enrollments, users);

    // 19. Create Messages
    await seedMessages(users);

    // 20. Create Announcements
    await seedAnnouncements(users, currentYear.id);

    // 21. Create Interview Marks (for VP functionality)
    await seedInterviewMarks(students, users);

    console.log('✅ Comprehensive test seeding completed successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log(`- Academic Years: ${academicYears.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- SubClasses: ${subclasses.length}`);
    console.log(`- Subjects: ${subjects.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Enrollments: ${enrollments.length}`);
    console.log(`- Terms: ${terms.length}`);
    console.log(`- Exam Sequences: ${examSequences.length}`);
    console.log(`- Periods: ${periods.length}`);
}

async function clearDatabase() {
    console.log('🧹 Clearing existing data...');

    // Delete in correct order to respect foreign key constraints
    // Handle quiz tables that might not exist yet
    try {
        await prisma.quizResponse.deleteMany();
        await prisma.quizSubmission.deleteMany();
        await prisma.quizQuestion.deleteMany();
        await prisma.quizTemplate.deleteMany();
        console.log('✅ Quiz tables cleared');
    } catch (error) {
        console.log('⚠️ Quiz tables not found - skipping (run migration first if you want quiz data)');
    }
    // Handle optional tables that might not exist
    try {
        await prisma.auditLog.deleteMany();
        await prisma.formSubmission.deleteMany();
        await prisma.formTemplate.deleteMany();
        console.log('✅ Form and audit tables cleared');
    } catch (error) {
        console.log('⚠️ Some form/audit tables not found - skipping');
    }
    await prisma.message.deleteMany();
    await prisma.interviewMark.deleteMany();
    await prisma.generatedReport.deleteMany();
    await prisma.studentSequenceAverage.deleteMany();
    await prisma.examPaperQuestion.deleteMany();
    await prisma.examPaper.deleteMany();
    await prisma.question.deleteMany();
    await prisma.mobileNotification.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.paymentTransaction.deleteMany();
    await prisma.timeTable.deleteMany();
    await prisma.teacherAbsence.deleteMany();
    await prisma.studentAbsence.deleteMany();
    await prisma.disciplineIssue.deleteMany();
    await prisma.mark.deleteMany();
    await prisma.teacherPeriod.deleteMany();
    await prisma.period.deleteMany();
    await prisma.subjectTeacher.deleteMany();
    await prisma.subClassSubject.deleteMany();
    await prisma.schoolFees.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.parentStudent.deleteMany();
    await prisma.student.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.subClass.deleteMany();
    await prisma.class.deleteMany();
    await prisma.examSequence.deleteMany();
    await prisma.term.deleteMany();
    await prisma.roleAssignment.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.academicYear.deleteMany();

    console.log('✅ Database cleared successfully');
}

async function seedAcademicYears() {
    console.log('📅 Seeding Academic Years...');

    const academicYears = await Promise.all([
        prisma.academicYear.create({
            data: {
                name: '2023-2024',
                start_date: new Date('2023-09-01'),
                end_date: new Date('2024-06-30'),
                is_current: false,
                report_deadline: new Date('2024-07-15'),
            }
        }),
        prisma.academicYear.create({
            data: {
                name: '2024-2025',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2025-06-30'),
                is_current: true,
                report_deadline: new Date('2025-07-15'),
            }
        }),
        prisma.academicYear.create({
            data: {
                name: '2025-2026',
                start_date: new Date('2025-09-01'),
                end_date: new Date('2026-06-30'),
                is_current: false,
                report_deadline: new Date('2026-07-15'),
            }
        })
    ]);

    console.log(`✅ Created ${academicYears.length} academic years`);
    return academicYears;
}

async function seedUsers() {
    console.log('👥 Seeding Users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
        // Super Manager
        prisma.user.create({
            data: {
                name: 'John Super Manager',
                email: 'super.manager@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1980-01-15'),
                phone: '+237670123001',
                address: 'Yaounde, Cameroon',
                matricule: 'CEO001',
                status: 'ACTIVE',
            }
        }),

        // Principal
        prisma.user.create({
            data: {
                name: 'Mary Principal',
                email: 'principal@school.com',
                password: hashedPassword,
                gender: Gender.Female,
                date_of_birth: new Date('1975-03-20'),
                phone: '+237670123002',
                address: 'Yaounde, Cameroon',
                matricule: 'SA001',
                status: 'ACTIVE',
            }
        }),

        // Vice Principal
        prisma.user.create({
            data: {
                name: 'Robert Vice Principal',
                email: 'vp@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1978-07-10'),
                phone: '+237670123003',
                address: 'Yaounde, Cameroon',
                matricule: 'SA002',
                status: 'ACTIVE',
            }
        }),

        // Bursar
        prisma.user.create({
            data: {
                name: 'Sarah Bursar',
                email: 'bursar@school.com',
                password: hashedPassword,
                gender: Gender.Female,
                date_of_birth: new Date('1982-11-05'),
                phone: '+237670123004',
                address: 'Yaounde, Cameroon',
                matricule: 'SA003',
                status: 'ACTIVE',
            }
        }),

        // Discipline Master
        prisma.user.create({
            data: {
                name: 'Michael Discipline Master',
                email: 'sdm@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1979-04-18'),
                phone: '+237670123005',
                address: 'Yaounde, Cameroon',
                matricule: 'SO001',
                status: 'ACTIVE',
            }
        }),

        // Teachers
        prisma.user.create({
            data: {
                name: 'Alice Mathematics Teacher',
                email: 'alice.math@school.com',
                password: hashedPassword,
                gender: Gender.Female,
                date_of_birth: new Date('1985-06-12'),
                phone: '+237670123006',
                address: 'Yaounde, Cameroon',
                matricule: 'ST001',
                status: 'ACTIVE',
                total_hours_per_week: 20,
            }
        }),

        prisma.user.create({
            data: {
                name: 'David Physics Teacher',
                email: 'david.physics@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1983-09-25'),
                phone: '+237670123007',
                address: 'Yaounde, Cameroon',
                matricule: 'ST002',
                status: 'ACTIVE',
                total_hours_per_week: 18,
            }
        }),

        prisma.user.create({
            data: {
                name: 'Emma English Teacher',
                email: 'emma.english@school.com',
                password: hashedPassword,
                gender: Gender.Female,
                date_of_birth: new Date('1987-02-14'),
                phone: '+237670123008',
                address: 'Yaounde, Cameroon',
                matricule: 'ST003',
                status: 'ACTIVE',
                total_hours_per_week: 16,
            }
        }),

        prisma.user.create({
            data: {
                name: 'James Chemistry Teacher',
                email: 'james.chemistry@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1984-12-08'),
                phone: '+237670123009',
                address: 'Yaounde, Cameroon',
                matricule: 'ST004',
                status: 'ACTIVE',
                total_hours_per_week: 15,
            }
        }),

        // Parents
        prisma.user.create({
            data: {
                name: 'Grace Parent One',
                email: 'grace.parent@gmail.com',
                password: hashedPassword,
                gender: Gender.Female,
                date_of_birth: new Date('1985-08-20'),
                phone: '+237670123010',
                whatsapp_number: '+237670123010',
                address: 'Douala, Cameroon',
                matricule: 'SO002',
                status: 'ACTIVE',
            }
        }),

        prisma.user.create({
            data: {
                name: 'Peter Parent Two',
                email: 'peter.parent@gmail.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1980-05-15'),
                phone: '+237670123011',
                whatsapp_number: '+237670123011',
                address: 'Bafoussam, Cameroon',
                matricule: 'SO003',
                status: 'ACTIVE',
            }
        }),

        prisma.user.create({
            data: {
                name: 'Linda Parent Three',
                email: 'linda.parent@gmail.com',
                password: hashedPassword,
                gender: Gender.Female,
                date_of_birth: new Date('1988-01-30'),
                phone: '+237670123012',
                whatsapp_number: '+237670123012',
                address: 'Yaounde, Cameroon',
                matricule: 'SO004',
                status: 'ACTIVE',
            }
        }),

        // HOD - Head of Department
        prisma.user.create({
            data: {
                name: 'Dr. Science HOD',
                email: 'science.hod@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1976-10-22'),
                phone: '+237670123013',
                address: 'Yaounde, Cameroon',
                matricule: 'ST005',
                status: 'ACTIVE',
                total_hours_per_week: 12,
            }
        })
    ]);

    console.log(`✅ Created ${users.length} users`);
    return users;
}

async function seedUserRoles(users: any[], academicYearId: number) {
    console.log('🎭 Seeding User Roles...');

    // Most roles are assigned to the current academic year.
    // SUPER_MANAGER is a global role (academic_year_id is null).
    const userRoles = [
        // Super Manager gets ALL roles for comprehensive testing
        { user_id: users[0].id, role: Role.SUPER_MANAGER, academic_year_id: null },
        { user_id: users[0].id, role: Role.PRINCIPAL, academic_year_id: academicYearId },
        { user_id: users[0].id, role: Role.VICE_PRINCIPAL, academic_year_id: academicYearId },
        { user_id: users[0].id, role: Role.BURSAR, academic_year_id: academicYearId },
        { user_id: users[0].id, role: Role.DISCIPLINE_MASTER, academic_year_id: academicYearId },
        { user_id: users[0].id, role: Role.TEACHER, academic_year_id: academicYearId },
        { user_id: users[0].id, role: Role.HOD, academic_year_id: academicYearId },
        { user_id: users[0].id, role: Role.PARENT, academic_year_id: academicYearId },

        // Other users get their specific roles
        { user_id: users[1].id, role: Role.PRINCIPAL, academic_year_id: academicYearId },
        { user_id: users[2].id, role: Role.VICE_PRINCIPAL, academic_year_id: null },
        { user_id: users[3].id, role: Role.BURSAR, academic_year_id: academicYearId },
        { user_id: users[4].id, role: Role.DISCIPLINE_MASTER, academic_year_id: academicYearId },
        { user_id: users[5].id, role: Role.TEACHER, academic_year_id: academicYearId },
        { user_id: users[6].id, role: Role.TEACHER, academic_year_id: academicYearId },
        { user_id: users[7].id, role: Role.TEACHER, academic_year_id: academicYearId },
        { user_id: users[8].id, role: Role.TEACHER, academic_year_id: academicYearId },
        { user_id: users[9].id, role: Role.PARENT, academic_year_id: academicYearId },
        { user_id: users[10].id, role: Role.PARENT, academic_year_id: academicYearId },
        { user_id: users[11].id, role: Role.PARENT, academic_year_id: academicYearId },
        { user_id: users[12].id, role: Role.HOD, academic_year_id: academicYearId },
        { user_id: users[12].id, role: Role.TEACHER, academic_year_id: academicYearId },
    ];

    // Deduplicate to prevent unique constraint errors if the same user has the same role twice
    const uniqueUserRoles = userRoles.filter((v, i, a) =>
        a.findIndex(t => (
            t.user_id === v.user_id &&
            t.role === v.role &&
            t.academic_year_id === v.academic_year_id
        )) === i
    );

    await prisma.userRole.createMany({
        data: uniqueUserRoles,
    });

    console.log(`✅ Created ${uniqueUserRoles.length} user roles`);
}

async function seedClassesAndSubclasses() {
    console.log('🏫 Seeding Classes and SubClasses...');

    const classes = await Promise.all([
        prisma.class.create({
            data: {
                name: 'FORM 1',
                max_students: 80,
                base_fee: 50000,
                miscellaneous_fee: 5000,
                new_student_fee: 75000,
                old_student_fee: 65000,
                first_term_fee: 25000,
                second_term_fee: 25000,
                third_term_fee: 25000,
            }
        }),
        prisma.class.create({
            data: {
                name: 'FORM 2',
                max_students: 80,
                base_fee: 55000,
                miscellaneous_fee: 5000,
                new_student_fee: 80000,
                old_student_fee: 70000,
                first_term_fee: 27000,
                second_term_fee: 27000,
                third_term_fee: 26000,
            }
        }),
        prisma.class.create({
            data: {
                name: 'FORM 3',
                max_students: 80,
                base_fee: 60000,
                miscellaneous_fee: 5000,
                new_student_fee: 85000,
                old_student_fee: 75000,
                first_term_fee: 30000,
                second_term_fee: 30000,
                third_term_fee: 25000,
            }
        }),
        prisma.class.create({
            data: {
                name: 'FORM 4',
                max_students: 80,
                base_fee: 65000,
                miscellaneous_fee: 5000,
                new_student_fee: 90000,
                old_student_fee: 80000,
                first_term_fee: 32000,
                second_term_fee: 32000,
                third_term_fee: 26000,
            }
        }),
        prisma.class.create({
            data: {
                name: 'FORM 5',
                max_students: 80,
                base_fee: 70000,
                miscellaneous_fee: 5000,
                new_student_fee: 95000,
                old_student_fee: 85000,
                first_term_fee: 35000,
                second_term_fee: 35000,
                third_term_fee: 25000,
            }
        })
    ]);

    const subclasses = await Promise.all([
        // Form 1 SubClasses
        prisma.subClass.create({
            data: {
                name: 'FORM 1A',
                class_id: classes[0].id,
                current_students: 25,
            }
        }),
        prisma.subClass.create({
            data: {
                name: 'FORM 1B',
                class_id: classes[0].id,
                current_students: 28,
            }
        }),

        // Form 2 SubClasses
        prisma.subClass.create({
            data: {
                name: 'FORM 2A',
                class_id: classes[1].id,
                current_students: 30,
            }
        }),
        prisma.subClass.create({
            data: {
                name: 'FORM 2B',
                class_id: classes[1].id,
                current_students: 27,
            }
        }),

        // Form 3 SubClasses
        prisma.subClass.create({
            data: {
                name: 'FORM 3A',
                class_id: classes[2].id,
                current_students: 22,
            }
        }),
        prisma.subClass.create({
            data: {
                name: 'FORM 3B',
                class_id: classes[2].id,
                current_students: 24,
            }
        }),

        // Form 4 SubClasses
        prisma.subClass.create({
            data: {
                name: 'FORM 4A',
                class_id: classes[3].id,
                current_students: 20,
            }
        }),
        prisma.subClass.create({
            data: {
                name: 'FORM 4B',
                class_id: classes[3].id,
                current_students: 18,
            }
        }),

        // Form 5 SubClasses
        prisma.subClass.create({
            data: {
                name: 'FORM 5A',
                class_id: classes[4].id,
                current_students: 15,
            }
        }),
        prisma.subClass.create({
            data: {
                name: 'FORM 5B',
                class_id: classes[4].id,
                current_students: 17,
            }
        })
    ]);

    console.log(`✅ Created ${classes.length} classes and ${subclasses.length} subclasses`);
    return { classes, subclasses };
}

async function seedSubjects(users: any[]) {
    console.log('📚 Seeding Subjects...');

    const hodUser = users.find(u => u.matricule === 'ST005'); // Dr. Science HOD

    const subjects = await Promise.all([
        // Science & Technology
        prisma.subject.create({
            data: {
                name: 'Mathematics',
                category: 'SCIENCE_AND_TECHNOLOGY',
                hod_id: hodUser?.id,
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Physics',
                category: 'SCIENCE_AND_TECHNOLOGY',
                hod_id: hodUser?.id,
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Chemistry',
                category: 'SCIENCE_AND_TECHNOLOGY',
                hod_id: hodUser?.id,
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Biology',
                category: 'SCIENCE_AND_TECHNOLOGY',
                hod_id: hodUser?.id,
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Computer Science',
                category: 'SCIENCE_AND_TECHNOLOGY',
                hod_id: hodUser?.id,
            }
        }),

        // Languages & Literature
        prisma.subject.create({
            data: {
                name: 'English Language',
                category: 'LANGUAGES_AND_LITERATURE',
            }
        }),
        prisma.subject.create({
            data: {
                name: 'French',
                category: 'LANGUAGES_AND_LITERATURE',
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Literature',
                category: 'LANGUAGES_AND_LITERATURE',
            }
        }),

        // Human & Social Science
        prisma.subject.create({
            data: {
                name: 'History',
                category: 'HUMAN_AND_SOCIAL_SCIENCE',
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Geography',
                category: 'HUMAN_AND_SOCIAL_SCIENCE',
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Economics',
                category: 'HUMAN_AND_SOCIAL_SCIENCE',
            }
        }),

        // Others
        prisma.subject.create({
            data: {
                name: 'Physical Education',
                category: 'OTHERS',
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Religious Studies',
                category: 'OTHERS',
            }
        }),
        prisma.subject.create({
            data: {
                name: 'Arts',
                category: 'OTHERS',
            }
        })
    ]);

    console.log(`✅ Created ${subjects.length} subjects`);
    return subjects;
}

async function seedStudents() {
    console.log('👨‍🎓 Seeding Students...');

    const students: Student[] = [];
    const studentData = [
        { name: 'John Student One', gender: 'Male', residence: 'Yaounde', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Mary Student Two', gender: 'Female', residence: 'Douala', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Peter Student Three', gender: 'Male', residence: 'Bafoussam', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Grace Student Four', gender: 'Female', residence: 'Yaounde', status: 'ASSIGNED_TO_CLASS' },
        { name: 'David Student Five', gender: 'Male', residence: 'Bamenda', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Sarah Student Six', gender: 'Female', residence: 'Limbe', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Michael Student Seven', gender: 'Male', residence: 'Yaounde', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Emma Student Eight', gender: 'Female', residence: 'Douala', status: 'ASSIGNED_TO_CLASS' },
        { name: 'James Student Nine', gender: 'Male', residence: 'Kribi', status: 'ASSIGNED_TO_CLASS' },
        { name: 'Linda Student Ten', gender: 'Female', residence: 'Yaounde', status: 'ASSIGNED_TO_CLASS' },

        // New students awaiting assignment
        { name: 'Robert New Student', gender: 'Male', residence: 'Yaounde', status: 'NOT_ENROLLED' },
        { name: 'Alice New Student', gender: 'Female', residence: 'Douala', status: 'NOT_ENROLLED' },
        { name: 'Kevin New Student', gender: 'Male', residence: 'Bamenda', status: 'ENROLLED' }, // Awaiting interview
    ];

    for (let i = 0; i < studentData.length; i++) {
        const data = studentData[i];
        const student = await prisma.student.create({
            data: {
                matricule: `STD${String(i + 1).padStart(3, '0')}`,
                name: data.name,
                date_of_birth: new Date(2008 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                place_of_birth: 'Cameroon',
                gender: data.gender as any,
                residence: data.residence,
                former_school: i > 7 ? 'Previous School Name' : undefined,
                is_new_student: i > 7,
                status: data.status as any,
            }
        });
        students.push(student);
    }

    console.log(`✅ Created ${students.length} students`);
    return students;
}

async function seedEnrollments(students: Student[], classes: Class[], subclasses: SubClass[], academicYearId: number) {
    console.log('📝 Seeding Enrollments...');

    const enrollments: Enrollment[] = [];

    // Enroll first 10 students in different subclasses
    for (let i = 0; i < 10; i++) {
        const student = students[i];
        const subclass = subclasses[i % subclasses.length];

        const enrollment = await prisma.enrollment.create({
            data: {
                student_id: student.id,
                academic_year_id: academicYearId,
                class_id: subclass.class_id,
                sub_class_id: subclass.id,
                repeater: Math.random() > 0.9, // 10% repeaters
                photo: i % 3 === 0 ? `student_${i + 1}_photo.jpg` : undefined,
            }
        });
        enrollments.push(enrollment);
    }

    // Create partial enrollments for new students (class assigned but not subclass)
    for (let i = 10; i < 13; i++) {
        const student = students[i];
        const classObj = classes[0]; // All new students initially go to Form 1

        const enrollment = await prisma.enrollment.create({
            data: {
                student_id: student.id,
                academic_year_id: academicYearId,
                class_id: classObj.id,
                sub_class_id: null, // Will be assigned after VP interview
                repeater: false,
            }
        });
        enrollments.push(enrollment);
    }

    console.log(`✅ Created ${enrollments.length} enrollments`);
    return enrollments;
}

async function seedParentStudentRelationships(users: any[], students: any[]) {
    console.log('👨‍👩‍👧‍👦 Seeding Parent-Student Relationships...');

    const parents = users.filter(u => u.matricule?.startsWith('SO') && ['SO002', 'SO003', 'SO004'].includes(u.matricule));

    const relationships = [
        // Parent 1 has 2 children
        { parent_id: parents[0].id, student_id: students[0].id },
        { parent_id: parents[0].id, student_id: students[1].id },

        // Parent 2 has 3 children
        { parent_id: parents[1].id, student_id: students[2].id },
        { parent_id: parents[1].id, student_id: students[3].id },
        { parent_id: parents[1].id, student_id: students[4].id },

        // Parent 3 has 2 children
        { parent_id: parents[2].id, student_id: students[5].id },
        { parent_id: parents[2].id, student_id: students[6].id },

        // Some students have single parents
        { parent_id: parents[0].id, student_id: students[7].id },
        { parent_id: parents[1].id, student_id: students[8].id },
        { parent_id: parents[2].id, student_id: students[9].id },

        // New students
        { parent_id: parents[0].id, student_id: students[10].id },
        { parent_id: parents[1].id, student_id: students[11].id },
        { parent_id: parents[2].id, student_id: students[12].id },
    ];

    await prisma.parentStudent.createMany({
        data: relationships
    });

    console.log(`✅ Created ${relationships.length} parent-student relationships`);
}

async function seedTeacherAssignments(users: User[], subjects: Subject[], subclasses: SubClass[]) {
    console.log('👨‍🏫 Seeding Teacher Assignments...');

    const teachers = users.filter(u => u.matricule?.startsWith('ST'));

    // Subject-Teacher assignments
    const subjectTeachers = [
        { subject_id: subjects[0].id, teacher_id: teachers[0].id }, // Alice - Mathematics
        { subject_id: subjects[1].id, teacher_id: teachers[1].id }, // David - Physics
        { subject_id: subjects[2].id, teacher_id: teachers[3].id }, // James - Chemistry
        { subject_id: subjects[5].id, teacher_id: teachers[2].id }, // Emma - English
        { subject_id: subjects[3].id, teacher_id: teachers[4].id }, // HOD - Biology
        { subject_id: subjects[4].id, teacher_id: teachers[4].id }, // HOD - Computer Science
    ];

    await prisma.subjectTeacher.createMany({
        data: subjectTeachers
    });

    // SubClass-Subject assignments with coefficients
    const subclassSubjects: any[] = [];
    for (const subclass of subclasses) {
        // Each subclass has core subjects
        const coreSubjects = [
            { subject_id: subjects[0].id, coefficient: 4 }, // Mathematics
            { subject_id: subjects[5].id, coefficient: 3 }, // English
            { subject_id: subjects[6].id, coefficient: 3 }, // French
            { subject_id: subjects[1].id, coefficient: 3 }, // Physics
            { subject_id: subjects[2].id, coefficient: 3 }, // Chemistry
        ];

        for (const subjectData of coreSubjects) {
            subclassSubjects.push({
                sub_class_id: subclass.id,
                subject_id: subjectData.subject_id,
                coefficient: subjectData.coefficient,
            });
        }
    }

    await prisma.subClassSubject.createMany({
        data: subclassSubjects
    });

    console.log(`✅ Created ${subjectTeachers.length} subject-teacher assignments and ${subclassSubjects.length} subclass-subject assignments`);
}

async function seedTermsAndExamSequences(academicYearId: number) {
    console.log('📅 Seeding Terms and Exam Sequences...');

    const terms = await Promise.all([
        prisma.term.create({
            data: {
                name: 'First Term',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2024-12-15'),
                academic_year_id: academicYearId,
                fee_deadline: new Date('2024-10-15'),
            }
        }),
        prisma.term.create({
            data: {
                name: 'Second Term',
                start_date: new Date('2025-01-15'),
                end_date: new Date('2025-04-15'),
                academic_year_id: academicYearId,
                fee_deadline: new Date('2025-02-15'),
            }
        }),
        prisma.term.create({
            data: {
                name: 'Third Term',
                start_date: new Date('2025-04-20'),
                end_date: new Date('2025-06-30'),
                academic_year_id: academicYearId,
                fee_deadline: new Date('2025-05-15'),
            }
        })
    ]);

    const examSequences = await Promise.all([
        // First Term Sequences
        prisma.examSequence.create({
            data: {
                sequence_number: 1,
                academic_year_id: academicYearId,
                term_id: terms[0].id,
                status: 'FINALIZED',
            }
        }),
        prisma.examSequence.create({
            data: {
                sequence_number: 2,
                academic_year_id: academicYearId,
                term_id: terms[0].id,
                status: 'CLOSED',
            }
        }),

        // Second Term Sequences
        prisma.examSequence.create({
            data: {
                sequence_number: 1,
                academic_year_id: academicYearId,
                term_id: terms[1].id,
                status: 'OPEN',
            }
        }),
        prisma.examSequence.create({
            data: {
                sequence_number: 2,
                academic_year_id: academicYearId,
                term_id: terms[1].id,
                status: 'OPEN',
            }
        }),
    ]);

    console.log(`✅ Created ${terms.length} terms and ${examSequences.length} exam sequences`);
    return { terms, examSequences };
}

async function seedSchoolFees(enrollments: Enrollment[], users: User[], academicYearId: number) {
    console.log('💰 Seeding School Fees...');

    const fees: SchoolFees[] = [];
    const bursar = users.find(u => u.matricule === 'SA003'); // Bursar user

    for (const enrollment of enrollments) {
        // Get student info to determine if new student
        const student = await prisma.student.findUnique({
            where: { id: enrollment.student_id }
        });

        const fee = await prisma.schoolFees.create({
            data: {
                enrollment_id: enrollment.id,
                academic_year_id: academicYearId,
                amount_expected: 75000,
                amount_paid: Math.random() > 0.3 ? Math.floor(Math.random() * 75000) : 0, // 70% have partial payments
                is_new_student: student?.is_new_student || false,
                due_date: new Date('2024-12-31'),
            }
        });
        fees.push(fee);

        // Create some payment transactions
        if (fee.amount_paid > 0) {
            const paymentCount = Math.floor(Math.random() * 3) + 1;
            let remainingAmount = fee.amount_paid;

            for (let i = 0; i < paymentCount && remainingAmount > 0; i++) {
                const paymentAmount = i === paymentCount - 1 ? remainingAmount : Math.floor(remainingAmount * Math.random());
                remainingAmount -= paymentAmount;

                await prisma.paymentTransaction.create({
                    data: {
                        enrollment_id: enrollment.id,
                        academic_year_id: academicYearId,
                        fee_id: fee.id,
                        amount: paymentAmount,
                        payment_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
                        payment_method: ['EXPRESS_UNION', 'CCA', 'F3DC'][Math.floor(Math.random() * 3)] as any,
                        receipt_number: `REC${Date.now()}-${i}`,
                        recorded_by_id: bursar?.id || 1, // Bursar user ID
                        notes: `Payment ${i + 1} for student`,
                    }
                });
            }
        }
    }

    console.log(`✅ Created ${fees.length} school fees with payment transactions`);
}

async function seedPeriods() {
    console.log('⏰ Seeding Periods...');

    const periods: Period[] = [];
    const timeSlots = [
        { start: '07:30', end: '08:20', name: 'Period 1' },
        { start: '08:20', end: '09:10', name: 'Period 2' },
        { start: '09:10', end: '09:30', name: 'Break', isBreak: true },
        { start: '09:30', end: '10:20', name: 'Period 3' },
        { start: '10:20', end: '11:10', name: 'Period 4' },
        { start: '11:10', end: '12:00', name: 'Period 5' },
        { start: '12:00', end: '13:00', name: 'Lunch Break', isBreak: true },
        { start: '13:00', end: '13:50', name: 'Period 6' },
        { start: '13:50', end: '14:40', name: 'Period 7' },
        { start: '14:40', end: '15:30', name: 'Period 8' },
    ];

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    for (const day of daysOfWeek) {
        for (const slot of timeSlots) {
            const period = await prisma.period.create({
                data: {
                    day_of_week: day as any,
                    start_time: slot.start,
                    end_time: slot.end,
                    name: `${day} ${slot.name}`,
                    is_break: slot.isBreak || false,
                }
            });
            periods.push(period);
        }
    }

    console.log(`✅ Created ${periods.length} periods`);
    return periods;
}

async function seedTeacherPeriods(users: any[], subjects: any[], periods: any[], subclasses: any[], academicYearId: number) {
    console.log('📚 Seeding Teacher Periods (Timetable)...');

    const teachers = users.filter(u => u.matricule?.startsWith('ST'));
    const nonBreakPeriods = periods.filter(p => !p.is_break);
    const assignedBy = users.find(u => u.matricule === 'SA001'); // Principal

    const teacherPeriods: TeacherPeriod[] = [];

    // Assign some teacher periods for timetable
    for (let i = 0; i < 20; i++) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const subject = subjects[Math.floor(Math.random() * 5)]; // Core subjects only
        const period = nonBreakPeriods[Math.floor(Math.random() * nonBreakPeriods.length)];
        const subclass = subclasses[Math.floor(Math.random() * subclasses.length)];

        try {
            const teacherPeriod = await prisma.teacherPeriod.create({
                data: {
                    teacher_id: teacher.id,
                    subject_id: subject.id,
                    period_id: period.id,
                    sub_class_id: subclass.id,
                    academic_year_id: academicYearId,
                    assigned_by_id: assignedBy?.id || 1,
                }
            });
            teacherPeriods.push(teacherPeriod);
        } catch (error) {
            // Skip duplicates
            continue;
        }
    }

    console.log(`✅ Created ${teacherPeriods.length} teacher periods`);
}

async function seedMarks(enrollments: any[], users: any[], examSequences: any[], subjects: any[], subclasses: any[]) {
    console.log('📊 Seeding Marks...');

    const teachers = users.filter(u => u.matricule?.startsWith('ST'));
    const marks: Mark[] = [];

    for (const enrollment of enrollments.slice(0, 10)) { // Only for enrolled students
        if (!enrollment.sub_class_id) continue;

        // Get subjects for this subclass
        const subclassSubjects = await prisma.subClassSubject.findMany({
            where: { sub_class_id: enrollment.sub_class_id }
        });

        for (const examSequence of examSequences.slice(0, 2)) { // First 2 sequences
            for (const subclassSubject of subclassSubjects) {
                const teacher = teachers[Math.floor(Math.random() * teachers.length)];

                try {
                    const mark = await prisma.mark.create({
                        data: {
                            enrollment_id: enrollment.id,
                            teacher_id: teacher.id,
                            exam_sequence_id: examSequence.id,
                            sub_class_subject_id: subclassSubject.id,
                            score: Math.floor(Math.random() * 20) + 1, // Score out of 20
                        }
                    });
                    marks.push(mark);
                } catch (error) {
                    // Skip duplicates
                    continue;
                }
            }
        }
    }

    console.log(`✅ Created ${marks.length} marks`);
}

async function seedStudentSequenceAverages(enrollments: any[], examSequences: any[]) {
    console.log('📈 Seeding Student Sequence Averages...');

    const averages: StudentSequenceAverage[] = [];

    for (const enrollment of enrollments.slice(0, 10)) {
        if (!enrollment.sub_class_id) continue;

        for (const examSequence of examSequences.slice(0, 2)) {
            try {
                const average = await prisma.studentSequenceAverage.create({
                    data: {
                        enrollment_id: enrollment.id,
                        exam_sequence_id: examSequence.id,
                        average: Math.floor(Math.random() * 8) + 10, // Average between 10-18
                        rank: Math.floor(Math.random() * 30) + 1,
                        total_students: 30,
                        decision: Math.random() > 0.8 ? 'Excellent' : 'Good',
                        status: examSequence.status === 'FINALIZED' ? 'VERIFIED' : 'CALCULATED',
                    }
                });
                averages.push(average);
            } catch (error) {
                continue;
            }
        }
    }

    console.log(`✅ Created ${averages.length} student sequence averages`);
}

async function seedQuizSystem(users: any[], subjects: any[], classes: any[], students: any[], academicYearId: number) {
    console.log('🧩 Seeding Quiz System...');

    const teachers = users.filter(u => u.matricule?.startsWith('ST'));
    const parents = users.filter(u => u.matricule?.startsWith('SO') && ['SO002', 'SO003', 'SO004'].includes(u.matricule));

    // Create quiz templates
    const quizTemplates: QuizTemplate[] = [];
    for (let i = 0; i < 3; i++) {
        const subject = subjects[i];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];

        const quiz = await prisma.quizTemplate.create({
            data: {
                title: `${subject.name} Quiz ${i + 1}`,
                description: `A practice quiz for ${subject.name}`,
                subject_id: subject.id,
                class_ids: JSON.stringify([classes[0].id, classes[1].id]), // Form 1 and 2
                time_limit: 30,
                total_marks: 10,
                is_active: true,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                created_by_id: teacher.id,
                academic_year_id: academicYearId,
            }
        });
        quizTemplates.push(quiz);

        // Create questions for each quiz
        for (let j = 0; j < 5; j++) {
            await prisma.quizQuestion.create({
                data: {
                    quiz_id: quiz.id,
                    question_text: `What is the answer to ${subject.name} question ${j + 1}?`,
                    question_type: 'MCQ',
                    options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
                    correct_answer: 'Option A',
                    marks: 2,
                    order_index: j + 1,
                    explanation: `This is the explanation for question ${j + 1}`,
                }
            });
        }
    }

    // Create quiz submissions
    const submissions: QuizSubmission[] = [];
    for (const student of students.slice(0, 6)) { // First 6 students
        const parent = parents[Math.floor(Math.random() * parents.length)];
        const quiz = quizTemplates[Math.floor(Math.random() * quizTemplates.length)];

        try {
            const submission = await prisma.quizSubmission.create({
                data: {
                    quiz_id: quiz.id,
                    student_id: student.id,
                    parent_id: parent.id,
                    score: Math.floor(Math.random() * 8) + 6, // Score between 6-14
                    total_marks: 10,
                    percentage: null, // Will be calculated
                    time_taken: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
                    status: Math.random() > 0.3 ? 'COMPLETED' : 'IN_PROGRESS',
                    submitted_at: Math.random() > 0.3 ? new Date() : null,
                    academic_year_id: academicYearId,
                }
            });

            // Update percentage
            const percentage = (submission.score! / submission.total_marks) * 100;
            await prisma.quizSubmission.update({
                where: { id: submission.id },
                data: { percentage }
            });

            submissions.push(submission);
        } catch (error) {
            continue;
        }
    }

    console.log(`✅ Created ${quizTemplates.length} quiz templates and ${submissions.length} quiz submissions`);
}

async function seedDisciplineIssues(enrollments: any[], users: any[]) {
    console.log('⚠️ Seeding Discipline Issues...');

    const sdm = users.find(u => u.matricule === 'SO001'); // Discipline Master
    const principal = users.find(u => u.matricule === 'SA001'); // Principal

    const disciplineTypes = ['MORNING_LATENESS', 'CLASS_ABSENCE', 'MISCONDUCT', 'OTHER'];
    const issues: DisciplineIssue[] = [];

    for (let i = 0; i < 8; i++) {
        const enrollment = enrollments[Math.floor(Math.random() * enrollments.length)];

        try {
            const issue = await prisma.disciplineIssue.create({
                data: {
                    enrollment_id: enrollment.id,
                    issue_type: disciplineTypes[Math.floor(Math.random() * disciplineTypes.length)] as any,
                    description: `Discipline issue ${i + 1} description`,
                    notes: `Additional notes for issue ${i + 1}`,
                    assigned_by_id: sdm?.id || 1,
                    reviewed_by_id: principal?.id || 1,
                }
            });
            issues.push(issue);
        } catch (error) {
            continue;
        }
    }

    console.log(`✅ Created ${issues.length} discipline issues`);
}

async function seedAttendanceRecords(enrollments: any[], users: any[]) {
    console.log('📅 Seeding Attendance Records...');

    const sdm = users.find(u => u.matricule === 'SO001'); // Discipline Master
    const teachers = users.filter(u => u.matricule?.startsWith('ST'));

    const absences: any[] = []; // Mixed types array

    // Student absences
    for (let i = 0; i < 10; i++) {
        const enrollment = enrollments[Math.floor(Math.random() * Math.min(enrollments.length, 10))];

        try {
            const absence = await prisma.studentAbsence.create({
                data: {
                    enrollment_id: enrollment.id,
                    assigned_by_id: sdm?.id || 1,
                    absence_type: Math.random() > 0.5 ? 'CLASS_ABSENCE' : 'MORNING_LATENESS',
                }
            });
            absences.push(absence);
        } catch (error) {
            continue;
        }
    }

    // Teacher absences
    for (let i = 0; i < 3; i++) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];

        const teacherAbsence = await prisma.teacherAbsence.create({
            data: {
                teacher_id: teacher.id,
                assigned_by_id: sdm?.id || 1,
                reason: `Teacher absence reason ${i + 1}`,
            }
        });
        absences.push(teacherAbsence);
    }

    console.log(`✅ Created ${absences.length} attendance records`);
}

async function seedMessages(users: any[]) {
    console.log('💬 Seeding Messages...');

    const parents = users.filter(u => u.matricule?.startsWith('SO') && ['SO002', 'SO003', 'SO004'].includes(u.matricule));
    const staff = users.filter(u => u.matricule?.startsWith('SA') || u.matricule?.startsWith('ST'));

    const messages: Message[] = [];

    for (let i = 0; i < 5; i++) {
        const sender = parents[Math.floor(Math.random() * parents.length)];
        const receiver = staff[Math.floor(Math.random() * staff.length)];

        const message = await prisma.message.create({
            data: {
                sender_id: sender.id,
                receiver_id: receiver.id,
                subject: `Message ${i + 1} Subject`,
                content: `This is the content of message ${i + 1} from parent to staff member.`,
                status: Math.random() > 0.3 ? 'DELIVERED' : 'SENT',
            }
        });
        messages.push(message);
    }

    console.log(`✅ Created ${messages.length} messages`);
}

async function seedAnnouncements(users: any[], academicYearId: number) {
    console.log('📢 Seeding Announcements...');

    const principal = users.find(u => u.matricule === 'SA001');

    const announcements = await Promise.all([
        prisma.announcement.create({
            data: {
                title: 'School Opening Notice',
                message: 'School will resume on Monday, September 1st, 2024. All students are expected to report by 7:30 AM.',
                audience: 'BOTH',
                academic_year_id: academicYearId,
                created_by_id: principal?.id,
            }
        }),
        prisma.announcement.create({
            data: {
                title: 'Fee Payment Reminder',
                message: 'Parents are reminded that the deadline for fee payment is December 31st, 2024.',
                audience: 'EXTERNAL',
                academic_year_id: academicYearId,
                created_by_id: principal?.id,
            }
        }),
        prisma.announcement.create({
            data: {
                title: 'Staff Meeting',
                message: 'All staff members are required to attend the monthly staff meeting on Friday at 3 PM.',
                audience: 'INTERNAL',
                academic_year_id: academicYearId,
                created_by_id: principal?.id,
            }
        })
    ]);

    console.log(`✅ Created ${announcements.length} announcements`);
}

async function seedInterviewMarks(students: any[], users: any[]) {
    console.log('🎤 Seeding Interview Marks...');

    const vp = users.find(u => u.matricule === 'SA002'); // Vice Principal
    const newStudents = students.filter(s => s.is_new_student);

    const interviews: InterviewMark[] = [];

    for (const student of newStudents.slice(0, 2)) { // Interview 2 new students
        const interview = await prisma.interviewMark.create({
            data: {
                student_id: student.id,
                vp_id: vp?.id || 1,
                marks: Math.floor(Math.random() * 5) + 13, // Marks between 13-18
                notes: `Interview notes for ${student.name}`,
            }
        });
        interviews.push(interview);
    }

    console.log(`✅ Created ${interviews.length} interview marks`);
}

// Execute the seeding
main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 