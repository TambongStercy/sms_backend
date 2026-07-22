/*
 * Reset passwords for the two SSIC MANAGER accounts to easy-to-memorize ones.
 */

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL_PRODUCTION) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_PRODUCTION;
}

const prisma = new PrismaClient();

async function resetPassword(email, plain) {
    const hashed = await bcrypt.hash(plain, 10);
    const user = await prisma.user.update({
        where: { email },
        data: { password: hashed },
        select: { id: true, email: true, name: true, matricule: true },
    });
    return { ...user, password: plain };
}

async function main() {
    const results = [
        await resetPassword('mairongfn@gmail.com', 'Manager@2026'),
        await resetPassword('enah.marcel@yahoo.com', 'Manager@2026'),
    ];

    console.log('\n=== SSIC MANAGER credentials ===');
    for (const r of results) {
        console.log(`- Email:     ${r.email}`);
        console.log(`  Name:      ${r.name}`);
        console.log(`  Matricule: ${r.matricule}`);
        console.log(`  Password:  ${r.password}\n`);
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
