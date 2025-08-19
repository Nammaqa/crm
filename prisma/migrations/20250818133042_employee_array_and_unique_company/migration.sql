/*
  Warnings:

  - The `employeeName` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[companyType]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "employeeName",
ADD COLUMN     "employeeName" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Lead_companyType_key" ON "Lead"("companyType");
