import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all non-null companyIDs directly from the DB
    const leads = await prisma.lead.findMany({
      where: {
        companyID: { not: null },
      },
      select: { companyID: true },
      orderBy: { companyID: "asc" },
    });

    // Extract unique companyIDs
    const uniqueIds = [...new Set(
      leads
        .map((lead) => lead.companyID?.trim())
        .filter((id) => id && id !== "")
    )];

    // Return as JSON response
    return new Response(JSON.stringify(uniqueIds), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching company IDs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch company IDs" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
