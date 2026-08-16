import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const ACADEMIC_YEAR_ID = 2; // 2026-2027
const FORM_4_CLASS_ID = 4;

async function main() {
  const klass = await prisma.class.findUnique({ where: { id: FORM_4_CLASS_ID } });
  if (!klass) throw new Error(`Class ${FORM_4_CLASS_ID} not found`);
  if (!klass.base_fee || klass.base_fee <= 0) {
    throw new Error(`Class ${klass.name} has no base_fee configured`);
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      academic_year_id: ACADEMIC_YEAR_ID,
      class_id: FORM_4_CLASS_ID,
      school_fees: { none: { academic_year_id: ACADEMIC_YEAR_ID } },
    },
    select: { id: true, student: { select: { name: true, matricule: true } } },
  });

  console.log(`Found ${enrollments.length} Form 4 enrollments missing SchoolFees for AY ${ACADEMIC_YEAR_ID}`);
  console.log(`Fee to set: amount_expected = ${klass.base_fee} (${klass.name}.base_fee)`);

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  let created = 0;

  for (const e of enrollments) {
    await prisma.schoolFees.create({
      data: {
        enrollment_id: e.id,
        amount_expected: klass.base_fee,
        amount_paid: 0,
        due_date: dueDate,
        academic_year_id: ACADEMIC_YEAR_ID,
      },
    });
    created += 1;
    if (created % 25 === 0) console.log(`  ... ${created} created`);
  }

  console.log(`DONE. Created ${created} SchoolFees rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
