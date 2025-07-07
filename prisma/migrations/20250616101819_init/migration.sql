-- -- CreateEnum
-- CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECRUITER', 'SALES', 'ACCOUNT_MANAGER');

-- -- CreateEnum
-- CREATE TYPE "AgreementType" AS ENUM ('MSA', 'NDA', 'SOW', 'PO');

-- -- CreateEnum
-- CREATE TYPE "LeadStatus" AS ENUM ('prospective', 'newlead', 'existing', 'deal', 'NEW');

-- -- CreateEnum
-- CREATE TYPE "LeadType" AS ENUM ('prospective', 'new', 'existing', 'deal');

-- -- CreateEnum
-- CREATE TYPE "ReplacementReason" AS ENUM ('resigned', 'performance_issue', 'employee_concern');

-- -- CreateEnum
-- CREATE TYPE "Technology" AS ENUM ('development', 'testing', 'devops', 'ai_ml', 'ai', 'digital_marketing', 'data_analytics', 'other');

-- -- CreateEnum
-- CREATE TYPE "Industry" AS ENUM ('it', 'finance', 'healthcare', 'manufacturing', 'retail', 'education', 'telecom', 'automobile', 'realestate', 'logistics', 'media', 'government', 'energy', 'consulting', 'other');

-- -- CreateTable
-- CREATE TABLE "User" (
--     "id" SERIAL NOT NULL,
--     "userName" TEXT NOT NULL,
--     "wbEmailId" TEXT,
--     "password" TEXT NOT NULL,
--     "phoneNumber" TEXT,
--     "role" "Role" NOT NULL DEFAULT 'SALES',
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "User_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "Agreement" (
--     "id" SERIAL NOT NULL,
--     "clientName" TEXT NOT NULL,
--     "employeeName" TEXT,
--     "type" "AgreementType",
--     "technology" "Technology",
--     "otherTechnology" TEXT,
--     "poNumber" INTEGER,
--     "startDate" TIMESTAMP(3),
--     "endDate" TIMESTAMP(3),
--     "fileUpload" TEXT,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "Requirement" (
--     "id" SERIAL NOT NULL,
--     "requirementName" TEXT NOT NULL,
--     "companyName" TEXT NOT NULL,
--     "jobDescription" TEXT NOT NULL,
--     "jdImage" TEXT,
--     "experience" INTEGER NOT NULL,
--     "noticePeriod" INTEGER NOT NULL,
--     "positions" INTEGER NOT NULL,
--     "primarySkills" TEXT NOT NULL,
--     "secondarySkills" TEXT NOT NULL,
--     "closePositions" TEXT NOT NULL,
--     "requirementType" TEXT NOT NULL,
--     "workLocation" TEXT NOT NULL,
--     "budget" INTEGER,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "Lead" (
--     "id" SERIAL NOT NULL,
--     "salesName" TEXT NOT NULL,
--     "companyName" TEXT NOT NULL,
--     "companyID" TEXT,
--     "numberOfEmployees" INTEGER NOT NULL DEFAULT 0,
--     "employeeName" TEXT,
--     "replacementToDate" TIMESTAMP(3),
--     "replacementRequestDate" TIMESTAMP(3),
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--     "status" "LeadStatus" NOT NULL DEFAULT 'prospective',
--     "companyNameGST" TEXT,
--     "companySelect" TEXT,
--     "companysize" TEXT,
--     "industry" "Industry",
--     "percentage" INTEGER,
--     "remarks" TEXT,
--     "technology" "Technology",
--     "technologyOther" TEXT,
--     "replacementReason" "ReplacementReason",
--     "leadType" "LeadType" NOT NULL,
--     "businessType" TEXT,

--     CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "Spoc" (
--     "id" SERIAL NOT NULL,
--     "name" TEXT NOT NULL,
--     "email" TEXT NOT NULL,
--     "contact" TEXT NOT NULL,
--     "altContact" TEXT,
--     "designation" TEXT NOT NULL,
--     "location" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--     "leadId" INTEGER NOT NULL,

--     CONSTRAINT "Spoc_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateIndex
-- CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "User_wbEmailId_key" ON "User"("wbEmailId");

-- -- AddForeignKey
-- ALTER TABLE "Spoc" ADD CONSTRAINT "Spoc_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 
