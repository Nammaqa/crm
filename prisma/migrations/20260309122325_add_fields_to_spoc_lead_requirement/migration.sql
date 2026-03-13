-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "companyLinkedInUrl" TEXT,
ADD COLUMN     "companyWebsite" TEXT;

-- AlterTable
ALTER TABLE "public"."Requirement" ADD COLUMN     "workLocationDetails" TEXT;

-- AlterTable
ALTER TABLE "public"."Spoc" ADD COLUMN     "linkedinUrl" TEXT;
