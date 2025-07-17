/*
  Warnings:

  - A unique constraint covering the columns `[user_id,role,academic_year_id]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserRole_user_id_role_key";

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "academic_year_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_academic_year_id_key" ON "UserRole"("user_id", "role", "academic_year_id");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
