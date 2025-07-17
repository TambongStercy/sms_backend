/*
  Warnings:

  - You are about to drop the column `coefficient` on the `TeacherPeriod` table. All the data in the column will be lost.
  - You are about to drop the column `periods_per_week` on the `TeacherPeriod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TeacherPeriod" DROP COLUMN "coefficient",
DROP COLUMN "periods_per_week";
