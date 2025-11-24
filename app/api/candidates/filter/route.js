import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clients = searchParams.getAll('clients');

  let where = {};
  if (clients.length > 0) {
    where.clientName = { in: clients };
  }

  try {
    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        demandCodeAssignments: {
          orderBy: { assignedDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify(candidates));
  } catch (error) {
    console.error("Filter error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch candidates" }), { status: 500 });
  }
}