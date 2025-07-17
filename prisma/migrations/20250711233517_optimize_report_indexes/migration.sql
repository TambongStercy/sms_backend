-- CreateIndex
CREATE INDEX "Enrollment_sub_class_id_academic_year_id_idx" ON "Enrollment"("sub_class_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "generated_report_student_idx" ON "GeneratedReport"("report_type", "exam_sequence_id", "academic_year_id", "student_id");

-- CreateIndex
CREATE INDEX "generated_report_subclass_idx" ON "GeneratedReport"("report_type", "exam_sequence_id", "academic_year_id", "sub_class_id");

-- CreateIndex
CREATE INDEX "Mark_enrollment_id_exam_sequence_id_idx" ON "Mark"("enrollment_id", "exam_sequence_id");

-- CreateIndex
CREATE INDEX "Mark_sub_class_subject_id_exam_sequence_id_idx" ON "Mark"("sub_class_subject_id", "exam_sequence_id");
