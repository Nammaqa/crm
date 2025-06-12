/*
  Warnings:

  - The `companyID` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Lead_companyID_key";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "companyID",
ADD COLUMN     "companyID" INTEGER;
