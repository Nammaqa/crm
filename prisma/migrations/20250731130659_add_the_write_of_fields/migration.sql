/*
  Warnings:

  - You are about to drop the column `writeOffReason` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "writeOffReason",
ADD COLUMN     "writeofdate" TIMESTAMP(3),
ADD COLUMN     "writeofnotes" TEXT;
