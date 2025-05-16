/*
  Warnings:

  - You are about to drop the column `requirementType` on the `Lead` table. All the data in the column will be lost.
  - The `replacementReason` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReplacementReason" AS ENUM ('resigned', 'performance_issue', 'employee_concern');

-- CreateEnum
CREATE TYPE "Technology" AS ENUM ('development', 'testing', 'devops', 'ai_ml', 'ai');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('it', 'finance', 'healthcare', 'manufacturing', 'retail', 'education', 'telecom', 'automobile', 'realestate', 'logistics', 'media', 'government', 'energy', 'consulting');

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "requirementType",
ADD COLUMN     "companyNameGST" TEXT,
ADD COLUMN     "companySelect" TEXT,
ADD COLUMN     "companysize" TEXT,
ADD COLUMN     "dealType" TEXT,
ADD COLUMN     "industry" "Industry",
ADD COLUMN     "percentage" INTEGER,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "technology" "Technology",
ALTER COLUMN "numberOfEmployees" SET DEFAULT 0,
ALTER COLUMN "employeeID" DROP NOT NULL,
ALTER COLUMN "employeeName" DROP NOT NULL,
DROP COLUMN "replacementReason",
ADD COLUMN     "replacementReason" "ReplacementReason";

-- AlterTable
ALTER TABLE "Spoc" ALTER COLUMN "altContact" DROP NOT NULL;
