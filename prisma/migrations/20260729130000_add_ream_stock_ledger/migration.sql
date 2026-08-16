-- CreateEnum
CREATE TYPE "ReamStockEntryType" AS ENUM ('RECEIPT', 'ISSUANCE');

-- CreateTable
CREATE TABLE "ReamStockLedger" (
    "id" SERIAL NOT NULL,
    "type" "ReamStockEntryType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "recipient_user_id" INTEGER,
    "recipient_name" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "recorded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReamStockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReamStockLedger_type_created_at_idx" ON "ReamStockLedger"("type", "created_at");

-- CreateIndex
CREATE INDEX "ReamStockLedger_recorded_by_id_idx" ON "ReamStockLedger"("recorded_by_id");

-- CreateIndex
CREATE INDEX "ReamStockLedger_recipient_user_id_idx" ON "ReamStockLedger"("recipient_user_id");

-- AddForeignKey
ALTER TABLE "ReamStockLedger" ADD CONSTRAINT "ReamStockLedger_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReamStockLedger" ADD CONSTRAINT "ReamStockLedger_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
