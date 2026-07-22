-- AlterTable
ALTER TABLE "Class" ADD COLUMN "pass_mark" DOUBLE PRECISION NOT NULL DEFAULT 10.0;
ALTER TABLE "Class" ADD COLUMN "next_class_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_next_class_id_fkey" FOREIGN KEY ("next_class_id") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
