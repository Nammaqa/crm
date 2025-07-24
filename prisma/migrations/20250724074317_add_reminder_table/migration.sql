-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "followUpDateTime" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
