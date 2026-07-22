-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'EXPRESS_UNION', 'CCA', 'F3DC');

-- CreateTable
CREATE TABLE "Refund" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "school_fees_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "refund_date" TIMESTAMP(3) NOT NULL,
    "refund_method" "RefundMethod" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "recorded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Refund_enrollment_id_idx" ON "Refund"("enrollment_id");
CREATE INDEX "Refund_school_fees_id_idx" ON "Refund"("school_fees_id");
CREATE INDEX "Refund_refund_date_idx" ON "Refund"("refund_date");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_school_fees_id_fkey" FOREIGN KEY ("school_fees_id") REFERENCES "SchoolFees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
