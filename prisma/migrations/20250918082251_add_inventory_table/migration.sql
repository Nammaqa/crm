-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemQuantity" INTEGER NOT NULL,
    "produceBroughtDate" TIMESTAMP(3) NOT NULL,
    "dateOfTakeForUse" TIMESTAMP(3),
    "quantityBalance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_serialNumber_key" ON "inventory"("serialNumber");
