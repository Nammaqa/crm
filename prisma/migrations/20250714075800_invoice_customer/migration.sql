-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT', 'DUE_END_OF_MONTH', 'DUE_END_OF_NEXT_MONTH');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "acmanagerStatus" TEXT,
ADD COLUMN     "acupdateby" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "companyType" TEXT;

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "customerType" "CustomerType" NOT NULL,
    "primaryContact" TEXT NOT NULL,
    "companyName" TEXT,
    "displayName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "phoneNumberWork" TEXT,
    "phoneNumberMobile" TEXT,
    "pan" TEXT,
    "paymentTerms" "PaymentTerms" NOT NULL,
    "documents" TEXT[],
    "billingAttention" TEXT,
    "billingCountry" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingState" TEXT NOT NULL,
    "billingPinCode" TEXT NOT NULL,
    "billingPhone" TEXT,
    "shippingAttention" TEXT,
    "shippingCountry" TEXT NOT NULL,
    "shippingAddress" TEXT[],
    "shippingCity" TEXT NOT NULL,
    "shippingState" TEXT NOT NULL,
    "shippingPinCode" TEXT NOT NULL,
    "shippingPhone" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "salutation" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "workPhone" TEXT,
    "mobile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "invoiceCode" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "terms" "PaymentTerms" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "customerNotes" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    "discountPercentage" DOUBLE PRECISION,
    "GstPercentage" DOUBLE PRECISION,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "itemDetails" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceCode_key" ON "Invoice"("invoiceCode");

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
