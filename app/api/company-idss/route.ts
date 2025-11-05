import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/company-idss
 * Returns unique requirementId values from the Requirement table.
 */
export async function GET(req: NextRequest) {
  try {
    const rows = await prisma.requirement.findMany({
      select: { requirementId: true },
      orderBy: { requirementId: "asc" },
    });

    const uniqueIds = [
      ...new Set(
        rows
          .map((r) => r.requirementId?.trim())
          .filter((id): id is string => Boolean(id))
      ),
    ];

    return NextResponse.json(uniqueIds, { status: 200 });
  } catch (error) {
    console.error("Error fetching requirement IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement IDs" },
      { status: 500 }
    );
  }
}
