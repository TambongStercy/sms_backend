/*
  Warnings:

  - You are about to drop the column `academicYearId` on the `TeacherPeriod` table. All the data in the column will be lost.
  - You are about to drop the `TimeTable` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[day_of_week,start_time,end_time]` on the table `Period` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacher_id,period_id,academic_year_id]` on the table `TeacherPeriod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sub_class_id,period_id,academic_year_id]` on the table `TeacherPeriod` will be added. If there are existing duplicate values, this will fail.
  - Made the column `subject` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TimeTable" DROP CONSTRAINT "TimeTable_sub_class_id_fkey";

-- DropIndex
DROP INDEX "Period_id_day_of_week_start_time_end_time_key";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deleted_by_receiver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_by_sender" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "subject" SET NOT NULL;

-- AlterTable
ALTER TABLE "TeacherPeriod" DROP COLUMN "academicYearId",
ALTER COLUMN "academic_year_id" DROP DEFAULT;

-- DropTable
DROP TABLE "TimeTable";

-- CreateIndex
CREATE UNIQUE INDEX "Period_day_of_week_start_time_end_time_key" ON "Period"("day_of_week", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPeriod_teacher_id_period_id_academic_year_id_key" ON "TeacherPeriod"("teacher_id", "period_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPeriod_sub_class_id_period_id_academic_year_id_key" ON "TeacherPeriod"("sub_class_id", "period_id", "academic_year_id");

-- RenameIndex
ALTER INDEX "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id_a_ke" RENAME TO "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id__key";
