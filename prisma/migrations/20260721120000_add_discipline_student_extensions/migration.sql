-- Discipline & student profile extensions:
-- health conditions + previous schools + admission year on Student;
-- excuse/makeup on StudentAbsence;
-- StudentWarning, ParentSummons, DMRollCall, DMRollCallEntry.

-- 1. New enums (idempotent)
DO $$ BEGIN
    CREATE TYPE "HealthCondition" AS ENUM ('SICKLE_CELL', 'ASTHMATIC', 'EPILEPTIC', 'DIABETIC', 'ALLERGY', 'HYPERTENSION', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "MakeupStatus" AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'WAIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SummonsTrigger" AS ENUM ('CONSECUTIVE_ABSENCES', 'CUMULATIVE_ABSENCES', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SummonsStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "RollCallSlot" AS ENUM ('SLOT_2', 'SLOT_5', 'SLOT_8');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "DMRollCallStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "WarningReason" AS ENUM ('CUMULATIVE_ABSENCES', 'CHRONIC_LATENESS', 'MISCONDUCT', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Extend DisciplineType enum (one value per statement per Postgres requirements)
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'FIGHTING';
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'THEFT';
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'VANDALISM';
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'DISRUPTION';
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'DRUG_POSSESSION';
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'WEAPON_POSSESSION';
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'CHEATING';

-- 3. Extend Student
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "admission_academic_year_id" INTEGER;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "health_conditions" "HealthCondition"[] NOT NULL DEFAULT ARRAY[]::"HealthCondition"[];
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "medical_notes" TEXT;

DO $$ BEGIN
    ALTER TABLE "Student"
        ADD CONSTRAINT "Student_admission_academic_year_id_fkey"
        FOREIGN KEY ("admission_academic_year_id") REFERENCES "AcademicYear"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. StudentPreviousSchool
CREATE TABLE IF NOT EXISTS "StudentPreviousSchool" (
    "id"          SERIAL PRIMARY KEY,
    "student_id"  INTEGER NOT NULL,
    "school_name" TEXT NOT NULL,
    "from_year"   TEXT,
    "to_year"     TEXT,
    "notes"       TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "StudentPreviousSchool"
        ADD CONSTRAINT "StudentPreviousSchool_student_id_fkey"
        FOREIGN KEY ("student_id") REFERENCES "Student"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "StudentPreviousSchool_student_id_idx" ON "StudentPreviousSchool"("student_id");

-- 5. Extend StudentAbsence
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "is_excused" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "excused_by_parent_id" INTEGER;
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "excused_at" TIMESTAMP(3);
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "excuse_reason" TEXT;
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "makeup_status" "MakeupStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "makeup_completed_at" TIMESTAMP(3);
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "makeup_notes" TEXT;
ALTER TABLE "StudentAbsence" ADD COLUMN IF NOT EXISTS "makeup_verified_by_id" INTEGER;

DO $$ BEGIN
    ALTER TABLE "StudentAbsence"
        ADD CONSTRAINT "StudentAbsence_excused_by_parent_id_fkey"
        FOREIGN KEY ("excused_by_parent_id") REFERENCES "User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "StudentAbsence"
        ADD CONSTRAINT "StudentAbsence_makeup_verified_by_id_fkey"
        FOREIGN KEY ("makeup_verified_by_id") REFERENCES "User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "StudentAbsence_enrollment_id_is_excused_absence_type_idx"
    ON "StudentAbsence"("enrollment_id", "is_excused", "absence_type");

-- 6. StudentWarning
CREATE TABLE IF NOT EXISTS "StudentWarning" (
    "id"                    SERIAL PRIMARY KEY,
    "enrollment_id"         INTEGER NOT NULL,
    "warning_level"         INTEGER NOT NULL,
    "reason"                "WarningReason" NOT NULL,
    "description"           TEXT NOT NULL,
    "trigger_absence_count" INTEGER,
    "issued_by_id"          INTEGER NOT NULL,
    "resolved"              BOOLEAN NOT NULL DEFAULT false,
    "resolved_at"           TIMESTAMP(3),
    "resolved_notes"        TEXT,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "StudentWarning"
        ADD CONSTRAINT "StudentWarning_enrollment_id_fkey"
        FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "StudentWarning"
        ADD CONSTRAINT "StudentWarning_issued_by_id_fkey"
        FOREIGN KEY ("issued_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "StudentWarning_enrollment_id_resolved_idx" ON "StudentWarning"("enrollment_id", "resolved");
CREATE INDEX IF NOT EXISTS "StudentWarning_enrollment_id_warning_level_idx" ON "StudentWarning"("enrollment_id", "warning_level");

-- 7. ParentSummons
CREATE TABLE IF NOT EXISTS "ParentSummons" (
    "id"                  SERIAL PRIMARY KEY,
    "enrollment_id"       INTEGER NOT NULL,
    "parent_id"           INTEGER,
    "reason"              TEXT NOT NULL,
    "trigger_type"        "SummonsTrigger" NOT NULL,
    "trigger_absence_ids" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "scheduled_date"      TIMESTAMP(3),
    "status"              "SummonsStatus" NOT NULL DEFAULT 'PENDING',
    "meeting_notes"       TEXT,
    "attended"            BOOLEAN,
    "created_by_id"       INTEGER NOT NULL,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "ParentSummons"
        ADD CONSTRAINT "ParentSummons_enrollment_id_fkey"
        FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "ParentSummons"
        ADD CONSTRAINT "ParentSummons_parent_id_fkey"
        FOREIGN KEY ("parent_id") REFERENCES "User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "ParentSummons"
        ADD CONSTRAINT "ParentSummons_created_by_id_fkey"
        FOREIGN KEY ("created_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "ParentSummons_enrollment_id_status_idx" ON "ParentSummons"("enrollment_id", "status");
CREATE INDEX IF NOT EXISTS "ParentSummons_status_scheduled_date_idx" ON "ParentSummons"("status", "scheduled_date");

-- 8. DMRollCall
CREATE TABLE IF NOT EXISTS "DMRollCall" (
    "id"               SERIAL PRIMARY KEY,
    "sub_class_id"     INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "date"             TIMESTAMP(3) NOT NULL,
    "slot"             "RollCallSlot" NOT NULL,
    "recorded_by_id"   INTEGER NOT NULL,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "DMRollCall"
        ADD CONSTRAINT "DMRollCall_sub_class_id_fkey"
        FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "DMRollCall"
        ADD CONSTRAINT "DMRollCall_academic_year_id_fkey"
        FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "DMRollCall"
        ADD CONSTRAINT "DMRollCall_recorded_by_id_fkey"
        FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "DMRollCall_sub_class_id_date_slot_key" ON "DMRollCall"("sub_class_id", "date", "slot");
CREATE INDEX IF NOT EXISTS "DMRollCall_academic_year_id_date_idx" ON "DMRollCall"("academic_year_id", "date");

-- 9. DMRollCallEntry
CREATE TABLE IF NOT EXISTS "DMRollCallEntry" (
    "id"                SERIAL PRIMARY KEY,
    "dm_roll_call_id"   INTEGER NOT NULL,
    "enrollment_id"     INTEGER NOT NULL,
    "status"            "DMRollCallStatus" NOT NULL,
    "linked_absence_id" INTEGER,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "DMRollCallEntry"
        ADD CONSTRAINT "DMRollCallEntry_dm_roll_call_id_fkey"
        FOREIGN KEY ("dm_roll_call_id") REFERENCES "DMRollCall"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "DMRollCallEntry"
        ADD CONSTRAINT "DMRollCallEntry_enrollment_id_fkey"
        FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "DMRollCallEntry"
        ADD CONSTRAINT "DMRollCallEntry_linked_absence_id_fkey"
        FOREIGN KEY ("linked_absence_id") REFERENCES "StudentAbsence"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "DMRollCallEntry_dm_roll_call_id_enrollment_id_key" ON "DMRollCallEntry"("dm_roll_call_id", "enrollment_id");
CREATE INDEX IF NOT EXISTS "DMRollCallEntry_enrollment_id_idx" ON "DMRollCallEntry"("enrollment_id");
