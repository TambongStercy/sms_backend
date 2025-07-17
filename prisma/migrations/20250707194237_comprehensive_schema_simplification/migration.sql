/*
  Warnings:

  - You are about to drop the column `level` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `new_student_add_fee` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `old_student_add_fee` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the `BursarAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DisciplineMasterAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrincipalAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VicePrincipalAssignment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[student_id,academic_year_id]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricule]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issue_type` to the `DisciplineIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recorded_by_id` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('PRINCIPAL', 'VICE_PRINCIPAL', 'DISCIPLINE_MASTER', 'BURSAR', 'HOD');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('NOT_ENROLLED', 'ENROLLED', 'ASSIGNED_TO_CLASS', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DisciplineType" AS ENUM ('MORNING_LATENESS', 'CLASS_ABSENCE', 'MISCONDUCT', 'OTHER');

-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('MORNING_LATENESS', 'CLASS_ABSENCE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'HOD';

-- DropForeignKey
ALTER TABLE "BursarAssignment" DROP CONSTRAINT "BursarAssignment_academic_year_id_fkey";

-- DropForeignKey
ALTER TABLE "BursarAssignment" DROP CONSTRAINT "BursarAssignment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineMasterAssignment" DROP CONSTRAINT "DisciplineMasterAssignment_academic_year_id_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineMasterAssignment" DROP CONSTRAINT "DisciplineMasterAssignment_sub_class_id_fkey";

-- DropForeignKey
ALTER TABLE "DisciplineMasterAssignment" DROP CONSTRAINT "DisciplineMasterAssignment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_sub_class_id_fkey";

-- DropForeignKey
ALTER TABLE "PrincipalAssignment" DROP CONSTRAINT "PrincipalAssignment_academic_year_id_fkey";

-- DropForeignKey
ALTER TABLE "PrincipalAssignment" DROP CONSTRAINT "PrincipalAssignment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "VicePrincipalAssignment" DROP CONSTRAINT "VicePrincipalAssignment_academic_year_id_fkey";

-- DropForeignKey
ALTER TABLE "VicePrincipalAssignment" DROP CONSTRAINT "VicePrincipalAssignment_sub_class_id_fkey";

-- DropForeignKey
ALTER TABLE "VicePrincipalAssignment" DROP CONSTRAINT "VicePrincipalAssignment_user_id_fkey";

-- DropIndex
DROP INDEX "Enrollment_student_id_sub_class_id_academic_year_id_key";

-- AlterTable
ALTER TABLE "AcademicYear" ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "report_deadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "level",
DROP COLUMN "new_student_add_fee",
DROP COLUMN "old_student_add_fee",
ADD COLUMN     "max_students" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "new_student_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "old_student_fee" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DisciplineIssue" ADD COLUMN     "issue_type" "DisciplineType" NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "sub_class_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mark" ALTER COLUMN "score" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "recorded_by_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SchoolFees" ADD COLUMN     "is_new_student" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "amount_paid" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "is_new_student" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'NOT_ENROLLED',
ALTER COLUMN "former_school" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentAbsence" ADD COLUMN     "absence_type" "AbsenceType" NOT NULL DEFAULT 'CLASS_ABSENCE';

-- AlterTable
ALTER TABLE "SubClass" ADD COLUMN     "current_students" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "hod_id" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "total_hours_per_week" INTEGER,
ADD COLUMN     "whatsapp_number" TEXT;

-- DropTable
DROP TABLE "BursarAssignment";

-- DropTable
DROP TABLE "DisciplineMasterAssignment";

-- DropTable
DROP TABLE "PrincipalAssignment";

-- DropTable
DROP TABLE "VicePrincipalAssignment";

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "role_type" "AssignmentRole" NOT NULL,
    "sub_class_id" INTEGER,
    "subject_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeTable" (
    "id" SERIAL NOT NULL,
    "sub_class_id" INTEGER NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "period_time" TEXT NOT NULL,
    "subject_name" TEXT,
    "teacher_name" TEXT,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewMark" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "vp_id" INTEGER NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigned_role" "Role" NOT NULL,
    "fields" JSONB NOT NULL,
    "deadline" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" SERIAL NOT NULL,
    "form_template_id" INTEGER NOT NULL,
    "submitted_by_id" INTEGER NOT NULL,
    "submission_data" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleAssignment_user_id_role_type_academic_year_id_sub_class_key" ON "RoleAssignment"("user_id", "role_type", "academic_year_id", "sub_class_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "TimeTable_sub_class_id_day_of_week_period_time_key" ON "TimeTable"("sub_class_id", "day_of_week", "period_time");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewMark_student_id_key" ON "InterviewMark"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_form_template_id_submitted_by_id_key" ON "FormSubmission"("form_template_id", "submitted_by_id");

-- CreateIndex
CREATE INDEX "AuditLog_table_name_record_id_idx" ON "AuditLog"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_student_id_academic_year_id_key" ON "Enrollment"("student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricule_key" ON "Student"("matricule");

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeTable" ADD CONSTRAINT "TimeTable_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewMark" ADD CONSTRAINT "InterviewMark_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
