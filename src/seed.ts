// // seed.ts
// import { PrismaClient, Role, Gender, SubjectCategory, DayOfWeek } from '@prisma/client';
// import { faker } from '@faker-js/faker';
// import * as fs from 'fs';
// import * as dotenv from 'dotenv';
// import * as bcrypt from 'bcrypt';
// import { generateStaffMatricule } from './utils/matriculeGenerator';

// // Load environment variables from .env file
// dotenv.config({ path: './.env' });

// const prisma = new PrismaClient();

// // Configuration
// const SALT_ROUNDS = 10;

// // --- Seed Data ---

// const usersToCreate = [
//     { name: 'Super Manager', email: 'super@example.com', password: 'password123', role: Role.SUPER_MANAGER, gender: Gender.Male },
//     { name: 'School Manager', email: 'manager@example.com', password: 'password123', role: Role.MANAGER, gender: Gender.Female },
//     { name: 'Principal User', email: 'principal@example.com', password: 'password123', role: Role.PRINCIPAL, gender: Gender.Male },
//     { name: 'Vice Principal User', email: 'viceprincipal@example.com', password: 'password123', role: Role.VICE_PRINCIPAL, gender: Gender.Female },
//     { name: 'Bursar User', email: 'bursar@example.com', password: 'password123', role: Role.BURSAR, gender: Gender.Male },
//     { name: 'Teacher One', email: 'teacher1@example.com', password: 'password123', role: Role.TEACHER, gender: Gender.Female },
//     { name: 'Teacher Two', email: 'teacher2@example.com', password: 'password123', role: Role.TEACHER, gender: Gender.Male },
//     { name: 'Discipline Master', email: 'discipline@example.com', password: 'password123', role: Role.DISCIPLINE_MASTER, gender: Gender.Male },
//     { name: 'Guidance Counselor', email: 'guidance@example.com', password: 'password123', role: Role.GUIDANCE_COUNSELOR, gender: Gender.Female },
//     { name: 'Parent User', email: 'parent@example.com', password: 'password123', role: Role.PARENT, gender: Gender.Male },
// ];

// // Periods data
// const periodsData = [
//     { name: 'Period 1', start_time: '07:30', end_time: '08:25', is_break: false },
//     { name: 'Period 2', start_time: '08:25', end_time: '09:20', is_break: false },
//     { name: 'Period 3', start_time: '09:20', end_time: '10:15', is_break: false },
//     { name: 'First Break', start_time: '10:15', end_time: '10:30', is_break: true },
//     { name: 'Period 5', start_time: '10:30', end_time: '11:25', is_break: false },
//     { name: 'Period 6', start_time: '11:25', end_time: '12:20', is_break: false },
//     { name: 'Second Break', start_time: '12:20', end_time: '12:50', is_break: true },
//     { name: 'Period 7', start_time: '12:50', end_time: '13:45', is_break: false },
//     { name: 'Period 8', start_time: '13:45', end_time: '14:40', is_break: false },
//     { name: 'Period 9', start_time: '14:40', end_time: '15:35', is_break: false },
//     { name: 'Closing', start_time: '15:35', end_time: '15:45', is_break: true },
//     { name: 'Period 11', start_time: '15:45', end_time: '16:40', is_break: false },
//     { name: 'Period 12', start_time: '16:40', end_time: '17:30', is_break: false },
// ];

// const daysOfWeek: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

// // Academic Year data
// const academicYearData = {
//     name: '2024-2025',
//     start_date: new Date('2024-09-01'),
//     end_date: new Date('2025-07-31')
// };

// // Classes based on Anglophone Cameroon system
// const classesAndSubClasses = [
//     // First Cycle (Forms 1-5) - Common curriculum with slight specialization in Forms 4-5
//     { name: 'FORM 1', level: 1, subclasses: ['FORM 1N', 'FORM 1MN', 'FORM 1M', 'FORM 1MS', 'FORM 1S'] },
//     { name: 'FORM 2', level: 2, subclasses: ['FORM 2N', 'FORM 2MN', 'FORM 2M', 'FORM 2S'] },
//     { name: 'FORM 3', level: 3, subclasses: ['FORM 3N', 'FORM 3MN', 'FORM 3M', 'FORM 3S'] },
//     { name: 'FORM 4', level: 4, subclasses: ['FORM 4N', 'FORM 4M', 'FORM 4MN', 'FORM 4S'] },
//     { name: 'FORM 5', level: 5, subclasses: ['FORM 5N', 'FORM 5M', 'FORM 5S'] },

//     // Second Cycle (Lower Sixth - L6)
//     { name: 'LOWER SIXTH', level: 6, subclasses: ['LSA', 'LSS'] }, // LSA=Arts, LSS=Science

