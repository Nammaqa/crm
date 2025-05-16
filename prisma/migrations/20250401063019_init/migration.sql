/*
  Warnings:

  - Changed the type of `leadType` on the `Lead` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "leadType",
ADD COLUMN     "leadType" "leadstatus" NOT NULL;
