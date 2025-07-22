/*
  Warnings:

  - You are about to drop the column `sas` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "sas",
ADD COLUMN     "sac" TEXT;
