/*
  Warnings:

  - You are about to drop the column `demandCode` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Candidate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Candidate" DROP COLUMN "demandCode",
DROP COLUMN "feedback",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "public"."DemandCodeAssignment" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "demandCode" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "feedback" TEXT,
    "clientInterviewStatus" TEXT,
    "notes" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandCodeAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DemandCodeAssignment" ADD CONSTRAINT "DemandCodeAssignment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
