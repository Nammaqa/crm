/*
  Warnings:

  - You are about to drop the column `spocAltContact` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `spocContact` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `spocDesignation` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `spocEmail` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `spocLocation` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `spocName` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `spocId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "spocAltContact",
DROP COLUMN "spocContact",
DROP COLUMN "spocDesignation",
DROP COLUMN "spocEmail",
DROP COLUMN "spocLocation",
DROP COLUMN "spocName",
ADD COLUMN     "spocId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Spoc" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "altContact" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spoc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_spocId_fkey" FOREIGN KEY ("spocId") REFERENCES "Spoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
