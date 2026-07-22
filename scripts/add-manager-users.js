/*
 * One-off script to add / reset MANAGER users in the SSIC production DB.
 *
 * Actions:
 *  - Ensure `mairongfn@gmail.com` exists with MANAGER role, reset its password.
 *  - Create `enah.marcel@yahoo.com` with MANAGER role.
 *  - Prints out both credentials at the end.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Force production DB URL just like src/config/db.ts does when NODE_ENV=production
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL_PRODUCTION) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_PRODUCTION;
}

const prisma = new PrismaClient();

function generatePassword() {
    // 12-char URL-safe password
    return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
}

async function getPositionCodeForRoles(roles) {
    // Simple SA prefix for MANAGER
    if (roles.includes('MANAGER')) return 'SA';
    return 'SO';
}

async function generateStaffMatricule(roles) {
    const year = new Date().getFullYear();
    const yy = year.toString().slice(-2);
    const code = await getPositionCodeForRoles(roles);
    const prefix = `SS${yy}${code}`;
    const last = await prisma.user.findFirst({
        where: { matricule: { startsWith: prefix } },
        orderBy: { matricule: 'desc' },
    });
    let next = 1;
    if (last && last.matricule) {
        const n = parseInt(last.matricule.substring(prefix.length), 10);
        if (!isNaN(n)) next = n + 1;
    }
    return `${prefix}${next.toString().padStart(4, '0')}`;
}

async function upsertManager({ email, name, password }) {
    const hashed = await bcrypt.hash(password, 10);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: { password: hashed },
        });

        const existingRole = await prisma.userRole.findFirst({
            where: { user_id: existing.id, role: 'MANAGER' },
        });
        if (!existingRole) {
            const currentYear = await prisma.academicYear.findFirst({ where: { is_current: true } });
            await prisma.userRole.create({
                data: {
                    user_id: existing.id,
                    role: 'MANAGER',
                    academic_year_id: currentYear ? currentYear.id : null,
                },
            });
        }
        return { id: existing.id, email: existing.email, name: existing.name, matricule: existing.matricule, created: false };
    }

    const matricule = await generateStaffMatricule(['MANAGER']);
    const currentYear = await prisma.academicYear.findFirst({ where: { is_current: true } });

    const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
            data: {
                name,
                email,
                password: hashed,
                gender: 'Male',
                date_of_birth: new Date('1990-01-01'),
                phone: '',
                address: '',
                matricule,
                status: 'ACTIVE',
            },
        });
        await tx.userRole.create({
            data: {
                user_id: u.id,
                role: 'MANAGER',
                academic_year_id: currentYear ? currentYear.id : null,
            },
        });
        return u;
    });

    return { id: user.id, email: user.email, name: user.name, matricule: user.matricule, created: true };
}

async function main() {
    const targets = [
        { email: 'mairongfn@gmail.com', name: 'Mairong' },
        { email: 'enah.marcel@yahoo.com', name: 'Enah Marcel' },
    ];

    const results = [];
    for (const t of targets) {
        const password = generatePassword();
        const info = await upsertManager({ email: t.email, name: t.name, password });
        results.push({ ...info, password });
    }

    console.log('\n=== SSIC MANAGER credentials ===');
    for (const r of results) {
        console.log(`- Email:     ${r.email}`);
        console.log(`  Name:      ${r.name}`);
        console.log(`  Matricule: ${r.matricule}`);
        console.log(`  Password:  ${r.password}`);
        console.log(`  Action:    ${r.created ? 'CREATED' : 'UPDATED (password reset)'}\n`);
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
