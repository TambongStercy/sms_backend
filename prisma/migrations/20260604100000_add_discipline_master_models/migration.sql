-- Discipline Master expansion: action_taken, BROKEN_PROPERTY, SaturdayPunishment,
-- BrokenProperty, STUDENT-scoped FeeItem.

-- 1. Extend DisciplineType enum
ALTER TYPE "DisciplineType" ADD VALUE IF NOT EXISTS 'BROKEN_PROPERTY';

-- 2. Extend FeeItemScope enum
ALTER TYPE "FeeItemScope" ADD VALUE IF NOT EXISTS 'STUDENT';

-- 3. New PunishmentStatus enum
DO $$ BEGIN
    CREATE TYPE "PunishmentStatus" AS ENUM ('PENDING', 'SERVED', 'SKIPPED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. action_taken on DisciplineIssue
ALTER TABLE "DisciplineIssue" ADD COLUMN IF NOT EXISTS "action_taken" TEXT;

-- 5. student_id on FeeItem + FK + index
ALTER TABLE "FeeItem" ADD COLUMN IF NOT EXISTS "student_id" INTEGER;

DO $$ BEGIN
    ALTER TABLE "FeeItem"
        ADD CONSTRAINT "FeeItem_student_id_fkey"
        FOREIGN KEY ("student_id") REFERENCES "Student"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "FeeItem_scope_student_id_idx" ON "FeeItem"("scope", "student_id");

-- 6. SaturdayPunishment table
CREATE TABLE IF NOT EXISTS "SaturdayPunishment" (
    "id"              SERIAL PRIMARY KEY,
    "enrollment_id"   INTEGER NOT NULL,
    "reason"          TEXT NOT NULL,
    "scheduled_date"  TIMESTAMP(3),
    "served_date"     TIMESTAMP(3),
    "status"          "PunishmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes"           TEXT,
    "assigned_by_id"  INTEGER NOT NULL,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "SaturdayPunishment"
        ADD CONSTRAINT "SaturdayPunishment_enrollment_id_fkey"
        FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "SaturdayPunishment"
        ADD CONSTRAINT "SaturdayPunishment_assigned_by_id_fkey"
        FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "SaturdayPunishment_enrollment_id_status_idx"
    ON "SaturdayPunishment"("enrollment_id", "status");
CREATE INDEX IF NOT EXISTS "SaturdayPunishment_status_scheduled_date_idx"
    ON "SaturdayPunishment"("status", "scheduled_date");

-- 7. BrokenProperty table
CREATE TABLE IF NOT EXISTS "BrokenProperty" (
    "id"              SERIAL PRIMARY KEY,
    "enrollment_id"   INTEGER NOT NULL,
    "item_name"       TEXT NOT NULL,
    "description"     TEXT NOT NULL,
    "estimated_cost"  DOUBLE PRECISION NOT NULL,
    "action_taken"    TEXT,
    "fee_item_id"     INTEGER,
    "reported_by_id"  INTEGER NOT NULL,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "BrokenProperty_fee_item_id_key"
    ON "BrokenProperty"("fee_item_id");

DO $$ BEGIN
    ALTER TABLE "BrokenProperty"
        ADD CONSTRAINT "BrokenProperty_enrollment_id_fkey"
        FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "BrokenProperty"
        ADD CONSTRAINT "BrokenProperty_fee_item_id_fkey"
        FOREIGN KEY ("fee_item_id") REFERENCES "FeeItem"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "BrokenProperty"
        ADD CONSTRAINT "BrokenProperty_reported_by_id_fkey"
        FOREIGN KEY ("reported_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "BrokenProperty_enrollment_id_idx"
    ON "BrokenProperty"("enrollment_id");
CREATE INDEX IF NOT EXISTS "BrokenProperty_reported_by_id_idx"
    ON "BrokenProperty"("reported_by_id");
