import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const raw = await req.json();

    const data = {
      ...raw,
      slNo: (raw.slNo || raw.serialNo || "0"), // Ensure slNo is present as number
      assignedDate: new Date(raw.assignedDate),
      warrantyExpiry: raw.warrantyExpiry ? new Date(raw.warrantyExpiry) : null,
      mdmEnrolled: raw.mdmEnrolled === "Yes"
    };

    // Remove serialNo and conditionally imeiNumber
    delete data.serialNo;
    if (data.deviceType === "LAPTOP") {
      delete data.imeiNumber;
    }

    const updated = await prisma.device.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(updated);
  } catch (err: any) {
      console.error("❌ Error saving device:", err);
  
      let errorMessage = "Failed to save device";
  
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          errorMessage = `Duplicate entry: ${err.meta?.target?.join(", ")}`;
        }
      }
  
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.device.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting device:", error);
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
  }
}
