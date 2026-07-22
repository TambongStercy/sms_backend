-- Chat advanced features: attachment kind + presence last_seen_at.

DO $$ BEGIN
    CREATE TYPE "ChatAttachmentKind" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'FILE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "ChatMessageAttachment"
    ADD COLUMN IF NOT EXISTS "kind" "ChatAttachmentKind" NOT NULL DEFAULT 'FILE',
    ADD COLUMN IF NOT EXISTS "duration_secs" INTEGER,
    ADD COLUMN IF NOT EXISTS "width" INTEGER,
    ADD COLUMN IF NOT EXISTS "height" INTEGER;

ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "last_seen_at" TIMESTAMP(3);
