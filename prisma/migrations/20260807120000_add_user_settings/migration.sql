-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "UserSettings" (
    "id"                    SERIAL PRIMARY KEY,
    "user_id"               INTEGER NOT NULL,
    "theme"                 "Theme" NOT NULL DEFAULT 'SYSTEM',
    "language"              TEXT NOT NULL DEFAULT 'en',
    "timezone"              TEXT NOT NULL DEFAULT 'Africa/Douala',
    "notifications_email"   BOOLEAN NOT NULL DEFAULT TRUE,
    "notifications_sms"     BOOLEAN NOT NULL DEFAULT FALSE,
    "notifications_push"    BOOLEAN NOT NULL DEFAULT TRUE,
    "notifications_in_app"  BOOLEAN NOT NULL DEFAULT TRUE,
    "quiet_hours_enabled"   BOOLEAN NOT NULL DEFAULT FALSE,
    "quiet_hours_start"     TEXT,
    "quiet_hours_end"       TEXT,
    "muted_categories"      "NotificationCategory"[] DEFAULT ARRAY[]::"NotificationCategory"[],
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- AddForeignKey
ALTER TABLE "UserSettings"
    ADD CONSTRAINT "UserSettings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