//     // Second Cycle (Upper Sixth - U6)
//     { name: 'UPPER SIXTH', level: 7, subclasses: ['USA', 'USS'] }, // USA=Arts, USS=Science
// ];

// // Subjects based on Anglophone Cameroon curriculum
// const subjectsToCreate = [
//     // Core subjects (Forms 1-5, compulsory)
//     { name: 'English Language', category: SubjectCategory.LANGUAGES_AND_LITERATURE },
//     { name: 'French', category: SubjectCategory.LANGUAGES_AND_LITERATURE },
//     { name: 'Mathematics', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
//     { name: 'History', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
//     { name: 'Geography', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
//     { name: 'Citizenship Education', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
//     { name: 'Physical Education', category: SubjectCategory.OTHERS },
//     { name: 'Religious Studies', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },

//     // Science subjects (Forms 3-5, A-Level Science stream)
//     { name: 'Biology', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
//     { name: 'Physics', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
//     { name: 'Chemistry', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
//     { name: 'Further Mathematics', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
//     { name: 'Computer Science', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },

//     // Arts subjects (Forms 3-5, A-Level Arts stream)
//     { name: 'Literature in English', category: SubjectCategory.LANGUAGES_AND_LITERATURE },
//     { name: 'Economics', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },
//     { name: 'Philosophy', category: SubjectCategory.HUMAN_AND_SOCIAL_SCIENCE },

//     // Optional/Additional subjects
//     { name: 'Music', category: SubjectCategory.OTHERS },
//     { name: 'Agriculture', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
//     { name: 'Home Economics', category: SubjectCategory.OTHERS },
//     { name: 'ICT', category: SubjectCategory.SCIENCE_AND_TECHNOLOGY },
// ];

// // Subject-SubClass mappings based on curriculum structure
// const subjectSubClassMappings = [
//     // Forms 1-3: Common curriculum (all core subjects)
//     { subClass: 'FORM 1N', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Music'] },
//     { subClass: 'FORM 1MN', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Music'] },
//     { subClass: 'FORM 1M', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Music'] },
//     { subClass: 'FORM 1MS', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Music'] },
//     { subClass: 'FORM 1S', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Music'] },

//     { subClass: 'FORM 2N', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Home Economics'] },
//     { subClass: 'FORM 2MN', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Home Economics'] },
//     { subClass: 'FORM 2M', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Home Economics'] },
//     { subClass: 'FORM 2S', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Agriculture', 'Home Economics'] },

//     { subClass: 'FORM 3N', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Literature in English', 'ICT'] },
//     { subClass: 'FORM 3MN', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Literature in English', 'ICT'] },
//     { subClass: 'FORM 3M', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Literature in English', 'ICT'] },
//     { subClass: 'FORM 3S', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'History', 'Geography', 'Citizenship Education', 'Physical Education', 'Religious Studies', 'Literature in English', 'ICT'] },

//     // Forms 4-5: Specialization begins
//     { subClass: 'FORM 4N', subjects: ['English Language', 'French', 'Mathematics', 'History', 'Geography', 'Literature in English', 'Economics', 'Religious Studies', 'Citizenship Education', 'Physical Education'] },
//     { subClass: 'FORM 4M', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Computer Science', 'Citizenship Education', 'Physical Education'] },
//     { subClass: 'FORM 4MN', subjects: ['English Language', 'French', 'Mathematics', 'History', 'Geography', 'Literature in English', 'Economics', 'Religious Studies', 'Citizenship Education', 'Physical Education'] },
//     { subClass: 'FORM 4S', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Computer Science', 'Citizenship Education', 'Physical Education'] },

//     { subClass: 'FORM 5N', subjects: ['English Language', 'French', 'Mathematics', 'History', 'Geography', 'Literature in English', 'Economics', 'Religious Studies', 'Citizenship Education', 'Physical Education'] },
//     { subClass: 'FORM 5M', subjects: ['English Language', 'French', 'Mathematics', 'History', 'Geography', 'Literature in English', 'Economics', 'Religious Studies', 'Citizenship Education', 'Physical Education'] },
//     { subClass: 'FORM 5S', subjects: ['English Language', 'French', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Computer Science', 'Citizenship Education', 'Physical Education'] },

//     // A-Level Science streams (LSS, USS)
//     { subClass: 'LSS', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Computer Science'] },
//     { subClass: 'USS', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Computer Science'] },

//     // A-Level Arts streams (LSA, USA)
//     { subClass: 'LSA', subjects: ['Literature in English', 'History', 'Geography', 'Economics', 'Philosophy', 'French', 'Religious Studies'] },
//     { subClass: 'USA', subjects: ['Literature in English', 'History', 'Geography', 'Economics', 'Philosophy', 'French', 'Religious Studies'] },
// ];

