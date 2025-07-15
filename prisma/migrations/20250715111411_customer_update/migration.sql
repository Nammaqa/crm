/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAttention` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCity` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCountry` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPhone` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPinCode` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `shippingState` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "shippingAddress",
DROP COLUMN "shippingAttention",
DROP COLUMN "shippingCity",
DROP COLUMN "shippingCountry",
DROP COLUMN "shippingPhone",
DROP COLUMN "shippingPinCode",
DROP COLUMN "shippingState",
ADD COLUMN     "billingFax" TEXT,
ALTER COLUMN "customerType" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "billingCountry" DROP NOT NULL,
ALTER COLUMN "billingCountry" SET DEFAULT 'India';
