-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "amountReceived" DOUBLE PRECISION,
ADD COLUMN     "balancedDue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "bankCharges" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentDocuments" TEXT[],
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentMode" TEXT,
ADD COLUMN     "paymentReceivedOn" TIMESTAMP(3),
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "taxDeducted" BOOLEAN;
