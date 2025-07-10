const prisma = require('./src/config/db').default;

async function checkEnrollments() {
  try {
    // Check current academic year
    const currentYear = await prisma.academicYear.findFirst({
      where: { is_current: true }
    });
    console.log('Current Academic Year:', currentYear);
    
    // Check all academic years
    const allYears = await prisma.academicYear.findMany({
      orderBy: { id: 'desc' }
    });
    console.log('All Academic Years:');
    allYears.forEach(year => {
      console.log(`- ID: ${year.id}, Name: ${year.name}, Current: ${year.is_current}`);
    });
    
    // Check student 239 enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: 239 },
      include: { 
        academic_year: true,
        student: { select: { name: true } }
      }
    });
    console.log('\nStudent 239 Enrollments:');
    enrollments.forEach(enrollment => {
      console.log(`- Year ID: ${enrollment.academic_year_id} (${enrollment.academic_year.name}), Student: ${enrollment.student.name}`);
    });
    
    // Check parent-student relationships for parent 269
    const parentLinks = await prisma.parentStudent.findMany({
      where: { parent_id: 269 },
      include: { 
        student: { select: { id: true, name: true } } 
      }
    });
    console.log('\nParent 269 Children:');
    parentLinks.forEach(link => {
      console.log(`- Student ID: ${link.student.id}, Name: ${link.student.name}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkEnrollments(); 