// async function main() {
//     console.log(`Start seeding ...`);

//     // --- Seed Academic Year ---
//     console.log(`\nCreating academic year ${academicYearData.name}...`);
//     let currentAcademicYear;
//     try {
//         currentAcademicYear = await prisma.academicYear.create({
//             data: {
//                 name: academicYearData.name,
//                 start_date: academicYearData.start_date,
//                 end_date: academicYearData.end_date,
//                 // Automatically create default terms
//                 terms: {
//                     create: [
//                         {
//                             name: 'Term 1',
//                             start_date: null,
//                             end_date: null,
//                             fee_deadline: null
//                         },
//                         {
//                             name: 'Term 2',
//                             start_date: null,
//                             end_date: null,
//                             fee_deadline: null
//                         },
//                         {
//                             name: 'Term 3',
//                             start_date: null,
//                             end_date: null,
//                             fee_deadline: null
//                         }
//                     ]
//                 }
//             },
//             include: {
//                 terms: true
//             }
//         });
//         console.log(`Created academic year: ${currentAcademicYear.name} (ID: ${currentAcademicYear.id})`);
//         console.log(`Created ${currentAcademicYear.terms.length} default terms for the academic year`);
//     } catch (error: any) {
//         if (error.code === 'P2002') {
//             console.warn(`Academic year ${academicYearData.name} already exists. Fetching existing...`);
//             currentAcademicYear = await prisma.academicYear.findFirst({
//                 where: { name: academicYearData.name },
//                 include: { terms: true }
//             });
//             if (currentAcademicYear) {
//                 console.log(`Using existing academic year: ${currentAcademicYear.name} (ID: ${currentAcademicYear.id})`);
//                 console.log(`Existing academic year has ${currentAcademicYear.terms.length} terms`);
//             }
//         } else {
//             console.error(`Failed to create academic year:`, error);
//             throw error;
//         }
//     }

//     if (!currentAcademicYear) {
//         throw new Error('Failed to create or find academic year. Cannot continue seeding.');
//     }

//     // --- Seed Users and Roles ---
//     const createdCredentials = [];
//     console.log(`\nCreating ${usersToCreate.length} users...`);
//     for (const u of usersToCreate) {
//         const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
//         try {
//             // Generate matricule for the user
//             const matricule = await generateStaffMatricule([u.role]);

//             const user = await prisma.user.create({
//                 data: {
//                     name: u.name,
//                     email: u.email,
//                     password: hashedPassword,
//                     gender: u.gender,
//                     date_of_birth: new Date(1990, 0, 1), // Default DOB
//                     phone: '123456789', // Default phone
//                     address: '123 Main St', // Default address
//                     matricule: matricule,
//                 },
//             });

//             // Assign Role for the current academic year
//             await prisma.userRole.create({
//                 data: {
//                     user_id: user.id,
//                     role: u.role
//                 },
//             });
//             console.log(`Created user ${user.email} with role ${u.role} and matricule ${matricule}`);
//             createdCredentials.push({
//                 email: user.email,
//                 password: u.password,
//                 matricule: matricule,
//                 role: u.role
//             });
//         } catch (error: any) {
//             if (error.code === 'P2002') {
//                 console.warn(`User with email ${u.email} already exists. Skipping.`);
//             } else {
//                 console.error(`Failed to create user ${u.email}:`, error);
//             }
//         }
//     }

//     // --- Seed Classes and SubClasses ---
//     console.log(`\nCreating ${classesAndSubClasses.length} classes and their subclasses...`);
//     for (const c of classesAndSubClasses) {
//         try {
//             const createdClass = await prisma.class.create({
//                 data: {
//                     name: c.name,
//                     // Add default fee values if needed
//                     // base_fee: 50000,
//                     // ... other fee fields
//                 },
//             });
//             console.log(`Created class: ${createdClass.name}`);

//             // Create SubClasses for this Class
//             for (const subName of c.subclasses) {
//                 await prisma.subClass.create({ // Use SubClass (PascalCase) as per schema
//                     data: {
//                         name: subName,
//                         class_id: createdClass.id,
//                     },
//                 });
//                 console.log(`  Created SubClass: ${subName} for Class ${createdClass.name}`);
//             }
//         } catch (error: any) {
//             if (error.code === 'P2002') {
//                 console.warn(`Class with name ${c.name} might already exist or related unique constraint failed. Skipping or partial skip.`);
//             } else {
//                 console.error(`Failed to create class ${c.name} or its subclasses:`, error);
//             }
//         }
//     }

