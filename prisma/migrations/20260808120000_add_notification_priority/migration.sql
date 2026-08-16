-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "MobileNotification"
    ADD COLUMN "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL';

-- CreateIndex
CREATE INDEX "MobileNotification_user_id_priority_idx"
    ON "MobileNotification"("user_id", "priority");
