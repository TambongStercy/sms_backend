-- CreateEnum
CREATE TYPE "ExpenditureCategory" AS ENUM ('SALARY', 'SUPPLIES', 'MAINTENANCE', 'EVENT', 'UTILITY', 'TRANSPORT', 'OTHER');

-- CreateTable
CREATE TABLE "Expenditure" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "ExpenditureCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "recipient" TEXT,
    "recipient_user_id" INTEGER,
    "payment_method" "PaymentMethod",
    "receipt_file" TEXT,
    "notes" TEXT,
    "recorded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expenditure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expenditure_date_idx" ON "Expenditure"("date");
CREATE INDEX "Expenditure_category_date_idx" ON "Expenditure"("category", "date");
CREATE INDEX "Expenditure_recorded_by_id_idx" ON "Expenditure"("recorded_by_id");

-- AddForeignKey
ALTER TABLE "Expenditure" ADD CONSTRAINT "Expenditure_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expenditure" ADD CONSTRAINT "Expenditure_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
