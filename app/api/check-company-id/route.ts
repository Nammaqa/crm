import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyID = searchParams.get("companyID");

    if (!companyID) {
      return NextResponse.json(
        { unique: true, error: "No companyID provided" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { companyID },
      select: { companyID: true, salesName: true }
    });

    if (lead) {
      return NextResponse.json({
        unique: false,
        addedBy: lead.salesName || "",
      });
    }

    return NextResponse.json({ unique: true });
  } catch (error) {
    console.error("Check companyID error:", error);
    return NextResponse.json(
      { unique: true, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}