-- CreateEnum
CREATE TYPE "TeacherPeriodAttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');

-- CreateTable
CREATE TABLE "TeacherPeriodAttendance" (
    "id" SERIAL NOT NULL,
    "teacher_period_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TeacherPeriodAttendanceStatus" NOT NULL,
    "well_dressed" BOOLEAN NOT NULL DEFAULT false,
    "class_management" BOOLEAN NOT NULL DEFAULT false,
    "punctuality" BOOLEAN NOT NULL DEFAULT false,
    "assiduity" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "notes" TEXT,
    "recorded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherPeriodAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPeriodAttendance_teacher_period_id_date_key" ON "TeacherPeriodAttendance"("teacher_period_id", "date");

-- CreateIndex
CREATE INDEX "TeacherPeriodAttendance_academic_year_id_date_idx" ON "TeacherPeriodAttendance"("academic_year_id", "date");

-- CreateIndex
CREATE INDEX "TeacherPeriodAttendance_date_idx" ON "TeacherPeriodAttendance"("date");

-- AddForeignKey
ALTER TABLE "TeacherPeriodAttendance" ADD CONSTRAINT "TeacherPeriodAttendance_teacher_period_id_fkey" FOREIGN KEY ("teacher_period_id") REFERENCES "TeacherPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriodAttendance" ADD CONSTRAINT "TeacherPeriodAttendance_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPeriodAttendance" ADD CONSTRAINT "TeacherPeriodAttendance_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
