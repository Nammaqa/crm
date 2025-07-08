import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * GET /api/company-ids
 * Returns all unique, non-empty companyID values from the Lead table.
 */
export async function GET() {
  try {
    // Fetch all companyIDs from leads (can filter by leadType if needed)
    const leads = await prisma.lead.findMany({
      select: { companyID: true },
      orderBy: { companyID: "asc" }
    });

    // Extract, filter out null/empty, and deduplicate
    const uniqueIds = Array.from(
      new Set(
        leads
          .map(l => l.companyID)
          .filter(id => id && typeof id === "string" && id.trim() !== "")
      )
    );

    // Return as JSON
    return NextResponse.json(uniqueIds);
  } catch (error) {
    console.error("Failed to fetch company IDs:", error);
    return NextResponse.json({ error: "Failed to fetch company IDs" }, { status: 500 });
  }
}