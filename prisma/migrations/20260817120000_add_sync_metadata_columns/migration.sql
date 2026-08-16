-- Add sync metadata columns to tables that participate in VPS <-> on-prem sync.
-- server_id records which server most recently wrote the row (enables echo-loop
-- filtering). checksum caches the content hash used for conflict detection.

ALTER TABLE "AcademicYear"       ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "User"               ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Class"              ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "SubClass"           ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Subject"            ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Enrollment"         ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Mark"               ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "StudentAbsence"     ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "TeacherAbsence"     ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "PaymentTransaction" ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "GeneratedReport"    ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;
ALTER TABLE "Announcement"       ADD COLUMN "server_id" TEXT, ADD COLUMN "checksum" TEXT;

CREATE INDEX "AcademicYear_server_id_idx"       ON "AcademicYear"("server_id");
CREATE INDEX "User_server_id_idx"               ON "User"("server_id");
CREATE INDEX "Class_server_id_idx"              ON "Class"("server_id");
CREATE INDEX "SubClass_server_id_idx"           ON "SubClass"("server_id");
CREATE INDEX "Subject_server_id_idx"            ON "Subject"("server_id");
CREATE INDEX "Enrollment_server_id_idx"         ON "Enrollment"("server_id");
CREATE INDEX "Mark_server_id_idx"               ON "Mark"("server_id");
CREATE INDEX "StudentAbsence_server_id_idx"     ON "StudentAbsence"("server_id");
CREATE INDEX "TeacherAbsence_server_id_idx"     ON "TeacherAbsence"("server_id");
CREATE INDEX "PaymentTransaction_server_id_idx" ON "PaymentTransaction"("server_id");
CREATE INDEX "GeneratedReport_server_id_idx"    ON "GeneratedReport"("server_id");
CREATE INDEX "Announcement_server_id_idx"       ON "Announcement"("server_id");
