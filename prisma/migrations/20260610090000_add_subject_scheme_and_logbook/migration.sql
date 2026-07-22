-- CreateEnum
CREATE TYPE "LessonEntryType" AS ENUM ('LESSON', 'INTEGRATION', 'EVALUATION', 'REMEDIATION', 'REVISION', 'BREAK');

-- CreateEnum
CREATE TYPE "LogbookEntryStatus" AS ENUM ('COMPLETED', 'PARTIAL', 'NOT_TAUGHT');

-- CreateTable
CREATE TABLE "SubjectScheme" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "periods_per_week" INTEGER NOT NULL,
    "annual_teaching_hours" INTEGER NOT NULL,
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeModule" (
    "id" SERIAL NOT NULL,
    "subject_scheme_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeChapter" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeLesson" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "entry_type" "LessonEntryType" NOT NULL DEFAULT 'LESSON',
    "title" TEXT NOT NULL,
    "objectives" TEXT,
    "hands_on_activities" TEXT,
    "digital_resource_available" BOOLEAN NOT NULL DEFAULT false,
    "digital_resources_used" TEXT,
    "term_id" INTEGER,
    "week_number" INTEGER,
    "periods_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogbookEntry" (
    "id" SERIAL NOT NULL,
    "teacher_period_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "date_taught" TIMESTAMP(3) NOT NULL,
    "status" "LogbookEntryStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "homework_given" TEXT,
    "taught_by_id" INTEGER NOT NULL,
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "reviewer_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectScheme_academic_year_id_idx" ON "SubjectScheme"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectScheme_subject_id_class_id_academic_year_id_key" ON "SubjectScheme"("subject_id", "class_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "SchemeModule_subject_scheme_id_idx" ON "SchemeModule"("subject_scheme_id");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeModule_subject_scheme_id_order_key" ON "SchemeModule"("subject_scheme_id", "order");

-- CreateIndex
CREATE INDEX "SchemeChapter_module_id_idx" ON "SchemeChapter"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeChapter_module_id_order_key" ON "SchemeChapter"("module_id", "order");

-- CreateIndex
CREATE INDEX "SchemeLesson_chapter_id_idx" ON "SchemeLesson"("chapter_id");

-- CreateIndex
CREATE INDEX "SchemeLesson_term_id_week_number_idx" ON "SchemeLesson"("term_id", "week_number");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeLesson_chapter_id_order_key" ON "SchemeLesson"("chapter_id", "order");

-- CreateIndex
CREATE INDEX "LogbookEntry_taught_by_id_date_taught_idx" ON "LogbookEntry"("taught_by_id", "date_taught");

-- CreateIndex
CREATE INDEX "LogbookEntry_lesson_id_idx" ON "LogbookEntry"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "LogbookEntry_teacher_period_id_date_taught_key" ON "LogbookEntry"("teacher_period_id", "date_taught");

-- AddForeignKey
ALTER TABLE "SubjectScheme" ADD CONSTRAINT "SubjectScheme_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectScheme" ADD CONSTRAINT "SubjectScheme_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectScheme" ADD CONSTRAINT "SubjectScheme_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectScheme" ADD CONSTRAINT "SubjectScheme_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeModule" ADD CONSTRAINT "SchemeModule_subject_scheme_id_fkey" FOREIGN KEY ("subject_scheme_id") REFERENCES "SubjectScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeChapter" ADD CONSTRAINT "SchemeChapter_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "SchemeModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeLesson" ADD CONSTRAINT "SchemeLesson_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "SchemeChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeLesson" ADD CONSTRAINT "SchemeLesson_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogbookEntry" ADD CONSTRAINT "LogbookEntry_teacher_period_id_fkey" FOREIGN KEY ("teacher_period_id") REFERENCES "TeacherPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogbookEntry" ADD CONSTRAINT "LogbookEntry_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "SchemeLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogbookEntry" ADD CONSTRAINT "LogbookEntry_taught_by_id_fkey" FOREIGN KEY ("taught_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogbookEntry" ADD CONSTRAINT "LogbookEntry_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
