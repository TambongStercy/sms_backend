import prisma from '../src/config/db';

async function main() {
    const before = await prisma.period.count({ where: { type: 'PREP' } });
    console.log(`PREP periods before: ${before}`);
    if (before === 0) {
        console.log('Nothing to migrate.');
        return;
    }
    const res = await prisma.period.updateMany({
        where: { type: 'PREP' },
        data: { type: 'TEACHING', is_break: false },
    });
    console.log(`Updated ${res.count} periods PREP -> TEACHING`);
    const after = await prisma.period.count({ where: { type: 'PREP' } });
    console.log(`PREP periods after: ${after}`);
}

main()
    .catch(e => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
