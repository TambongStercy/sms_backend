// src/tests/studentStatus.test.ts
// Test imports - requires test framework to be set up
// import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getStudentStatus, shouldPayNewStudentFees, StudentStatus } from '../utils/studentStatus';
import prisma from '../config/db';

describe('Student Status System', () => {
    let testStudentId: number;
    let testAcademicYearId: number;
    let secondAcademicYearId: number;
    let testSubClassId: number;

    beforeAll(async () => {
        // Create test academic years
        const academicYear1 = await prisma.academicYear.create({
            data: {
                name: 'Test Year 1',
                start_date: new Date('2023-09-01'),
                end_date: new Date('2024-06-30')
            }
        });
        testAcademicYearId = academicYear1.id;

        const academicYear2 = await prisma.academicYear.create({
            data: {
                name: 'Test Year 2',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2025-06-30')
            }
        });
        secondAcademicYearId = academicYear2.id;

        // Create test class and subclass
        const testClass = await prisma.class.create({
            data: {
                name: 'Test Class',
                base_fee: 75000,
                miscellaneous_fee: 5000,
                first_term_fee: 15000,
                second_term_fee: 15000,
                third_term_fee: 15000,
                new_student_fee: 10000,
                old_student_fee: 5000
            }
        });

        const testSubClass = await prisma.subClass.create({
            data: {
                name: 'Test SubClass A',
                class_id: testClass.id
            }
        });
        testSubClassId = testSubClass.id;

        // Create test student
        const testStudent = await prisma.student.create({
            data: {
                matricule: 'TEST001',
                name: 'Test Student',
                date_of_birth: new Date('2010-01-01'),
                place_of_birth: 'Test City',
                gender: 'Male',
                residence: 'Test Address',
                former_school: 'Test Primary School'
            }
        });
        testStudentId = testStudent.id;
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.enrollment.deleteMany({
            where: { student_id: testStudentId }
        });
        await prisma.student.delete({
            where: { id: testStudentId }
        });
        await prisma.subClass.delete({
            where: { id: testSubClassId }
        });
        await prisma.class.deleteMany({
            where: { name: 'Test Class' }
        });
        await prisma.academicYear.deleteMany({
            where: {
                OR: [
                    { id: testAcademicYearId },
                    { id: secondAcademicYearId }
                ]
            }
        });
        await prisma.$disconnect();
    });

    describe('New Student', () => {
        it('should identify a new student correctly', async () => {
            // Create first enrollment
            await prisma.enrollment.create({
                data: {
                    student_id: testStudentId,
                    sub_class_id: testSubClassId,
                    academic_year_id: testAcademicYearId,
                    repeater: false
                }
            });

            // Update student with first enrollment year
            await prisma.student.update({
                where: { id: testStudentId },
                data: { first_enrollment_year_id: testAcademicYearId }
            });

            const status = await getStudentStatus(testStudentId, testAcademicYearId);

            expect(status.status).toBe(StudentStatus.NEW);
            expect(status.isNewToSchool).toBe(true);
            expect(status.isRepeater).toBe(false);
            expect(status.yearsInSchool).toBe(1);
            expect(status.previousEnrollments).toBe(0);
        });

        it('should pay new student fees', async () => {
            const shouldPayNew = await shouldPayNewStudentFees(testStudentId, testAcademicYearId);
            expect(shouldPayNew).toBe(true);
        });
    });

    describe('Old Student (Returning)', () => {
        it('should identify a returning student correctly', async () => {
            // Create second enrollment (returning student)
            await prisma.enrollment.create({
                data: {
                    student_id: testStudentId,
                    sub_class_id: testSubClassId,
                    academic_year_id: secondAcademicYearId,
                    repeater: false
                }
            });

            const status = await getStudentStatus(testStudentId, secondAcademicYearId);

            expect(status.status).toBe(StudentStatus.OLD);
            expect(status.isNewToSchool).toBe(false);
            expect(status.isRepeater).toBe(false);
            expect(status.yearsInSchool).toBe(2);
            expect(status.previousEnrollments).toBe(1);
        });

        it('should pay old student fees', async () => {
            const shouldPayNew = await shouldPayNewStudentFees(testStudentId, secondAcademicYearId);
            expect(shouldPayNew).toBe(false);
        });
    });

    describe('Repeater Student', () => {
        it('should identify a repeater correctly', async () => {
            // Update enrollment to be a repeater
            await prisma.enrollment.update({
                where: {
                    student_id_sub_class_id_academic_year_id: {
                        student_id: testStudentId,
                        sub_class_id: testSubClassId,
                        academic_year_id: secondAcademicYearId
                    }
                },
                data: { repeater: true }
            });

            const status = await getStudentStatus(testStudentId, secondAcademicYearId);

            expect(status.status).toBe(StudentStatus.REPEATER);
            expect(status.isNewToSchool).toBe(false);
            expect(status.isRepeater).toBe(true);
            expect(status.yearsInSchool).toBe(2);
        });

        it('should pay old student fees (repeaters are not new)', async () => {
            const shouldPayNew = await shouldPayNewStudentFees(testStudentId, secondAcademicYearId);
            expect(shouldPayNew).toBe(false);
        });
    });
});
