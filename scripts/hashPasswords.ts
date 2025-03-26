// hashPasswords.ts
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import prisma from '../src/config/db'; // Import the configured PrismaClient

// Load environment variables
dotenv.config();

const SALT_ROUNDS = 10;

async function hashPasswords() {
    try {
        // Get all users
        const users = await prisma.user.findMany();

        if (!users || users.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        console.log(`Found ${users.length} users. Hashing passwords...`);

        // Array to store original credentials
        const credentials: { email: string; role: string; password: string }[] = [];

        // Hash passwords and update users
        for (const user of users) {
            // Store original credentials
            credentials.push({
                email: user.email,
                role: await getUserRole(user.id),
                password: user.password, // Original unhashed password
            });

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            // Update user with hashed password
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        }

        // Write credentials to file
        fs.writeFileSync(
            'test_credentials.json',
            JSON.stringify(credentials, null, 2)
        );

        console.log(`Passwords hashed successfully for ${users.length} users.`);
        console.log('Original credentials saved to test_credentials.json');

    } catch (error) {
        console.error('Error hashing passwords:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function getUserRole(userId: number) {
    const userRole = await prisma.userRole.findFirst({
        where: { user_id: userId }
    });
    return userRole?.role || 'Unknown';
}

// Run the function
hashPasswords(); 