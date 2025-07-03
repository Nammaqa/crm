import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!candidate) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(candidate), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const data = await req.json();
    const updated = await prisma.candidate.update({
      where: { id: parseInt(params.id) },
      data,
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT error:", error);
    return new Response(JSON.stringify({ error: "Failed to update" }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.candidate.delete({
      where: { id: parseInt(params.id) },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete candidate" }), {
      status: 500,
    });
  }
}
