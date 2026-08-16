-- Bell schedule support: introduce PeriodSet, tag Period with set + type + sequence,
-- and let Class point at the set it follows. Existing Period rows keep working
-- because period_set_id is nullable; new rows added by seed populate both cycles.

-- ----- Enum -----
CREATE TYPE "PeriodType" AS ENUM ('TEACHING', 'BREAK', 'PREP');

-- ----- PeriodSet -----
CREATE TABLE "PeriodSet" (
    "id"               SERIAL PRIMARY KEY,
    "code"             TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "description"      TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PeriodSet_academic_year_id_fkey"
        FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PeriodSet_code_academic_year_id_key"
    ON "PeriodSet"("code", "academic_year_id");
CREATE INDEX "PeriodSet_academic_year_id_idx"
    ON "PeriodSet"("academic_year_id");

-- ----- Period columns -----
ALTER TABLE "Period"
    ADD COLUMN "type" "PeriodType" NOT NULL DEFAULT 'TEACHING',
    ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "period_set_id" INTEGER;

-- Backfill: existing is_break rows map to BREAK type; the rest stay TEACHING.
UPDATE "Period" SET "type" = 'BREAK' WHERE "is_break" = TRUE;

ALTER TABLE "Period"
    ADD CONSTRAINT "Period_period_set_id_fkey"
        FOREIGN KEY ("period_set_id") REFERENCES "PeriodSet"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

-- Old unique on (day, start_time, end_time) has to widen to include period_set_id
-- so both cycles can hold a slot at the same clock time without colliding.
-- Prisma's @@unique is implemented as a UNIQUE INDEX, so use DROP INDEX.
DROP INDEX IF EXISTS "Period_day_of_week_start_time_end_time_key";
DROP INDEX IF EXISTS "Period_day_of_week_start_time_end_time_period_set_id_key";
CREATE UNIQUE INDEX "Period_day_of_week_start_time_end_time_period_set_id_key"
    ON "Period"("day_of_week", "start_time", "end_time", "period_set_id");

CREATE INDEX "Period_period_set_id_day_of_week_sequence_idx"
    ON "Period"("period_set_id", "day_of_week", "sequence");

-- ----- Class column -----
ALTER TABLE "Class"
    ADD COLUMN "period_set_id" INTEGER;

ALTER TABLE "Class"
    ADD CONSTRAINT "Class_period_set_id_fkey"
        FOREIGN KEY ("period_set_id") REFERENCES "PeriodSet"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
