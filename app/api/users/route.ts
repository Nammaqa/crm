// File: app/api/users/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client"; // Import your enum from Prisma

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get("role");

  if (!roleParam || !Object.values(Role).includes(roleParam as Role)) {
    return NextResponse.json(
      { error: "Invalid or missing 'role' query parameter." },
      { status: 400 }
    );
  }

  const role = roleParam as Role;

  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true, userName: true },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("Error fetching users by role:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
