/*
  Warnings:

  - Added the required column `subclass_id` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mark" ADD COLUMN     "subclass_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
