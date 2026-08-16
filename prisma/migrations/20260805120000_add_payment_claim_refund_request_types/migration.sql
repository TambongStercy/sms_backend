-- Extend FinanceRequestType to support parent/user payment claims (Bursar validates)
-- and Bursar-initiated refunds (Super Manager approves).
ALTER TYPE "FinanceRequestType" ADD VALUE IF NOT EXISTS 'PAYMENT_CLAIM';
ALTER TYPE "FinanceRequestType" ADD VALUE IF NOT EXISTS 'REFUND';
