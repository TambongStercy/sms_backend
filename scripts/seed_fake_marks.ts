import { PrismaClient, Gender, StudentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const academicYear = await prisma.academicYear.findFirstOrThrow({ where: { is_current: true } });

  const subClass = await prisma.subClass.findFirstOrThrow({
    where: { class: { name: 'FORM 1' } },
    include: { class: true },
    orderBy: { id: 'asc' },
  });

  const teacher = await prisma.user.findFirstOrThrow({
    where: { user_roles: { some: { role: { in: ['SUPER_MANAGER', 'PRINCIPAL', 'TEACHER'] } } } },
    orderBy: { id: 'asc' },
  });

  const examSequences = await prisma.examSequence.findMany({
    where: { academic_year_id: academicYear.id },
    orderBy: { id: 'asc' },
  });

  const student = await prisma.student.upsert({
    where: { matricule: 'PREPROD-STU-001' },
    update: {},
    create: {
      matricule: 'PREPROD-STU-001',
      name: 'DEMO Report Card',
      nom: 'DEMO',
      prenom: 'Report Card',
      date_of_birth: new Date('2012-05-14'),
      place_of_birth: 'Douala',
      gender: Gender.Male,
      residence: 'Bonaberi',
      is_new_student: true,
      status: StudentStatus.ASSIGNED_TO_CLASS,
      first_enrollment_year_id: academicYear.id,
      admission_academic_year_id: academicYear.id,
    },
  });

  const enrollment = await prisma.enrollment.upsert({
    where: {
      // no unique on (student_id, academic_year_id) — search first
      id: (
        await prisma.enrollment.findFirst({
          where: { student_id: student.id, academic_year_id: academicYear.id },
        })
      )?.id ?? 0,
    },
    update: { sub_class_id: subClass.id, class_id: subClass.class_id },
    create: {
      student_id: student.id,
      academic_year_id: academicYear.id,
      class_id: subClass.class_id,
      sub_class_id: subClass.id,
    },
  });

  const subClassSubjects = await prisma.subClassSubject.findMany({
    where: { sub_class_id: subClass.id },
    include: { subject: true },
  });

  let created = 0;
  for (const seq of examSequences) {
    for (const scs of subClassSubjects) {
      const score = Math.round((8 + Math.random() * 10) * 4) / 4; // 8.00 – 18.00 in .25 steps
      await prisma.mark.upsert({
        where: {
          exam_sequence_id_enrollment_id_sub_class_subject_id: {
            exam_sequence_id: seq.id,
            enrollment_id: enrollment.id,
            sub_class_subject_id: scs.id,
          },
        },
        update: { score, teacher_id: teacher.id },
        create: {
          exam_sequence_id: seq.id,
          enrollment_id: enrollment.id,
          sub_class_subject_id: scs.id,
          teacher_id: teacher.id,
          score,
        },
      });
      created++;
    }
  }

  console.log(JSON.stringify({
    student_id: student.id,
    matricule: student.matricule,
    enrollment_id: enrollment.id,
    sub_class_id: subClass.id,
    sub_class_name: `${subClass.class.name} ${subClass.name}`,
    academic_year_id: academicYear.id,
    exam_sequence_ids: examSequences.map(s => s.id),
    marks_upserted: created,
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
