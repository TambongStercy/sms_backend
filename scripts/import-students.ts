import { PrismaClient, Gender } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Create a Prisma client instance
const prisma = new PrismaClient();

// Interface for student data from JSON
interface StudentData {
    matricule: string;
    name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    residence: string;
    former_school: string;
}

async function importStudents() {
    try {
        // Read the students data from the JSON file
        const studentsDataPath = path.join(__dirname, 'students-data.json');
        const studentsJsonData = fs.readFileSync(studentsDataPath, 'utf8');
        const studentsData: StudentData[] = JSON.parse(studentsJsonData);

        console.log(`Found ${studentsData.length} students to import.`);

        // Loop through each student and create them in the database
        for (const studentData of studentsData) {
            // Convert gender string to Gender enum
            const genderEnum = studentData.gender === 'Male' ? Gender.Male : Gender.Female;

            // Create the student in the database
            const student = await prisma.student.create({
                data: {
                    matricule: studentData.matricule,
                    name: studentData.name,
                    date_of_birth: new Date(studentData.date_of_birth),
                    place_of_birth: studentData.place_of_birth,
                    gender: genderEnum,
                    residence: studentData.residence,
                    former_school: studentData.former_school,
                }
            });

            console.log(`Created student: ${student.name} (ID: ${student.id})`);
        }

        console.log('All students imported successfully!');
    } catch (error) {
        console.error('Error importing students:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the function if this script is run directly
if (require.main === module) {
    importStudents()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { importStudents }; 