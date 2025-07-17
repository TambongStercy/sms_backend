/*
  Data Migration: Convert TeacherPeriod to use direct teacher_id and subject_id references
  
  This migration:
  1. Adds new columns with temporary defaults
  2. Migrates data from SubjectTeacher relationships
  3. Makes columns NOT NULL after data migration
  4. Drops old columns and tables
  5. Creates new indexes and foreign keys
*/

-- Step 1: Add new columns with defaults temporarily
ALTER TABLE "TeacherPeriod" 
ADD COLUMN "coefficient" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "periods_per_week" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "subject_id" INTEGER DEFAULT 0,
ADD COLUMN "teacher_id" INTEGER DEFAULT 0;

-- Step 2: Populate the new columns with data from SubjectTeacher relationships
UPDATE "TeacherPeriod" 
SET 
    "teacher_id" = st."teacher_id",
    "subject_id" = st."subject_id"
FROM "SubjectTeacher" st 
WHERE "TeacherPeriod"."subject_teacher_id" = st."id";

-- Step 3: Make the columns NOT NULL after data migration
ALTER TABLE "TeacherPeriod" 
ALTER COLUMN "subject_id" SET NOT NULL,
ALTER COLUMN "teacher_id" SET NOT NULL;

-- Step 4: Drop foreign key constraints and indexes
ALTER TABLE "TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_academic_year_id_fkey";
ALTER TABLE "TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_sub_class_id_fkey";
ALTER TABLE "TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_subject_id_fkey";
ALTER TABLE "TeacherAssignment" DROP CONSTRAINT "TeacherAssignment_teacher_id_fkey";
ALTER TABLE "TeacherPeriod" DROP CONSTRAINT "TeacherPeriod_subject_teacher_id_fkey";

-- Step 5: Drop old indexes
DROP INDEX "TeacherPeriod_subject_teacher_id_period_id_assigned_by_id_a_key";

-- Step 6: Drop the old column
ALTER TABLE "TeacherPeriod" DROP COLUMN "subject_teacher_id";

-- Step 7: Drop the TeacherAssignment table
DROP TABLE "TeacherAssignment";

-- Step 8: Create new indexes and foreign keys
CREATE UNIQUE INDEX "TeacherPeriod_teacher_id_subject_id_period_id_sub_class_id__key" ON "TeacherPeriod"("teacher_id", "subject_id", "period_id", "sub_class_id", "academic_year_id");

ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeacherPeriod" ADD CONSTRAINT "TeacherPeriod_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
