/*
  Warnings:

  - You are about to drop the column `period_id` on the `ExamPaper` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,day_of_week,start_time,end_time]` on the table `Period` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `ExamPaper` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `grade` on the `Mark` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `sub_class_id` to the `SubTeach_Period_Year` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('AP', 'A', 'BP', 'B', 'CP', 'C', 'DP', 'D', 'F');

-- DropForeignKey
ALTER TABLE "ExamPaper" DROP CONSTRAINT "ExamPaper_period_id_fkey";

-- DropIndex
DROP INDEX "Period_id_day_of_week_start_time_key";

-- AlterTable
ALTER TABLE "ExamPaper" DROP COLUMN "period_id",
ADD COLUMN     "duration" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "grade",
ADD COLUMN     "grade" "Grade" NOT NULL;

-- AlterTable
ALTER TABLE "SubTeach_Period_Year" ADD COLUMN     "sub_class_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "photo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Period_id_day_of_week_start_time_end_time_key" ON "Period"("id", "day_of_week", "start_time", "end_time");

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