//     // --- Seed Subjects ---
//     console.log(`\nCreating ${subjectsToCreate.length} subjects...`);
//     for (const s of subjectsToCreate) {
//         try {
//             const subject = await prisma.subject.create({
//                 data: {
//                     name: s.name,
//                     category: s.category,
//                 },
//             });
//             console.log(`Created subject: ${subject.name}`);
//         } catch (error: any) {
//             if (error.code === 'P2002') {
//                 console.warn(`Subject with name ${s.name} already exists. Skipping.`);
//             } else {
//                 console.error(`Failed to create subject ${s.name}:`, error);
//             }
//         }
//     }

//     // --- Seed Subject-SubClass Mappings ---
//     console.log(`\nCreating subject-subclass mappings...`);
//     let mappingsCreated = 0;
//     let mappingsSkipped = 0;

//     for (const mapping of subjectSubClassMappings) {
//         try {
//             // Find the subclass by name
//             const subClass = await prisma.subClass.findFirst({
//                 where: { name: mapping.subClass }
//             });

//             if (!subClass) {
//                 console.warn(`SubClass ${mapping.subClass} not found. Skipping mapping.`);
//                 continue;
//             }

//             // Map each subject to the subclass
//             for (const subjectName of mapping.subjects) {
//                 try {
//                     // Find the subject by name
//                     const subject = await prisma.subject.findFirst({
//                         where: { name: subjectName }
//                     });

//                     if (!subject) {
//                         console.warn(`Subject ${subjectName} not found. Skipping.`);
//                         continue;
//                     }

//                     // Check if mapping already exists
//                     const existingMapping = await prisma.subClassSubject.findFirst({
//                         where: {
//                             sub_class_id: subClass.id,
//                             subject_id: subject.id
//                         }
//                     });

//                     if (existingMapping) {
//                         mappingsSkipped++;
//                         continue;
//                     }

//                     // Create the subject-subclass mapping with default coefficient
//                     await prisma.subClassSubject.create({
//                         data: {
//                             sub_class_id: subClass.id,
//                             subject_id: subject.id,
//                             coefficient: 1.0 // Default coefficient
//                         }
//                     });

//                     mappingsCreated++;
//                     console.log(`  Mapped subject "${subjectName}" to subclass "${mapping.subClass}"`);
//                 } catch (error: any) {
//                     if (error.code === 'P2002') {
//                         mappingsSkipped++;
//                         console.log(`  Mapping ${subjectName} -> ${mapping.subClass} already exists`);
//                     } else {
//                         console.error(`Error mapping subject ${subjectName} to ${mapping.subClass}:`, error);
//                     }
//                 }
//             }
//         } catch (error: any) {
//             console.error(`Error processing mapping for ${mapping.subClass}:`, error);
//         }
//     }

//     console.log(`Subject-SubClass mappings completed. Created ${mappingsCreated} mappings, skipped ${mappingsSkipped} existing mappings.`);

//     // --- Seed Periods ---
//     console.log(`\nCreating periods for ${daysOfWeek.length} days...`);
//     let periodsCreated = 0;
//     let periodsSkipped = 0;

//     for (const day of daysOfWeek) {
//         for (const period of periodsData) {
//             try {
//                 // Check if period already exists
//                 const existingPeriod = await prisma.period.findFirst({
//                     where: {
//                         day_of_week: day,
//                         name: period.name,
//                         start_time: period.start_time,
//                         end_time: period.end_time
//                     }
//                 });

//                 if (existingPeriod) {
//                     console.log(`Skipping period (already exists): ${day} ${period.name}`);
//                     periodsSkipped++;
//                     continue;
//                 }

//                 // Create period
//                 await prisma.period.create({
//                     data: {
//                         name: period.name,
//                         day_of_week: day,
//                         start_time: period.start_time,
//                         end_time: period.end_time,
//                         is_break: period.is_break
//                     }
//                 });

//                 console.log(`Created period: ${day} ${period.name}`);
//                 periodsCreated++;
//             } catch (error: any) {
//                 if (error.code === 'P2002') {
//                     console.warn(`Period ${day} ${period.name} might already exist. Skipping.`);
//                     periodsSkipped++;
//                 } else {
//                     console.error(`Error creating period ${day} ${period.name}:`, error);
//                 }
//             }
//         }
//     }

//     console.log(`Periods seeding completed. Created ${periodsCreated} periods, skipped ${periodsSkipped} existing periods.`);

//     console.log(`\nSeeding finished.`);

//     // --- Output User Credentials ---
//     console.log('\n--- Created User Credentials ---');
//     console.table(createdCredentials);
//     console.log('--------------------------------\n');

// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });