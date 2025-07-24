/*
  Warnings:

  - Added the required column `creatorEmail` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "creatorEmail" TEXT NOT NULL,
ADD COLUMN     "spocId" INTEGER;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_spocId_fkey" FOREIGN KEY ("spocId") REFERENCES "Spoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
