-- Per-table cursor: replaces the single global SyncMetadata timestamp so a
-- poison record in one table cannot freeze replication for the other ~80.
CREATE TABLE "SyncCursor" (
    "table_name" TEXT NOT NULL,
    "cursor" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncCursor_pkey" PRIMARY KEY ("table_name")
);

-- Cross-tick strike counter. After MAX_STRIKES failures the record is
-- quarantined -- still attempted every tick, but no longer blocks its table's
-- cursor. Any success deletes the row so transient failures cannot stick.
CREATE TABLE "SyncFailure" (
    "id" SERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "strikes" INTEGER NOT NULL DEFAULT 1,
    "last_error" TEXT NOT NULL,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncFailure_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SyncFailure_table_name_record_id_direction_key" ON "SyncFailure"("table_name", "record_id", "direction");
CREATE INDEX "SyncFailure_table_name_strikes_idx" ON "SyncFailure"("table_name", "strikes");
