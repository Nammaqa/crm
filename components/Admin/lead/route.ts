import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const salesName = searchParams.get("salesName");

  if (!salesName) {
    return NextResponse.json({ error: "Missing salesName" }, { status: 400 });
  }

  try {
    const leads = await prisma.lead.findMany({
      where: { salesName },
      include: {
        spocs: true,
      },
    });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
