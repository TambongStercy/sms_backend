/*
  Warnings:

  - A unique constraint covering the columns `[report_type,exam_sequence_id,academic_year_id,sub_class_id]` on the table `GeneratedReport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "GeneratedReport_exam_sequence_id_idx" ON "GeneratedReport"("exam_sequence_id");

-- CreateIndex
CREATE INDEX "GeneratedReport_student_id_idx" ON "GeneratedReport"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "subclass_report_unique" ON "GeneratedReport"("report_type", "exam_sequence_id", "academic_year_id", "sub_class_id");
