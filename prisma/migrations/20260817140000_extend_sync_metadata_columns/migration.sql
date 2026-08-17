-- Extend sync participation beyond the original 12 tables.
--
-- 20260817120000 added server_id/checksum to the tables the sync module knew
-- about at the time. Those 12 could not bootstrap a node on their own: Student
-- was absent, so every Enrollment failed on Enrollment_student_id_fkey and took
-- SchoolFees, PaymentTransaction and Mark down with it.
--
-- getLocalChanges filters on `updated_at` and `server_id`, so a table needs both
-- to participate at all. Term and Period had neither timestamp, hence the extra
-- columns for those two.

-- Timestamps for the two tables that had none. CURRENT_TIMESTAMP backfills
-- existing rows; new rows are managed by Prisma's @default(now()) / @updatedAt.
ALTER TABLE "Term"
    ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Period"
    ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Sync metadata for the tables joining the sync set.
ALTER TABLE "Student"         ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "PeriodSet"       ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Term"            ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Period"          ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "SubClassSubject" ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "ExamSequence"    ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "TeacherPeriod"   ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "ParentStudent"   ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "SchoolFees"      ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;

CREATE INDEX "Student_server_id_idx"         ON "Student"("server_id");
CREATE INDEX "PeriodSet_server_id_idx"       ON "PeriodSet"("server_id");
CREATE INDEX "Term_server_id_idx"            ON "Term"("server_id");
CREATE INDEX "Period_server_id_idx"          ON "Period"("server_id");
CREATE INDEX "SubClassSubject_server_id_idx" ON "SubClassSubject"("server_id");
CREATE INDEX "ExamSequence_server_id_idx"    ON "ExamSequence"("server_id");
CREATE INDEX "TeacherPeriod_server_id_idx"   ON "TeacherPeriod"("server_id");
CREATE INDEX "ParentStudent_server_id_idx"   ON "ParentStudent"("server_id");
CREATE INDEX "SchoolFees_server_id_idx"      ON "SchoolFees"("server_id");
