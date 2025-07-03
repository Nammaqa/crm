import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid candidate ID" }), {
        status: 400,
      });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id },
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid candidate ID" }), {
        status: 400,
      });
    }

    const data = await req.json();

    const updated = await prisma.candidate.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT error:", error);

    const errorMessage = error.code === "P2025"
      ? "Candidate not found for update"
      : "Failed to update candidate";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: "Invalid candidate ID" }), {
        status: 400,
      });
    }

    await prisma.candidate.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE error:", error);

    const errorMessage = error.code === "P2025"
      ? "Candidate not found for deletion"
      : "Failed to delete candidate";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
