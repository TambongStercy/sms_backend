-- CreateEnum
CREATE TYPE "FeeItemScope" AS ENUM ('ALL', 'CLASS', 'SUBCLASS');

-- CreateTable
CREATE TABLE "FeeItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "scope" "FeeItemScope" NOT NULL,
    "class_id" INTEGER,
    "sub_class_id" INTEGER,
    "requires_school_fees_paid" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeItemPayment" (
    "id" SERIAL NOT NULL,
    "fee_item_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "receipt_number" TEXT,
    "payment_method" "PaymentMethod" NOT NULL,
    "recorded_by_id" INTEGER NOT NULL,
    "notes" TEXT,
    "cascaded_to_school_fees" BOOLEAN NOT NULL DEFAULT false,
    "school_fees_payment_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeItemPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeItem_academic_year_id_is_active_idx" ON "FeeItem"("academic_year_id", "is_active");
CREATE INDEX "FeeItem_scope_class_id_sub_class_id_idx" ON "FeeItem"("scope", "class_id", "sub_class_id");
CREATE INDEX "FeeItemPayment_fee_item_id_enrollment_id_idx" ON "FeeItemPayment"("fee_item_id", "enrollment_id");
CREATE INDEX "FeeItemPayment_enrollment_id_idx" ON "FeeItemPayment"("enrollment_id");

-- AddForeignKey
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_sub_class_id_fkey" FOREIGN KEY ("sub_class_id") REFERENCES "SubClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FeeItemPayment" ADD CONSTRAINT "FeeItemPayment_fee_item_id_fkey" FOREIGN KEY ("fee_item_id") REFERENCES "FeeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeeItemPayment" ADD CONSTRAINT "FeeItemPayment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeeItemPayment" ADD CONSTRAINT "FeeItemPayment_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
