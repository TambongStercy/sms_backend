/*
  Warnings:

  - Added the required column `fee_id` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "fee_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "SchoolFees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
