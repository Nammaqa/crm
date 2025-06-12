-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('prospective', 'newlead', 'existing', 'deal');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "leadStatus" "LeadStatus" NOT NULL DEFAULT 'prospective';
