-- Add the enum first
CREATE TYPE "LeadType" AS ENUM ('prospective', 'new', 'existing', 'deal');

-- Add the new column with a default
ALTER TABLE "Lead" ADD COLUMN "leadType" "LeadType" NOT NULL DEFAULT 'prospective';

-- (Optional) If the old column was a different enum, drop it
DROP TYPE IF EXISTS "leadstatus";
