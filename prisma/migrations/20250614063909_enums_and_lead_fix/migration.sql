/*
  Warnings:

  - Changed the type of `leadType` on the `Lead` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('prospective', 'new', 'existing', 'deal');

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "leadType",
ADD COLUMN     "leadType" "LeadType" NOT NULL;

-- DropEnum
DROP TYPE "leadstatus";
