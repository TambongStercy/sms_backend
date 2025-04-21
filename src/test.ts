import * as dotenv from 'dotenv';
import { getAllStudentsWithCurrentEnrollment } from './api/v1/services/studentService';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

async function testServices() {
    try {
        console.log("Testing getAllStudentsWithCurrentEnrollment...");
        const students = await getAllStudentsWithCurrentEnrollment();

        console.log(`Retrieved ${students.data.length} students with their current enrollments:`);
        students.data.forEach(student => {
            console.log(`- ${student.name} (ID: ${student.id})`);
            if (student.enrollments.length > 0) {
                const enrollment = student.enrollments[0];
                console.log(`  Enrolled in ${enrollment.sub_class.class.name} ${enrollment.sub_class.name}`);
            } else {
                console.log("  Not currently enrolled");
            }
        });

        console.log("Test completed successfully!");
    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

testServices()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });