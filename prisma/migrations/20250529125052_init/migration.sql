/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Agreement` table. All the data in the column will be lost.
  - You are about to drop the column `employeeID` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "employeeId",
ADD COLUMN     "technology" "Technology";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "employeeID",
ADD COLUMN     "technologyOther" TEXT;
