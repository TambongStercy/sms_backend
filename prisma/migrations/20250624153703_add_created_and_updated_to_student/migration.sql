-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EXPRESS_UNION', 'CCA', 'F3DC');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('INTERNAL', 'EXTERNAL', 'BOTH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'LONG_ANSWER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'TEACHER', 'DISCIPLINE_MASTER', 'GUIDANCE_COUNSELOR', 'PARENT');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Female', 'Male');

-- CreateEnum
CREATE TYPE "SubjectCategory" AS ENUM ('SCIENCE_AND_TECHNOLOGY', 'LANGUAGES_AND_LITERATURE', 'HUMAN_AND_SOCIAL_SCIENCE', 'OTHERS');

-- CreateEnum
CREATE TYPE "AverageStatus" AS ENUM ('PENDING', 'CALCULATED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "ExamSequenceStatus" AS ENUM ('OPEN', 'CLOSED', 'FINALIZED', 'REPORTS_GENERATING', 'REPORTS_AVAILABLE', 'REPORTS_FAILED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SINGLE_STUDENT', 'SUBCLASS');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "photo" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id_card_num" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "matricule" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentStudent" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "base_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "miscellaneous_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "new_student_add_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "old_student_add_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "first_term_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "second_term_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "third_term_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubClass" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "class_id" INTEGER NOT NULL,
    "class_master_id" INTEGER,

    CONSTRAINT "SubClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "residence" TEXT NOT NULL,
    "former_school" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "first_enrollment_year_id" INTEGER,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "repeater" BOOLEAN NOT NULL DEFAULT false,
    "photo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sub_class_id" INTEGER NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolFees" (
    "id" SERIAL NOT NULL,
    "amount_expected" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SubjectCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubClassSubject" (
    "id" SERIAL NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "sub_class_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "SubClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectTeacher" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineIssue" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "assigned_by_id" INTEGER NOT NULL,
    "reviewed_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplineIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAbsence" (
    "id" SERIAL NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "teacher_period_id" INTEGER,
    "enrollment_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAbsence" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "teacher_period_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSequence" (
    "id" SERIAL NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "ExamSequenceStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "ExamSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "academic_year_id" INTEGER,
    "fee_deadline" TIMESTAMP(3),

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "exam_sequence_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sub_class_subject_id" INTEGER NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VicePrincipalAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sub_class_id" INTEGER NOT NULL,

    CONSTRAINT "VicePrincipalAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineMasterAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sub_class_id" INTEGER NOT NULL,

    CONSTRAINT "DisciplineMasterAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrincipalAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrincipalAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BursarAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BursarAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" SERIAL NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_break" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherPeriod" (
    "id" SERIAL NOT NULL,
    "subject_teacher_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sub_class_id" INTEGER NOT NULL,

    CONSTRAINT "TeacherPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "receipt_number" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fee_id" INTEGER NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "academic_year_id" INTEGER,
    "date_posted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileNotification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "date_sent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT,
    "topic" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamPaper" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "duration" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamPaperQuestion" (
    "exam_paper_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "order" INTEGER,

    CONSTRAINT "ExamPaperQuestion_pkey" PRIMARY KEY ("exam_paper_id","question_id")
);

-- CreateTable
CREATE TABLE "StudentSequenceAverage" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "exam_sequence_id" INTEGER NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "total_students" INTEGER,
    "decision" TEXT,
    "status" "AverageStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSequenceAverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" SERIAL NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "exam_sequence_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "student_id" INTEGER,
    "sub_class_id" INTEGER,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "file_path" TEXT,
    "error_message" TEXT,
    "page_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_id_key" ON "AcademicYear"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricule_key" ON "User"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_academic_year_id_key" ON "UserRole"("user_id", "role", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParentStudent_parent_id_student_id_key" ON "ParentStudent"("parent_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Class_id_key" ON "Class"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SubClass_id_key" ON "SubClass"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_id_key" ON "Student"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_student_id_sub_class_id_academic_year_id_key" ON "Enrollment"("student_id", "sub_class_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolFees_enrollment_id_academic_year_id_key" ON "SchoolFees"("enrollment_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_id_key" ON "Subject"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SubClassSubject_sub_class_id_subject_id_key" ON "SubClassSubject"("sub_class_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTeacher_subject_id_teacher_id_key" ON "SubjectTeacher"("subject_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineIssue_id_key" ON "DisciplineIssue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAbsence_enrollment_id_teacher_period_id_key" ON "StudentAbsence"("enrollment_id", "teacher_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAbsence_teacher_id_teacher_period_id_key" ON "TeacherAbsence"("teacher_id", "teacher_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSequence_sequence_number_term_id_academic_year_id_key" ON "ExamSequence"("sequence_number", "term_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Term_start_date_end_date_academic_year_id_key" ON "Term"("start_date", "end_date", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Mark_exam_sequence_id_enrollment_id_sub_class_subject_id_key" ON "Mark"("exam_sequence_id", "enrollment_id", "sub_class_subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "VicePrincipalAssignment_user_id_sub_class_id_academic_year__key" ON "VicePrincipalAssignment"("user_id", "sub_class_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineMasterAssignment_user_id_sub_class_id_academic_ye_key" ON "DisciplineMasterAssignment"("user_id", "sub_class_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrincipalAssignment_academic_year_id_key" ON "PrincipalAssignment"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "BursarAssignment_academic_year_id_key" ON "BursarAssignment"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Period_id_day_of_week_start_time_end_time_key" ON "Period"("id", "day_of_week", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPeriod_subject_teacher_id_period_id_assigned_by_id_a_key" ON "TeacherPeriod"("subject_teacher_id", "period_id", "assigned_by_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSequenceAverage_enrollment_id_exam_sequence_id_key" ON "StudentSequenceAverage"("enrollment_id", "exam_sequence_id");

-- CreateIndex
CREATE INDEX "GeneratedReport_status_idx" ON "GeneratedReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_report_unique" ON "GeneratedReport"("report_type", "exam_sequence_id", "academic_year_id", "student_id");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClass" ADD CONSTRAINT "SubClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClass" ADD CONSTRAINT "SubClass_class_master_id_fkey" FOREIGN KEY ("class_master_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_first_enrollment_year_id_fkey" FOREIGN KEY ("first_enrollment_year_id") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolFees" ADD CONSTRAINT "SchoolFees_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolFees" ADD CONSTRAINT "SchoolFees_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClassSubject" ADD CONSTRAINT "SubClassSubject_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClassSubject" ADD CONSTRAINT "SubClassSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClassSubject" ADD CONSTRAINT "SubClassSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_teacher_period_id_fkey" FOREIGN KEY ("teacher_period_id") REFERENCES "TeacherPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAbsence" ADD CONSTRAINT "TeacherAbsence_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAbsence" ADD CONSTRAINT "TeacherAbsence_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAbsence" ADD CONSTRAINT "TeacherAbsence_teacher_period_id_fkey" FOREIGN KEY ("teacher_period_id") REFERENCES "TeacherPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSequence" ADD CONSTRAINT "ExamSequence_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSequence" ADD CONSTRAINT "ExamSequence_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_exam_sequence_id_fkey" FOREIGN KEY ("exam_sequence_id") REFERENCES "ExamSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_sub_class_subject_id_fkey" FOREIGN KEY ("sub_class_subject_id") REFERENCES "SubClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VicePrincipalAssignment" ADD CONSTRAINT "VicePrincipalAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VicePrincipalAssignment" ADD CONSTRAINT "VicePrincipalAssignment_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VicePrincipalAssignment" ADD CONSTRAINT "VicePrincipalAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineMasterAssignment" ADD CONSTRAINT "DisciplineMasterAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineMasterAssignment" ADD CONSTRAINT "DisciplineMasterAssignment_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineMasterAssignment" ADD CONSTRAINT "DisciplineMasterAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrincipalAssignment" ADD CONSTRAINT "PrincipalAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrincipalAssignment" ADD CONSTRAINT "PrincipalAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BursarAssignment" ADD CONSTRAINT "BursarAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BursarAssignment" ADD CONSTRAINT "BursarAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_subject_teacher_id_fkey" FOREIGN KEY ("subject_teacher_id") REFERENCES "SubjectTeacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "SchoolFees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobileNotification" ADD CONSTRAINT "MobileNotification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPaper" ADD CONSTRAINT "ExamPaper_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPaper" ADD CONSTRAINT "ExamPaper_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPaperQuestion" ADD CONSTRAINT "ExamPaperQuestion_exam_paper_id_fkey" FOREIGN KEY ("exam_paper_id") REFERENCES "ExamPaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPaperQuestion" ADD CONSTRAINT "ExamPaperQuestion_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSequenceAverage" ADD CONSTRAINT "StudentSequenceAverage_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSequenceAverage" ADD CONSTRAINT "StudentSequenceAverage_exam_sequence_id_fkey" FOREIGN KEY ("exam_sequence_id") REFERENCES "ExamSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_exam_sequence_id_fkey" FOREIGN KEY ("exam_sequence_id") REFERENCES "ExamSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
