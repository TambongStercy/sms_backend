/*
  Warnings:

  - You are about to drop the column `marks_earned` on the `QuizResponse` table. All the data in the column will be lost.
  - You are about to drop the column `selected_answer` on the `QuizResponse` table. All the data in the column will be lost.
  - You are about to drop the column `time_spent` on the `QuizResponse` table. All the data in the column will be lost.
  - Added the required column `answer` to the `QuizResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `QuizResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "QuizStatus" ADD VALUE 'GRADED';

-- DropIndex
DROP INDEX "QuizResponse_submission_id_question_id_key";

-- AlterTable
ALTER TABLE "QuizResponse" DROP COLUMN "marks_earned",
DROP COLUMN "selected_answer",
DROP COLUMN "time_spent",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "marks_awarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "is_correct" DROP NOT NULL,
ALTER COLUMN "is_correct" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ControlSchoolFees" (
    "id" SERIAL NOT NULL,
    "amount_expected" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "academic_year_id" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "is_new_student" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlSchoolFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlPaymentTransaction" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "receipt_number" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,
    "recorded_by_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "control_fee_id" INTEGER NOT NULL,

    CONSTRAINT "ControlPaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncMetadata" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "server_type" TEXT NOT NULL,
    "server_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "sync_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "conflicts" TEXT,
    "errors" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ControlSchoolFees_enrollment_id_academic_year_id_key" ON "ControlSchoolFees"("enrollment_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "SyncLog_sync_id_idx" ON "SyncLog"("sync_id");

-- CreateIndex
CREATE INDEX "SyncLog_start_time_idx" ON "SyncLog"("start_time");

-- AddForeignKey
ALTER TABLE "ControlSchoolFees" ADD CONSTRAINT "ControlSchoolFees_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlSchoolFees" ADD CONSTRAINT "ControlSchoolFees_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPaymentTransaction" ADD CONSTRAINT "ControlPaymentTransaction_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPaymentTransaction" ADD CONSTRAINT "ControlPaymentTransaction_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPaymentTransaction" ADD CONSTRAINT "ControlPaymentTransaction_control_fee_id_fkey" FOREIGN KEY ("control_fee_id") REFERENCES "ControlSchoolFees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPaymentTransaction" ADD CONSTRAINT "ControlPaymentTransaction_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
