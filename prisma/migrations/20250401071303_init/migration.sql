/*
  Warnings:

  - You are about to drop the column `dealType` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "dealType",
ADD COLUMN     "businessType" TEXT;
