/*
  Warnings:

  - A unique constraint covering the columns `[requirementId]` on the table `Requirement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High');

-- AlterTable
ALTER TABLE "Requirement" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'Medium',
ADD COLUMN     "requirementId" TEXT NOT NULL DEFAULT 'TEMP_REQ_ID';

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_requirementId_key" ON "Requirement"("requirementId");
