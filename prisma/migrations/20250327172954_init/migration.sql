-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "salesName" TEXT NOT NULL,
    "leadType" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "spocName" TEXT NOT NULL,
    "spocEmail" TEXT NOT NULL,
    "spocContact" TEXT NOT NULL,
    "spocAltContact" TEXT NOT NULL,
    "spocDesignation" TEXT NOT NULL,
    "spocLocation" TEXT NOT NULL,
    "companyID" TEXT NOT NULL,
    "numberOfEmployees" INTEGER NOT NULL,
    "employeeID" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "replacementReason" TEXT,
    "replacementToDate" TIMESTAMP(3),
    "replacementRequestDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_companyID_key" ON "Lead"("companyID");
