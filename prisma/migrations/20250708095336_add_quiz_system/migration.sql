/*
  Warnings:

  - Added the required column `class_id` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "class_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "QuizTemplate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject_id" INTEGER NOT NULL,
    "class_ids" JSONB NOT NULL,
    "time_limit" INTEGER,
    "total_marks" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_by_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL DEFAULT 'MCQ',
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSubmission" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "score" INTEGER,
    "total_marks" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION,
    "time_taken" INTEGER,
    "status" "QuizStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResponse" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_answer" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "marks_earned" INTEGER NOT NULL DEFAULT 0,
    "time_spent" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizTemplate_subject_id_idx" ON "QuizTemplate"("subject_id");

-- CreateIndex
CREATE INDEX "QuizTemplate_academic_year_id_idx" ON "QuizTemplate"("academic_year_id");

-- CreateIndex
CREATE INDEX "QuizTemplate_is_active_idx" ON "QuizTemplate"("is_active");

-- CreateIndex
CREATE INDEX "QuizQuestion_quiz_id_idx" ON "QuizQuestion"("quiz_id");

-- CreateIndex
CREATE INDEX "QuizSubmission_quiz_id_idx" ON "QuizSubmission"("quiz_id");

-- CreateIndex
CREATE INDEX "QuizSubmission_student_id_idx" ON "QuizSubmission"("student_id");

-- CreateIndex
CREATE INDEX "QuizSubmission_parent_id_idx" ON "QuizSubmission"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSubmission_quiz_id_student_id_academic_year_id_key" ON "QuizSubmission"("quiz_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "QuizResponse_submission_id_idx" ON "QuizResponse"("submission_id");

-- CreateIndex
CREATE INDEX "QuizResponse_question_id_idx" ON "QuizResponse"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResponse_submission_id_question_id_key" ON "QuizResponse"("submission_id", "question_id");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizTemplate" ADD CONSTRAINT "QuizTemplate_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizTemplate" ADD CONSTRAINT "QuizTemplate_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizTemplate" ADD CONSTRAINT "QuizTemplate_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "QuizTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "QuizTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "QuizSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
