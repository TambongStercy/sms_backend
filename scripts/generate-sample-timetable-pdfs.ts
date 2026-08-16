import fs from 'fs';
import path from 'path';
import prisma from '../src/config/db';
import * as timetableService from '../src/api/v1/services/timetableService';
import { closeBrowser } from '../src/utils/puppeteerManager';

async function main() {
    const outDir = path.join(process.cwd(), 'uploads', 'samples');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Prefer a subclass that actually has slots so the sample looks populated.
    const anySlot = await prisma.teacherPeriod.findFirst({
        select: { sub_class_id: true, teacher_id: true },
    });
    if (!anySlot) throw new Error('No teacher_period rows found — cannot generate a meaningful sample.');

    const subclass = await prisma.subClass.findUnique({
        where: { id: anySlot.sub_class_id },
        include: { class: true },
    });
    const teacher = await prisma.user.findUnique({ where: { id: anySlot.teacher_id }, select: { id: true, name: true } });
    if (!subclass || !teacher) throw new Error('Could not resolve sample subclass/teacher.');

    console.log(`Generating subclass sample: ${subclass.class.name} — ${subclass.name}`);
    const cls = await timetableService.exportSubclassTimetablePdf(subclass.id);
    const clsPath = path.join(outDir, 'sample-class-timetable.pdf');
    fs.writeFileSync(clsPath, cls.buffer);
    console.log(`  -> ${clsPath} (${cls.buffer.length} bytes)`);

    console.log(`Generating teacher sample: ${teacher.name}`);
    const tt = await timetableService.exportTeacherTimetablePdf(teacher.id);
    const ttPath = path.join(outDir, 'sample-teacher-timetable.pdf');
    fs.writeFileSync(ttPath, tt.buffer);
    console.log(`  -> ${ttPath} (${tt.buffer.length} bytes)`);
}

main()
    .catch(e => { console.error(e); process.exitCode = 1; })
    .finally(async () => {
        await closeBrowser();
        await prisma.$disconnect();
    });
