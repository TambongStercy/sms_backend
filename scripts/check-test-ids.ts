import prisma from '../src/config/db';

async function checkActualIds() {
    console.log('=== ACTUAL DATABASE IDs FOR TEST SCRIPT ===\n');

    // Academic Years
    const academicYears = await prisma.academicYear.findMany({
        select: { id: true, name: true, is_current: true }
    });
    console.log('📅 ACADEMIC YEARS:');
    academicYears.forEach(year => {
        console.log(`- ID: ${year.id}, Name: ${year.name}, Current: ${year.is_current}`);
    });

    // Students (first 5)
    const students = await prisma.student.findMany({
        select: { id: true, name: true, matricule: true },
        take: 5
    });
    console.log('\n👨‍🎓 STUDENTS (first 5):');
    students.forEach(student => {
        console.log(`- ID: ${student.id}, Name: ${student.name}, Matricule: ${student.matricule}`);
    });

    // Subjects (first 5)
    const subjects = await prisma.subject.findMany({
        select: { id: true, name: true },
        take: 5
    });
    console.log('\n📚 SUBJECTS (first 5):');
    subjects.forEach(subject => {
        console.log(`- ID: ${subject.id}, Name: ${subject.name}`);
    });

    // Classes
    const classes = await prisma.class.findMany({
        select: { id: true, name: true }
    });
    console.log('\n🏫 CLASSES:');
    classes.forEach(cls => {
        console.log(`- ID: ${cls.id}, Name: ${cls.name}`);
    });

    // Subclasses (first 5)
    const subclasses = await prisma.subClass.findMany({
        select: { id: true, name: true, class_id: true },
        take: 5
    });
    console.log('\n📋 SUBCLASSES (first 5):');
    subclasses.forEach(subclass => {
        console.log(`- ID: ${subclass.id}, Name: ${subclass.name}, ClassId: ${subclass.class_id}`);
    });

    // Enrollments (first 5)
    const enrollments = await prisma.enrollment.findMany({
        select: { id: true, student_id: true, class_id: true, sub_class_id: true },
        take: 5
    });
    console.log('\n📝 ENROLLMENTS (first 5):');
    enrollments.forEach(enrollment => {
        console.log(`- ID: ${enrollment.id}, StudentId: ${enrollment.student_id}, ClassId: ${enrollment.class_id}, SubClassId: ${enrollment.sub_class_id}`);
    });

    // Current Academic Year ID
    const currentYear = await prisma.academicYear.findFirst({
        where: { is_current: true }
    });
    console.log(`\n🎯 CURRENT ACADEMIC YEAR ID: ${currentYear?.id || 'None'}`);

    await prisma.$disconnect();
}

checkActualIds().catch(console.error); 