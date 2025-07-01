import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    const data = {
      ...raw,
      slNo: raw.slNo,
      assignedDate: new Date(raw.assignedDate),
      warrantyExpiry: raw.warrantyExpiry ? new Date(raw.warrantyExpiry) : null,
      mdmEnrolled: raw.mdmEnrolled === "Yes"
    };

    delete data.serialNo;

    // ✅ Remove IMEI if device is a Laptop
    if (data.deviceType === "LAPTOP") {
      delete data.imeiNumber;
    }

    const device = await prisma.device.create({ data });
    return NextResponse.json(device, { status: 201 });
  } catch (err) {
    console.error("❌ Error saving device:", err);
    return NextResponse.json({ error: "Failed to save device" }, { status: 500 });
  }
}
export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(devices);
  } catch (err) {
    console.error("❌ Error fetching devices:", err);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}