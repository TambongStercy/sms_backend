-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('TEACHER_HOURLY', 'ADMIN_FIXED');

-- CreateEnum
CREATE TYPE "SalaryProfileStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "SalaryAllowanceType" AS ENUM ('ALLOWANCE', 'BONUS');

-- CreateEnum
CREATE TYPE "SalaryApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayPeriodStatus" AS ENUM ('OPEN', 'LOCKED', 'PAID');

-- CreateEnum
CREATE TYPE "SalaryPaymentStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'WITHHELD', 'PAID');

-- CreateEnum
CREATE TYPE "WithholdingScope" AS ENUM ('PARTIAL', 'FULL');

-- CreateEnum
CREATE TYPE "BursarCashInjectionSource" AS ENUM ('MANAGER', 'SUPER_MANAGER', 'OTHER');

-- CreateTable
CREATE TABLE "SalaryProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "salary_type" "SalaryType" NOT NULL,
    "hourly_rate" DOUBLE PRECISION,
    "base_salary" DOUBLE PRECISION,
    "status" "SalaryProfileStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "approved_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryChangeRequest" (
    "id" SERIAL NOT NULL,
    "salary_profile_id" INTEGER NOT NULL,
    "old_hourly_rate" DOUBLE PRECISION,
    "new_hourly_rate" DOUBLE PRECISION,
    "old_base_salary" DOUBLE PRECISION,
    "new_base_salary" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,
    "status" "SalaryApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by_id" INTEGER NOT NULL,
    "approved_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAllowance" (
    "id" SERIAL NOT NULL,
    "salary_profile_id" INTEGER NOT NULL,
    "pay_period_id" INTEGER,
    "type" "SalaryAllowanceType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "SalaryApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by_id" INTEGER NOT NULL,
    "approved_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryAllowance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayPeriod" (
    "id" SERIAL NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "pay_date" TIMESTAMP(3) NOT NULL,
    "week_start_dates" JSONB NOT NULL,
    "status" "PayPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryPayment" (
    "id" SERIAL NOT NULL,
    "salary_profile_id" INTEGER NOT NULL,
    "pay_period_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "salary_type" "SalaryType" NOT NULL,
    "hours_expected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hours_taught" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hours_absent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hourly_rate" DOUBLE PRECISION,
    "base_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allowance_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "withheld_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "SalaryPaymentStatus" NOT NULL DEFAULT 'DRAFT',
    "paid_at" TIMESTAMP(3),
    "paid_by_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryWithholding" (
    "id" SERIAL NOT NULL,
    "salary_payment_id" INTEGER NOT NULL,
    "scope" "WithholdingScope" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "SalaryApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by_id" INTEGER NOT NULL,
    "approved_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryWithholding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BursarCashInjection" (
    "id" SERIAL NOT NULL,
    "academic_year_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "source" "BursarCashInjectionSource" NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT,
    "injected_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BursarCashInjection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryProfile_user_id_academic_year_id_key" ON "SalaryProfile"("user_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "SalaryProfile_status_idx" ON "SalaryProfile"("status");

-- CreateIndex
CREATE INDEX "SalaryProfile_academic_year_id_status_idx" ON "SalaryProfile"("academic_year_id", "status");

-- CreateIndex
CREATE INDEX "SalaryChangeRequest_status_idx" ON "SalaryChangeRequest"("status");

-- CreateIndex
CREATE INDEX "SalaryChangeRequest_salary_profile_id_idx" ON "SalaryChangeRequest"("salary_profile_id");

-- CreateIndex
CREATE INDEX "SalaryAllowance_status_idx" ON "SalaryAllowance"("status");

-- CreateIndex
CREATE INDEX "SalaryAllowance_salary_profile_id_idx" ON "SalaryAllowance"("salary_profile_id");

-- CreateIndex
CREATE INDEX "SalaryAllowance_pay_period_id_idx" ON "SalaryAllowance"("pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "PayPeriod_academic_year_id_year_month_key" ON "PayPeriod"("academic_year_id", "year", "month");

-- CreateIndex
CREATE INDEX "PayPeriod_status_idx" ON "PayPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPayment_pay_period_id_user_id_key" ON "SalaryPayment"("pay_period_id", "user_id");

-- CreateIndex
CREATE INDEX "SalaryPayment_status_idx" ON "SalaryPayment"("status");

-- CreateIndex
CREATE INDEX "SalaryPayment_user_id_idx" ON "SalaryPayment"("user_id");

-- CreateIndex
CREATE INDEX "SalaryWithholding_status_idx" ON "SalaryWithholding"("status");

-- CreateIndex
CREATE INDEX "SalaryWithholding_salary_payment_id_idx" ON "SalaryWithholding"("salary_payment_id");

-- CreateIndex
CREATE INDEX "BursarCashInjection_academic_year_id_created_at_idx" ON "BursarCashInjection"("academic_year_id", "created_at");

-- CreateIndex
CREATE INDEX "BursarCashInjection_source_idx" ON "BursarCashInjection"("source");

-- AddForeignKey
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryChangeRequest" ADD CONSTRAINT "SalaryChangeRequest_salary_profile_id_fkey" FOREIGN KEY ("salary_profile_id") REFERENCES "SalaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryChangeRequest" ADD CONSTRAINT "SalaryChangeRequest_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryChangeRequest" ADD CONSTRAINT "SalaryChangeRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAllowance" ADD CONSTRAINT "SalaryAllowance_salary_profile_id_fkey" FOREIGN KEY ("salary_profile_id") REFERENCES "SalaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAllowance" ADD CONSTRAINT "SalaryAllowance_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "PayPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAllowance" ADD CONSTRAINT "SalaryAllowance_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAllowance" ADD CONSTRAINT "SalaryAllowance_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayPeriod" ADD CONSTRAINT "PayPeriod_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayPeriod" ADD CONSTRAINT "PayPeriod_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_salary_profile_id_fkey" FOREIGN KEY ("salary_profile_id") REFERENCES "SalaryProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "PayPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryWithholding" ADD CONSTRAINT "SalaryWithholding_salary_payment_id_fkey" FOREIGN KEY ("salary_payment_id") REFERENCES "SalaryPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryWithholding" ADD CONSTRAINT "SalaryWithholding_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryWithholding" ADD CONSTRAINT "SalaryWithholding_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BursarCashInjection" ADD CONSTRAINT "BursarCashInjection_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BursarCashInjection" ADD CONSTRAINT "BursarCashInjection_injected_by_id_fkey" FOREIGN KEY ("injected_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
