import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify(candidates), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("ACmanager API error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch candidates" }), { status: 500 });
  }
}