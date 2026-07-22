-- CreateEnum
CREATE TYPE "FinanceRequestType" AS ENUM ('FEE_REDUCTION', 'PERSONNEL_DISBURSEMENT', 'BANK_VERIFICATION');
CREATE TYPE "FinanceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "FinanceRequest" (
    "id" SERIAL NOT NULL,
    "type" "FinanceRequestType" NOT NULL,
    "status" "FinanceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "payload" JSONB NOT NULL,
    "requested_by_id" INTEGER NOT NULL,
    "acted_by_id" INTEGER,
    "acted_at" TIMESTAMP(3),
    "acted_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceRequest_type_status_idx" ON "FinanceRequest"("type", "status");
CREATE INDEX "FinanceRequest_requested_by_id_idx" ON "FinanceRequest"("requested_by_id");
CREATE INDEX "FinanceRequest_created_at_idx" ON "FinanceRequest"("created_at");

-- AddForeignKey
ALTER TABLE "FinanceRequest" ADD CONSTRAINT "FinanceRequest_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceRequest" ADD CONSTRAINT "FinanceRequest_acted_by_id_fkey" FOREIGN KEY ("acted_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
