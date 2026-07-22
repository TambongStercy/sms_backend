-- Dean of Discipline expansion: structured DisciplinaryAction + ReportRequest.

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE "DisciplinaryActionType" AS ENUM (
        'SUSPENSION',
        'WORK_DUTY',
        'SUSPENDED_WITH_CHORES',
        'PUNISHMENT',
        'DISMISSAL',
        'SUSPENDED_DISMISSAL',
        'END_OF_YEAR_DISMISSAL',
        'DISCIPLINARY_COUNCIL'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DisciplinaryActionStatus" AS ENUM (
        'PENDING',
        'ACTIVE',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReportRequestStatus" AS ENUM (
        'PENDING',
        'SUBMITTED',
        'REVIEWED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. DisciplinaryAction table
CREATE TABLE IF NOT EXISTS "DisciplinaryAction" (
    "id"                  SERIAL PRIMARY KEY,
    "enrollment_id"       INTEGER NOT NULL,
    "discipline_issue_id" INTEGER,
    "action_type"         "DisciplinaryActionType" NOT NULL,
    "status"              "DisciplinaryActionStatus" NOT NULL DEFAULT 'PENDING',
    "days"                INTEGER,
    "start_date"          TIMESTAMP(3),
    "end_date"            TIMESTAMP(3),
    "reason"              TEXT NOT NULL,
    "notes"               TEXT,
    "decided_by_id"       INTEGER NOT NULL,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "DisciplinaryAction"
        ADD CONSTRAINT "DisciplinaryAction_enrollment_id_fkey"
        FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "DisciplinaryAction"
        ADD CONSTRAINT "DisciplinaryAction_discipline_issue_id_fkey"
        FOREIGN KEY ("discipline_issue_id") REFERENCES "DisciplineIssue"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "DisciplinaryAction"
        ADD CONSTRAINT "DisciplinaryAction_decided_by_id_fkey"
        FOREIGN KEY ("decided_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "DisciplinaryAction_enrollment_id_status_idx"
    ON "DisciplinaryAction"("enrollment_id", "status");
CREATE INDEX IF NOT EXISTS "DisciplinaryAction_action_type_status_idx"
    ON "DisciplinaryAction"("action_type", "status");
CREATE INDEX IF NOT EXISTS "DisciplinaryAction_discipline_issue_id_idx"
    ON "DisciplinaryAction"("discipline_issue_id");

-- 3. ReportRequest table
CREATE TABLE IF NOT EXISTS "ReportRequest" (
    "id"                  SERIAL PRIMARY KEY,
    "requested_by_id"     INTEGER NOT NULL,
    "requested_from_id"   INTEGER NOT NULL,
    "subject"             TEXT NOT NULL,
    "description"         TEXT NOT NULL,
    "due_date"            TIMESTAMP(3) NOT NULL,
    "status"              "ReportRequestStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at"        TIMESTAMP(3),
    "submission_notes"    TEXT,
    "submission_file_url" TEXT,
    "reviewed_at"         TIMESTAMP(3),
    "reviewed_notes"      TEXT,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL
);

DO $$ BEGIN
    ALTER TABLE "ReportRequest"
        ADD CONSTRAINT "ReportRequest_requested_by_id_fkey"
        FOREIGN KEY ("requested_by_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ReportRequest"
        ADD CONSTRAINT "ReportRequest_requested_from_id_fkey"
        FOREIGN KEY ("requested_from_id") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "ReportRequest_requested_by_id_status_idx"
    ON "ReportRequest"("requested_by_id", "status");
CREATE INDEX IF NOT EXISTS "ReportRequest_requested_from_id_status_idx"
    ON "ReportRequest"("requested_from_id", "status");
CREATE INDEX IF NOT EXISTS "ReportRequest_status_due_date_idx"
    ON "ReportRequest"("status", "due_date");
