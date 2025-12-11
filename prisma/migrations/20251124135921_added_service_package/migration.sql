/*
  Warnings:

  - You are about to drop the column `sort_order` on the `services` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SINGLE', 'PACKAGE');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('FIXED', 'RANGE');

-- AlterTable
ALTER TABLE "services" DROP COLUMN "sort_order",
ADD COLUMN     "fixed_price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pricingModel" "PricingModel" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "type" "ServiceType" NOT NULL DEFAULT 'SINGLE';

-- CreateTable
CREATE TABLE "service_packages" (
    "parent_package_id" TEXT NOT NULL,
    "child_service_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("parent_package_id","child_service_id")
);

-- CreateTable
CREATE TABLE "insurance_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_insurances" (
    "service_id" TEXT NOT NULL,
    "insurance_provider_id" TEXT NOT NULL,

    CONSTRAINT "service_insurances_pkey" PRIMARY KEY ("service_id","insurance_provider_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "insurance_providers_name_key" ON "insurance_providers"("name");

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_parent_package_id_fkey" FOREIGN KEY ("parent_package_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_child_service_id_fkey" FOREIGN KEY ("child_service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_insurances" ADD CONSTRAINT "service_insurances_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_insurances" ADD CONSTRAINT "service_insurances_insurance_provider_id_fkey" FOREIGN KEY ("insurance_provider_id") REFERENCES "insurance_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
