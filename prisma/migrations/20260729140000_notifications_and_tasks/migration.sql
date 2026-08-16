-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM (
    'GENERAL',
    'ANNOUNCEMENT',
    'TASK_ASSIGNED',
    'TASK_UPDATE',
    'APPROVAL_NEEDED',
    'APPROVAL_APPROVED',
    'APPROVAL_REJECTED',
    'SALARY_UPDATE',
    'FEE_UPDATE',
    'DISCIPLINE',
    'SYSTEM'
);

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable: extend MobileNotification
ALTER TABLE "MobileNotification"
    ADD COLUMN "sender_id"   INTEGER,
    ADD COLUMN "title"       TEXT,
    ADD COLUMN "category"    "NotificationCategory" NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN "entity_type" TEXT,
    ADD COLUMN "entity_id"   INTEGER,
    ADD COLUMN "action_url"  TEXT,
    ADD COLUMN "read_at"     TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MobileNotification_user_id_status_idx" ON "MobileNotification"("user_id", "status");

-- CreateIndex
CREATE INDEX "MobileNotification_user_id_category_idx" ON "MobileNotification"("user_id", "category");

-- CreateIndex
CREATE INDEX "MobileNotification_entity_type_entity_id_idx" ON "MobileNotification"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "MobileNotification"
    ADD CONSTRAINT "MobileNotification_sender_id_fkey"
    FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Task" (
    "id"             SERIAL NOT NULL,
    "title"          TEXT NOT NULL,
    "description"    TEXT NOT NULL,
    "priority"       "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status"         "TaskStatus"   NOT NULL DEFAULT 'PENDING',
    "category"       TEXT NOT NULL DEFAULT 'GENERAL',
    "progress"       INTEGER NOT NULL DEFAULT 0,
    "deadline"       TIMESTAMP(3),
    "assigned_to_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "notes"          TEXT,
    "completed_at"   TIMESTAMP(3),
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_assigned_to_id_status_idx" ON "Task"("assigned_to_id", "status");

-- CreateIndex
CREATE INDEX "Task_assigned_by_id_idx" ON "Task"("assigned_by_id");

-- CreateIndex
CREATE INDEX "Task_deadline_idx" ON "Task"("deadline");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigned_by_id_fkey"
    FOREIGN KEY ("assigned_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
