/*
  Warnings:

  - You are about to drop the column `student_id` on the `DisciplineIssue` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `subclass_id` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `SchoolFees` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `StudentAbsence` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `SubTeach_Period_Year` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_id` on the `SubTeach_Period_Year` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[exam_sequence_id,student_subclass_id,subclass_subject_id]` on the table `Mark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_subclass_id,academic_year_id]` on the table `SchoolFees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_subclass_id,sub_teach_period_year_id]` on the table `StudentAbsence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subject_teachear_id,period_id,assigned_by_id,academic_year_id]` on the table `SubTeach_Period_Year` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_subclass_id` to the `DisciplineIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_subclass_id` to the `Mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subclass_subject_id` to the `Mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_subclass_id` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_subclass_id` to the `SchoolFees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_subclass_id` to the `StudentAbsence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_teachear_id` to the `SubTeach_Period_Year` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DisciplineIssue" DROP CONSTRAINT "DisciplineIssue_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_subclass_id_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_student_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolFees" DROP CONSTRAINT "SchoolFees_student_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentAbsence" DROP CONSTRAINT "StudentAbsence_student_id_fkey";

-- DropForeignKey
ALTER TABLE "SubTeach_Period_Year" DROP CONSTRAINT "SubTeach_Period_Year_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "SubTeach_Period_Year" DROP CONSTRAINT "SubTeach_Period_Year_teacher_id_fkey";

-- DropIndex
DROP INDEX "Mark_exam_sequence_id_student_id_subject_id_key";

-- DropIndex
DROP INDEX "SchoolFees_student_id_academic_year_id_key";

-- DropIndex
DROP INDEX "StudentAbsence_student_id_sub_teach_period_year_id_key";

-- DropIndex
DROP INDEX "SubTeach_Period_Year_subject_id_teacher_id_period_id_assign_key";

-- AlterTable
ALTER TABLE "DisciplineIssue" DROP COLUMN "student_id",
ADD COLUMN     "student_subclass_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "student_id",
DROP COLUMN "subclass_id",
DROP COLUMN "subject_id",
ADD COLUMN     "student_subclass_id" INTEGER NOT NULL,
ADD COLUMN     "subclass_subject_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "student_id",
ADD COLUMN     "student_subclass_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SchoolFees" DROP COLUMN "student_id",
ADD COLUMN     "student_subclass_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentAbsence" DROP COLUMN "student_id",
ADD COLUMN     "student_subclass_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubTeach_Period_Year" DROP COLUMN "subject_id",
DROP COLUMN "teacher_id",
ADD COLUMN     "subject_teachear_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Mark_exam_sequence_id_student_subclass_id_subclass_subject__key" ON "Mark"("exam_sequence_id", "student_subclass_id", "subclass_subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolFees_student_subclass_id_academic_year_id_key" ON "SchoolFees"("student_subclass_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAbsence_student_subclass_id_sub_teach_period_year_id_key" ON "StudentAbsence"("student_subclass_id", "sub_teach_period_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubTeach_Period_Year_subject_teachear_id_period_id_assigned_key" ON "SubTeach_Period_Year"("subject_teachear_id", "period_id", "assigned_by_id", "academic_year_id");

-- AddForeignKey
ALTER TABLE "SchoolFees" ADD CONSTRAINT "SchoolFees_student_subclass_id_fkey" FOREIGN KEY ("student_subclass_id") REFERENCES "Student_SubClass_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_student_subclass_id_fkey" FOREIGN KEY ("student_subclass_id") REFERENCES "Student_SubClass_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_student_subclass_id_fkey" FOREIGN KEY ("student_subclass_id") REFERENCES "Student_SubClass_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_student_subclass_id_fkey" FOREIGN KEY ("student_subclass_id") REFERENCES "Student_SubClass_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_subclass_subject_id_fkey" FOREIGN KEY ("subclass_subject_id") REFERENCES "SubClass_Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_subject_teachear_id_fkey" FOREIGN KEY ("subject_teachear_id") REFERENCES "Subject_Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_student_subclass_id_fkey" FOREIGN KEY ("student_subclass_id") REFERENCES "Student_SubClass_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
