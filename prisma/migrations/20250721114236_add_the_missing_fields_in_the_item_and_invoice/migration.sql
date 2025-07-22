/*
  Warnings:

  - You are about to drop the column `GstPercentage` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercentage` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "shippingFax" TEXT;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "GstPercentage",
DROP COLUMN "discountPercentage",
ADD COLUMN     "Documents" TEXT[],
ADD COLUMN     "poNumber" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Draft';

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "GstPercentage" DOUBLE PRECISION,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "sas" TEXT;
