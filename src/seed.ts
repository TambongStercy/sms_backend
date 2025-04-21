// seed.ts
import { PrismaClient, Role, Gender, SubjectCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

// Configuration
const SALT_ROUNDS = 10;

// --- Seed Data ---

const usersToCreate = [
    { name: 'Super Manager', email: 'super@example.com', password: 'password123', role: Role.SUPER_MANAGER, gender: Gender.Male },
    { name: 'School Manager', email: 'manager@example.com', password: 'password123', role: Role.MANAGER, gender: Gender.Female },
    { name: 'Principal User', email: 'principal@example.com', password: 'password123', role: Role.PRINCIPAL, gender: Gender.Male },
    { name: 'Vice Principal User', email: 'viceprincipal@example.com', password: 'password123', role: Role.VICE_PRINCIPAL, gender: Gender.Female },
    { name: 'Bursar User', email: 'bursar@example.com', password: 'password123', role: Role.BURSAR, gender: Gender.Male },
    { name: 'Teacher One', email: 'teacher1@example.com', password: 'password123', role: Role.TEACHER, gender: Gender.Female },
    { name: 'Teacher Two', email: 'teacher2@example.com', password: 'password123', role: Role.TEACHER, gender: Gender.Male },
    { name: 'Discipline Master', email: 'discipline@example.com', password: 'password123', role: Role.DISCIPLINE_MASTER, gender: Gender.Male },
    { name: 'Guidance Counselor', email: 'guidance@example.com', password: 'password123', role: Role.GUIDANCE_COUNSELOR, gender: Gender.Female },
    { name: 'Parent User', email: 'parent@example.com', password: 'password123', role: Role.PARENT, gender: Gender.Male },
];

const classesAndSubClasses = [
    { name: 'FORM 1', level: 1, subclasses: ['FORM 1N', 'FORM 1M', 'FORM 1MS', 'FORM 1S'] },
    { name: 'FORM 2', level: 2, subclasses: ['FORM 2N', 'FORM 2MN', 'FORM 2M', 'FORM 2S'] },
    { name: 'FORM 3', level: 3, subclasses: ['FORM 3N', 'FORM 3MN', 'FORM 3M', 'FORM 3S'] },
    { name: 'FORM 4', level: 4, subclasses: ['FORM 4N', 'FORM 4M', 'FORM 4MN', 'FORM 4S'] },
    { name: 'FORM 5', level: 5, subclasses: ['FORM 5N', 'FORM 5M', 'FORM 5S'] },
    { name: 'LSA', level: 6, subclasses: ['LSA'] }, // Assuming LSA/LSS/USA/USS are parent classes
    { name: 'LSS', level: 6, subclasses: ['LSS'] },
    { name: 'USA', level: 7, subclasses: ['USA'] },
    { name: 'USS', level: 7, subclasses: ['USS'] },
];

const subjectsToCreate = [
    { name: 'Mathematics', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
    { name: 'Physics', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
    { name: 'Chemistry', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
    { name: 'Biology', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
    { name: 'Computer Science', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
    { name: 'English Language', category: SubjectCategory.LANGUAGES_AND_LITERATURE },
    { name: 'French Language', category: SubjectCategory.LANGUAGES_AND_LITERATURE },
    { name: 'Literature in English', category: SubjectCategory.LANGUAGES_AND_LITERATURE },
    { name: 'History', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
    { name: 'Geography', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
    { name: 'Economics', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
    { name: 'Citizenship', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
    { name: 'Physical Education', category: SubjectCategory.OTHERS },
    { name: 'Art', category: SubjectCategory.OTHERS },
];

async function main() {
    console.log(`Start seeding ...`);

    // --- Seed Users and Roles ---
    const createdCredentials = [];
    console.log(`\nCreating ${usersToCreate.length} users...`);
    for (const u of usersToCreate) {
        const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
        try {
            const user = await prisma.user.create({
                data: {
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    gender: u.gender,
                    date_of_birth: new Date(1990, 0, 1), // Default DOB
                    phone: '123456789', // Default phone
                    address: '123 Main St', // Default address
                },
            });

            // Assign Role (globally, no academic year)
            await prisma.userRole.create({
                data: {
                    user_id: user.id,
                    role: u.role,
                    academic_year_id: null, // Assign globally
                },
            });
            console.log(`Created user ${user.email} with role ${u.role}`);
            createdCredentials.push({ email: user.email, password: u.password });
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.warn(`User with email ${u.email} already exists. Skipping.`);
            } else {
                console.error(`Failed to create user ${u.email}:`, error);
            }
        }
    }

    // --- Seed Classes and SubClasses ---
    console.log(`\nCreating ${classesAndSubClasses.length} classes and their subclasses...`);
    for (const c of classesAndSubClasses) {
        try {
            const createdClass = await prisma.class.create({
                data: {
                    name: c.name,
                    level: c.level,
                    // Add default fee values if needed
                    // base_fee: 50000,
                    // ... other fee fields
                },
            });
            console.log(`Created class: ${createdClass.name}`);

            // Create SubClasses for this Class
            for (const subName of c.subclasses) {
                await prisma.subClass.create({ // Use SubClass (PascalCase) as per schema
                    data: {
                        name: subName,
                        class_id: createdClass.id,
                    },
                });
                console.log(`  Created SubClass: ${subName} for Class ${createdClass.name}`);
            }
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.warn(`Class with name ${c.name} might already exist or related unique constraint failed. Skipping or partial skip.`);
            } else {
                console.error(`Failed to create class ${c.name} or its subclasses:`, error);
            }
        }
    }

    // --- Seed Subjects ---
    console.log(`\nCreating ${subjectsToCreate.length} subjects...`);
    for (const s of subjectsToCreate) {
        try {
            const subject = await prisma.subject.create({
                data: {
                    name: s.name,
                    category: s.category,
                },
            });
            console.log(`Created subject: ${subject.name}`);
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.warn(`Subject with name ${s.name} already exists. Skipping.`);
            } else {
                console.error(`Failed to create subject ${s.name}:`, error);
            }
        }
    }

    console.log(`\nSeeding finished.`);

    // --- Output User Credentials ---
    console.log('\n--- Created User Credentials ---');
    console.table(createdCredentials);
    console.log('--------------------------------\n');

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });