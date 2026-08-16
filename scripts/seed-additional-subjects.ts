import { PrismaClient, SubjectCategory } from '@prisma/client';

const prisma = new PrismaClient();

type SubjectDef = {
    label: string;
    // Look up by exact name (trimmed match against DB names).
    dbNames: string[];
    // If not found by any of the above names, create with this name/category.
    createAs?: { name: string; category: SubjectCategory };
    // Coefficient assignments per parent Class name; every sub_class of that class gets the link.
    classCoefficients: Array<{ className: string; coefficient: number }>;
};

const SUBJECTS: SubjectDef[] = [
    {
        label: 'English Drill (ED)',
        dbNames: ['English Drill'],
        classCoefficients: [
            { className: 'FORM 1', coefficient: 1 },
            { className: 'FORM 2', coefficient: 1 },
        ],
    },
    {
        label: 'Mathematics Drill (MD)',
        dbNames: ['Maths Drill', 'Mathematics Drill'],
        classCoefficients: [
            { className: 'FORM 1', coefficient: 1 },
            { className: 'FORM 2', coefficient: 1 },
        ],
    },
    {
        label: 'Chinese',
        dbNames: ['Chinese'],
        classCoefficients: [
            { className: 'FORM 1', coefficient: 1 },
            { className: 'FORM 2', coefficient: 1 },
        ],
    },
    {
        label: 'Moral Instructions (MI)',
        dbNames: ['Moral Instructions'],
        classCoefficients: [
            { className: 'FORM 1', coefficient: 1 },
            { className: 'FORM 2', coefficient: 1 },
        ],
    },
    {
        label: 'Citizenship',
        dbNames: ['Citizenship'],
        createAs: { name: 'Citizenship', category: 'HUMAN_AND_SOCIAL_SCIENCE' },
        classCoefficients: [
            { className: 'FORM 1', coefficient: 2 },
            { className: 'FORM 2', coefficient: 2 },
            { className: 'FORM 3', coefficient: 2 },
        ],
    },
    {
        label: 'Human Biology',
        dbNames: ['Human Biology'],
        classCoefficients: [
            { className: 'FORM 4', coefficient: 3 },
            { className: 'FORM 5', coefficient: 3 },
        ],
    },
    {
        label: 'Logic',
        dbNames: ['Logic'],
        classCoefficients: [
            { className: 'FORM 3', coefficient: 2 },
            { className: 'FORM 4', coefficient: 3 },
            { className: 'FORM 5', coefficient: 3 },
        ],
    },
    {
        label: 'Information and Communication Technology (ICT)',
        dbNames: ['Information and Communication Technology', 'ICT', 'ICT mm'],
        classCoefficients: [
            { className: 'LOWER SIXTH ARTS', coefficient: 5 },
            { className: 'LOWER SIXTH SCIENCE', coefficient: 5 },
            { className: 'UPPER SIXTH ARTS', coefficient: 5 },
            { className: 'UPPER SIXTH SCIENCE', coefficient: 5 },
        ],
    },
    {
        label: 'Pure Mathematics (PM)',
        dbNames: ['Pure Mathematics'],
        classCoefficients: [
            { className: 'LOWER SIXTH ARTS', coefficient: 5 },
            { className: 'LOWER SIXTH SCIENCE', coefficient: 5 },
            { className: 'UPPER SIXTH ARTS', coefficient: 5 },
            { className: 'UPPER SIXTH SCIENCE', coefficient: 5 },
        ],
    },
    {
        label: 'Pure Mathematics with Mechanics (PMM)',
        dbNames: ['Pure Mathematics with Mechanics'],
        classCoefficients: [
            { className: 'UPPER SIXTH SCIENCE', coefficient: 5 },
        ],
    },
    {
        label: 'Pure Mathematics with Statistics (PMS)',
        dbNames: ['Pure Mathematics with Statistics'],
        classCoefficients: [
            { className: 'UPPER SIXTH SCIENCE', coefficient: 5 },
            { className: 'UPPER SIXTH ARTS', coefficient: 5 },
        ],
    },
    {
        label: 'Further Mathematics (FM)',
        dbNames: ['Further Mathematics'],
        classCoefficients: [
            { className: 'LOWER SIXTH SCIENCE', coefficient: 5 },
            { className: 'UPPER SIXTH SCIENCE', coefficient: 5 },
        ],
    },
];

async function resolveSubject(def: SubjectDef): Promise<{ id: number; name: string; created: boolean }> {
    const allSubjects = await prisma.subject.findMany();
    const normalized = (s: string) => s.trim().toLowerCase();
    const wanted = def.dbNames.map(normalized);
    const match = allSubjects.find(s => wanted.includes(normalized(s.name)));
    if (match) return { id: match.id, name: match.name.trim(), created: false };
    if (!def.createAs) {
        throw new Error(`Subject "${def.label}" not found in DB and no createAs provided`);
    }
    const created = await prisma.subject.create({ data: def.createAs });
    return { id: created.id, name: created.name, created: true };
}

async function main() {
    console.log('Loading classes with sub-classes...');
    const classes = await prisma.class.findMany({
        include: { sub_classes: { select: { id: true, name: true } } },
    });
    const classByName = new Map(classes.map(c => [c.name.trim().toUpperCase(), c]));

    const summary: string[] = [];
    let totalLinks = 0;
    let createdSubjects = 0;

    for (const def of SUBJECTS) {
        const subject = await resolveSubject(def);
        if (subject.created) {
            createdSubjects++;
            console.log(`  [+] Created subject "${subject.name}" (id=${subject.id})`);
        } else {
            console.log(`  [=] Reusing subject "${subject.name}" (id=${subject.id})`);
        }

        for (const { className, coefficient } of def.classCoefficients) {
            const cls = classByName.get(className.trim().toUpperCase());
            if (!cls) {
                console.warn(`      ! Class "${className}" not found — skipping`);
                continue;
            }
            for (const sub of cls.sub_classes) {
                await prisma.subClassSubject.upsert({
                    where: { sub_class_id_subject_id: { sub_class_id: sub.id, subject_id: subject.id } },
                    update: { coefficient },
                    create: { sub_class_id: sub.id, subject_id: subject.id, coefficient },
                });
                totalLinks++;
            }
            summary.push(`    ${subject.name} -> ${className} (${cls.sub_classes.length} sub-classes) cof=${coefficient}`);
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Subjects created: ${createdSubjects}`);
    console.log(`SubClassSubject links upserted: ${totalLinks}`);
    console.log('\nDetail:');
    summary.forEach(s => console.log(s));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
