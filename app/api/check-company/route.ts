import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyName = searchParams.get("companyName");

    if (!companyName) {
      return NextResponse.json({ unique: true });
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        companyName: {
          equals: companyName,
          mode: "insensitive",
        },
      },
      select: {
        salesName: true,
      },
    });

    if (existingLead) {
      return NextResponse.json({
        unique: false,
        addedBy: existingLead.salesName,
      });
    }

    return NextResponse.json({ unique: true });
  } catch (error) {
    console.error("Error checking company uniqueness:", error);
    return NextResponse.json({ unique: true });
  }
}
