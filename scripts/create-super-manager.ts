import prisma, { Role, Gender } from '../src/config/db';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();


async function createSuperManager() {
    try {
        // Generate a secure password or use a predefined one
        const password = 'SuperManager@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user record
        const user = await prisma.user.create({
            data: {
                name: 'Super Manager',
                email: 'supermanager@school.com',
                password: hashedPassword,
                gender: Gender.Male,
                date_of_birth: new Date('1980-01-01'),
                phone: '1234567890',
                address: 'School Address',
            },
        });

        // Assign the SUPER_MANAGER role
        await prisma.userRole.create({
            data: {
                user_id: user.id,
                role: Role.SUPER_MANAGER,
            },
        });

        console.log('Super Manager created successfully!');
        console.log('Credentials:');
        console.log('- Email: supermanager@school.com');
        console.log('- Password: SuperManager@123');
        console.log('- User ID:', user.id);

        return { user, password };
    } catch (error) {
        console.error('Error creating Super Manager:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the function directly if this script is run directly
if (require.main === module) {
    createSuperManager()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { createSuperManager }; 