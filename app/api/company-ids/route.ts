import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const valid = token && (await verifyJwtToken(token));
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withIds = new URL(req.url).searchParams.get("withIds");
    const leads = await prisma.lead.findMany({
      where: {
        salesName: valid.userName,
        leadType: "existing"
      },
      select: {
        companyName: true,
        companyID: true,
      },
      distinct: ['companyName'],
    });

    if (withIds) {
      // Return [{ companyName, companyID }]
      return NextResponse.json(
        leads
          .filter(l => l.companyName && l.companyID)
          .map(l => ({ companyName: l.companyName, companyID: l.companyID }))
      );
    }

    // Extract and sort unique company names
    const companyNames = leads
      .map(lead => lead.companyName)
      .filter(name => name && name.trim() !== "")
      .sort();

    return NextResponse.json(companyNames);
  } catch (error) {
    console.error("API Error (GET /api/company-ids):", error);
    return NextResponse.json(
      { error: "Failed to fetch company names" }, 
      { status: 500 }
    );
  }
}