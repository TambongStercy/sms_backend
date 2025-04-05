import prisma, { Role, Gender, User } from '../src/config/db';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Define a type that includes user_roles if needed, aligning with findUnique include
type UserWithRoles = User & {
    user_roles: { role: Role }[];
};

async function createSuperManager(): Promise<{ user: User | null, password?: string }> {
    const email = process.env.FIRST_SM_EMAIL || 'supermanager@school.com';
    const password = process.env.FIRST_SM_PASSWORD || 'SuperManager@123';

    try {
        // Check if user already exists
        let existingUser: UserWithRoles | null = await prisma.user.findUnique({
            where: { email: email },
            include: { user_roles: { select: { role: true } } } // Select only the role field
        });

        if (existingUser) {
            console.log(`User with email ${email} already exists (ID: ${existingUser.id}).`);

            // Check if the user already has the SUPER_MANAGER role
            const hasSuperManagerRole = existingUser.user_roles.some(roleInfo => roleInfo.role === Role.SUPER_MANAGER);

            if (!hasSuperManagerRole) {
                console.log('Assigning SUPER_MANAGER role to existing user...');
                await prisma.userRole.create({
                    data: {
                        user_id: existingUser.id,
                        role: Role.SUPER_MANAGER,
                    },
                });
                console.log('SUPER_MANAGER role assigned successfully.');
            } else {
                console.log('User already has the SUPER_MANAGER role.');
            }

            // Return existing user info (password is not available here)
            return { user: existingUser, password: '********' }; // Mask password for existing user

        } else {
            console.log(`User with email ${email} not found. Creating new user...`);
            // Generate a secure password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the user record
            const newUser = await prisma.user.create({
                data: {
                    name: 'Super Manager',
                    email: email,
                    password: hashedPassword,
                    gender: Gender.Male,
                    date_of_birth: new Date('1980-01-01'),
                    phone: '1234567890',
                    address: 'School Address',
                },
            });

            console.log(`New user created with ID: ${newUser.id}. Assigning SUPER_MANAGER role...`);
            // Assign the SUPER_MANAGER role
            await prisma.userRole.create({
                data: {
                    user_id: newUser.id,
                    role: Role.SUPER_MANAGER,
                },
            });

            console.log('Super Manager created and role assigned successfully!');
            console.log('Credentials:');
            console.log(`- Email: ${email}`);
            console.log(`- Password: ${password}`);
            console.log('- User ID:', newUser.id);

            return { user: newUser, password };
        }

    } catch (error) {
        console.error('Error ensuring Super Manager exists:', error);
        // Return null user on error to satisfy the function signature potentially
        return { user: null };
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the function directly if this script is run directly
if (require.main === module) {
    createSuperManager()
        .then(({ user }) => {
            if (user) {
                process.exit(0);
            } else {
                console.error("Super manager creation/verification failed.");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { createSuperManager }; 