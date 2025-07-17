/*
  Warnings:

  - You are about to drop the column `academic_year_id` on the `UserRole` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,role]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_academic_year_id_fkey";

-- DropIndex
DROP INDEX "UserRole_user_id_role_academic_year_id_key";

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "academic_year_id";

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_key" ON "UserRole"("user_id", "role");
