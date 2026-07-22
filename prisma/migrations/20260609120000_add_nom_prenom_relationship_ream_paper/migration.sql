-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('FATHER', 'MOTHER', 'SIBLING', 'GUARDIAN');

-- AlterTable: add nom/prenom to Student
ALTER TABLE "Student" ADD COLUMN "nom" TEXT;
ALTER TABLE "Student" ADD COLUMN "prenom" TEXT;

-- AlterTable: add relationship to ParentStudent
ALTER TABLE "ParentStudent" ADD COLUMN "relationship" "Relationship";

-- AlterTable: add ream_of_paper_collected to Enrollment
ALTER TABLE "Enrollment" ADD COLUMN "ream_of_paper_collected" BOOLEAN NOT NULL DEFAULT false;
