import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: "Missing device ID in URL" }, { status: 400 });
    }

    const raw = await req.json();

    const data = {
      ...raw,
      assignedDate: new Date(raw.assignedDate),
      warrantyExpiry: raw.warrantyExpiry ? new Date(raw.warrantyExpiry) : null,
      mdmEnrolled: raw.mdmEnrolled === "Yes"
    };

    // Remove IMEI if device is a laptop
    if (data.deviceType === "LAPTOP") {
      delete data.imeiNumber;
    }

    const updatedDevice = await prisma.device.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedDevice);
  } catch (err) {
    console.error("❌ Error updating device:", err);
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: "Missing device ID in URL" }, { status: 400 });
    }

    await prisma.device.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting device:", err);
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
  }
}
