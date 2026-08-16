-- CreateTable
CREATE TABLE "NurseVisitLog" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "period_id" INTEGER,
    "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "treatment_given" TEXT,
    "medication_given" TEXT,
    "notes" TEXT,
    "sent_home" BOOLEAN NOT NULL DEFAULT false,
    "logged_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NurseVisitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NurseVisitLog_enrollment_id_idx" ON "NurseVisitLog"("enrollment_id");

-- CreateIndex
CREATE INDEX "NurseVisitLog_logged_by_id_idx" ON "NurseVisitLog"("logged_by_id");

-- CreateIndex
CREATE INDEX "NurseVisitLog_visit_date_idx" ON "NurseVisitLog"("visit_date");

-- AddForeignKey
ALTER TABLE "NurseVisitLog" ADD CONSTRAINT "NurseVisitLog_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseVisitLog" ADD CONSTRAINT "NurseVisitLog_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseVisitLog" ADD CONSTRAINT "NurseVisitLog_logged_by_id_fkey" FOREIGN KEY ("logged_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
