/*
  Warnings:

  - You are about to drop the column `academicYearId` on the `TeacherPeriod` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacher_id,subject_id,period_id,sub_class_id,academic_year_id]` on the table `TeacherPeriod` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academic_year_id` to the `TeacherPeriod` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TeacherPeriod" DROP CONSTRAINT "TeacherPeriod_academicYearId_fkey";

-- DropIndex
DROP INDEX "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id_key";

-- AlterTable
ALTER TABLE "TeacherPeriod" ADD COLUMN     "academic_year_id" INTEGER NOT NULL DEFAULT 10;

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id_a_key" ON "TeacherPeriod"("teacher_id", "subject_id", "period_id", "sub_class_id", "academic_year_id");

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
