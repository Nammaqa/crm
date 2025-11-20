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

    const url = new URL(req.url);
    const withIds = url.searchParams.get("withIds");
    const statusFilter = url.searchParams.get("status"); // optional, e.g. ?status=Active

    // include both existing and new lead types
    const where: any = {
      salesName: valid.userName,
      leadType: { in: ["existing", "new"] },
    };

    // optionally filter by companyStatus if provided
    if (statusFilter) {
      where.companyStatus = statusFilter;
    }

    const leads = await prisma.lead.findMany({
      where,
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