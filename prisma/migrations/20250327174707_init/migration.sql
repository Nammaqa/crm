/*
  Warnings:

  - You are about to drop the column `spocId` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `leadId` to the `Spoc` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_spocId_fkey";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "spocId";

-- AlterTable
ALTER TABLE "Spoc" ADD COLUMN     "leadId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Spoc" ADD CONSTRAINT "Spoc_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
