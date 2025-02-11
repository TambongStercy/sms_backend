-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_MANAGER', 'MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'BURSAR', 'TEACHER', 'DISCIPLINE_MASTER', 'GUIDANCE_COUNSELOR', 'PARENT');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Female', 'Male');

-- CreateEnum
CREATE TYPE "SubjectCategory" AS ENUM ('SCIENCE_AND_TECHNOLOGY', 'LANGUAGES_AND_LITERATURE', 'HUMAN_AND_SOCIAL_SCIENCE', 'OTHERS');

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
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
    "photo" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id_card_num" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "Parent_Student" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubClass" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "class_id" INTEGER NOT NULL,

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

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student_SubClass_Year" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subclass_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_SubClass_Year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolFees" (
    "id" SERIAL NOT NULL,
    "amount_expected" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "student_id" INTEGER NOT NULL,
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
CREATE TABLE "SubClass_Subject" (
    "id" SERIAL NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "subclass_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubClass_Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject_Teacher" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineIssue" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
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
    "student_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "sub_teach_period_year_id" INTEGER,

    CONSTRAINT "StudentAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAbsence" (
    "absence_id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "sub_teach_period_year_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherAbsence_pkey" PRIMARY KEY ("absence_id")
);

-- CreateTable
CREATE TABLE "ExamSequence" (
    "id" SERIAL NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "exam_sequence_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VicePrincipalAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subclass_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VicePrincipalAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplineMasterAssignment" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subclass_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTeach_Period_Year" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubTeach_Period_Year_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_id_key" ON "AcademicYear"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_academic_year_id_key" ON "UserRole"("user_id", "role", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_Student_parent_id_student_id_key" ON "Parent_Student"("parent_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Class_id_key" ON "Class"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SubClass_id_key" ON "SubClass"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_id_key" ON "Student"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_SubClass_Year_student_id_subclass_id_academic_year__key" ON "Student_SubClass_Year"("student_id", "subclass_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolFees_student_id_academic_year_id_key" ON "SchoolFees"("student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_id_key" ON "Subject"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SubClass_Subject_subclass_id_subject_id_key" ON "SubClass_Subject"("subclass_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_Teacher_subject_id_teacher_id_key" ON "Subject_Teacher"("subject_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineIssue_id_key" ON "DisciplineIssue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAbsence_student_id_sub_teach_period_year_id_key" ON "StudentAbsence"("student_id", "sub_teach_period_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAbsence_teacher_id_sub_teach_period_year_id_key" ON "TeacherAbsence"("teacher_id", "sub_teach_period_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSequence_sequence_number_term_id_academic_year_id_key" ON "ExamSequence"("sequence_number", "term_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Term_number_key" ON "Term"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Mark_exam_sequence_id_student_id_subject_id_key" ON "Mark"("exam_sequence_id", "student_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "VicePrincipalAssignment_user_id_subclass_id_academic_year_i_key" ON "VicePrincipalAssignment"("user_id", "subclass_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplineMasterAssignment_user_id_subclass_id_academic_yea_key" ON "DisciplineMasterAssignment"("user_id", "subclass_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrincipalAssignment_academic_year_id_key" ON "PrincipalAssignment"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "BursarAssignment_academic_year_id_key" ON "BursarAssignment"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Period_id_day_of_week_start_time_key" ON "Period"("id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "SubTeach_Period_Year_subject_id_teacher_id_period_id_assign_key" ON "SubTeach_Period_Year"("subject_id", "teacher_id", "period_id", "assigned_by_id", "academic_year_id");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent_Student" ADD CONSTRAINT "Parent_Student_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent_Student" ADD CONSTRAINT "Parent_Student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClass" ADD CONSTRAINT "SubClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_SubClass_Year" ADD CONSTRAINT "Student_SubClass_Year_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_SubClass_Year" ADD CONSTRAINT "Student_SubClass_Year_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_SubClass_Year" ADD CONSTRAINT "Student_SubClass_Year_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolFees" ADD CONSTRAINT "SchoolFees_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolFees" ADD CONSTRAINT "SchoolFees_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClass_Subject" ADD CONSTRAINT "SubClass_Subject_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubClass_Subject" ADD CONSTRAINT "SubClass_Subject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject_Teacher" ADD CONSTRAINT "Subject_Teacher_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject_Teacher" ADD CONSTRAINT "Subject_Teacher_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineIssue" ADD CONSTRAINT "DisciplineIssue_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_sub_teach_period_year_id_fkey" FOREIGN KEY ("sub_teach_period_year_id") REFERENCES "SubTeach_Period_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAbsence" ADD CONSTRAINT "StudentAbsence_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAbsence" ADD CONSTRAINT "TeacherAbsence_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAbsence" ADD CONSTRAINT "TeacherAbsence_sub_teach_period_year_id_fkey" FOREIGN KEY ("sub_teach_period_year_id") REFERENCES "SubTeach_Period_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAbsence" ADD CONSTRAINT "TeacherAbsence_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSequence" ADD CONSTRAINT "ExamSequence_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSequence" ADD CONSTRAINT "ExamSequence_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_exam_sequence_id_fkey" FOREIGN KEY ("exam_sequence_id") REFERENCES "ExamSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VicePrincipalAssignment" ADD CONSTRAINT "VicePrincipalAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VicePrincipalAssignment" ADD CONSTRAINT "VicePrincipalAssignment_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VicePrincipalAssignment" ADD CONSTRAINT "VicePrincipalAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineMasterAssignment" ADD CONSTRAINT "DisciplineMasterAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineMasterAssignment" ADD CONSTRAINT "DisciplineMasterAssignment_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "SubClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplineMasterAssignment" ADD CONSTRAINT "DisciplineMasterAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrincipalAssignment" ADD CONSTRAINT "PrincipalAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrincipalAssignment" ADD CONSTRAINT "PrincipalAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BursarAssignment" ADD CONSTRAINT "BursarAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BursarAssignment" ADD CONSTRAINT "BursarAssignment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTeach_Period_Year" ADD CONSTRAINT "SubTeach_Period_Year_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
