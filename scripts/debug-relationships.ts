import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugRelationships() {
    console.log('=== DEBUGGING PARENT-STUDENT RELATIONSHIPS ===\n');

    // Check all users with parent role
    const parents = await prisma.user.findMany({
        where: {
            user_roles: {
                some: {
                    role: 'PARENT'
                }
            }
        },
        include: {
            user_roles: true
        }
    });

    console.log('📋 PARENT USERS:');
    parents.forEach(parent => {
        console.log(`- ID: ${parent.id}, Name: ${parent.name}, Matricule: ${parent.matricule}, Email: ${parent.email}`);
    });

    // Check all parent-student relationships
    const relationships = await prisma.parentStudent.findMany({
        include: {
            parent: { select: { id: true, name: true, matricule: true } },
            student: { select: { id: true, name: true, matricule: true } }
        }
    });

    console.log('\n👨‍👩‍👧‍👦 PARENT-STUDENT RELATIONSHIPS:');
    relationships.forEach(rel => {
        console.log(`- Parent: ${rel.parent.name} (ID: ${rel.parent_id}, Matricule: ${rel.parent.matricule}) → Student: ${rel.student.name} (ID: ${rel.student_id}, Matricule: ${rel.student.matricule})`);
    });

    // Check students
    const students = await prisma.student.findMany({
        orderBy: { id: 'asc' },
        take: 10
    });

    console.log('\n🎓 FIRST 10 STUDENTS:');
    students.forEach(student => {
        console.log(`- ID: ${student.id}, Name: ${student.name}, Matricule: ${student.matricule}`);
    });

    await prisma.$disconnect();
}

debugRelationships().catch(console.error); 