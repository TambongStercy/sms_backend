/*
  Warnings:

  - You are about to drop the column `grade` on the `Mark` table. All the data in the column will be lost.
  - Added the required column `teacher_id` to the `Mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `main_teacher_id` to the `SubClass_Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "grade",
ADD COLUMN     "teacher_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student_SubClass_Year" ADD COLUMN     "repeater" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SubClass_Subject" ADD COLUMN     "main_teacher_id" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Grade";

-- AddForeignKey
ALTER TABLE "SubClass_Subject" ADD CONSTRAINT "SubClass_Subject_main_teacher_id_fkey" FOREIGN KEY ("main_teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
