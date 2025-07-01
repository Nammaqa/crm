-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('LAPTOP', 'MOBILE');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "slNo" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeStatus" TEXT NOT NULL,
    "projectWorking" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "modelName" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceStatus" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "processor" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "osVersion" TEXT,
    "accessories" TEXT,
    "warrantyExpiry" TIMESTAMP(3),
    "color" TEXT,
    "config" TEXT,
    "imeiNumber" TEXT,
    "phoneNumber" TEXT,
    "simCardNumber" TEXT,
    "carrier" TEXT,
    "mdmEnrolled" BOOLEAN,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_imeiNumber_key" ON "Device"("imeiNumber");
