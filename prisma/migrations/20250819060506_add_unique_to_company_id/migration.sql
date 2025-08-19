/*
  Warnings:

  - A unique constraint covering the columns `[companyName]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyID]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Lead_companyType_key";

-- CreateIndex
CREATE UNIQUE INDEX "Lead_companyName_key" ON "Lead"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_companyID_key" ON "Lead"("companyID");
