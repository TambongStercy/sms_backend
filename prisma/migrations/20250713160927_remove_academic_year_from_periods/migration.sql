/*
  Warnings:

  - You are about to drop the column `academic_year_id` on the `TeacherPeriod` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacher_id,subject_id,period_id,sub_class_id]` on the table `TeacherPeriod` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TeacherPeriod" DROP CONSTRAINT "TeacherPeriod_academic_year_id_fkey";

-- DropIndex
DROP INDEX "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id__key";

-- AlterTable
ALTER TABLE "TeacherPeriod" DROP COLUMN "academic_year_id",
ADD COLUMN     "academicYearId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id_key" ON "TeacherPeriod"("teacher_id", "subject_id", "period_id", "sub_class_id");

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
