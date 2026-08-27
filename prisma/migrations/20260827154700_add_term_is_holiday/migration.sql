-- Adds Term.is_holiday, which was added to schema.prisma (and the generated
-- client) without a migration. The client selects the column on every
-- `include: { terms: true }`, so getAllAcademicYears was failing with P2022
-- and returning 500 to the UI.
--
-- Additive only. The drift also wants `ALTER COLUMN "updated_at" DROP DEFAULT`
-- on this table; that is deliberately not applied here — Prisma always writes
-- updated_at explicitly, so the surviving DB default is inert, and keeping it
-- avoids breaking any raw insert that still relies on it.
ALTER TABLE "Term" ADD COLUMN "is_holiday" BOOLEAN NOT NULL DEFAULT false;
