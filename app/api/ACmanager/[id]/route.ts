import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params?: Promise<{ id?: string }> }
): Promise<Response> {
  // Await params first
  const params = await context.params;
  const id = params?.id ? parseInt(params.id, 10) : NaN;

  if (isNaN(id)) {
    return new Response(
      JSON.stringify({ error: "Invalid candidate ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { acmanagerStatus, demandCode, acupdateby } = body;
  if (typeof acmanagerStatus === "undefined") {
    return new Response(
      JSON.stringify({ error: "Missing 'acmanagerStatus' in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        acmanagerStatus,
        ...(demandCode && { demandCode }),
        acupdateby,
      },
    });
    return new Response(
      JSON.stringify({ success: true, data: updated }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Update error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update candidate status" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

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