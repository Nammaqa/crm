import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all companyIDs from Lead table
    const leads = await prisma.lead.findMany({
      select: { companyID: true },
      orderBy: { companyID: "asc" }
    });
    // Extract unique, non-empty companyIDs
    const uniqueIds = Array.from(
      new Set(
        leads
          .map(l => l.companyID)
          .filter(id => id && typeof id === "string" && id.trim() !== "")
      )
    );
    return Response.json(uniqueIds);
  } catch (error) {
    return Response.json({ error: "Failed to fetch company IDs" }, { status: 500 });
  }
}