import { verifyJwtToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users/me
 * Returns the current user's basic info if authenticated.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const valid = token && await verifyJwtToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: "Unauthorised" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        userName: valid.userName
      },
      select: {
        userName: true,
        wbEmailId: true
      }
    });

    return NextResponse.json(
      { success: true, data: user || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error (GET /api/users/me):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/me
 * Updates the current user's profile info.
 * Accepts: { userName?: string, wbEmailId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const valid = token && await verifyJwtToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: "Unauthorised" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { userName, wbEmailId } = data;

    // Validate input (add more as needed)
    if (userName && !/^[a-zA-Z0-9_\s]+$/.test(userName)) {
      return NextResponse.json(
        { error: "Invalid userName." },
        { status: 400 }
      );
    }
    if (wbEmailId && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(wbEmailId)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { userName: valid.userName },
      data: {
        ...(userName && { userName }),
        ...(wbEmailId && { wbEmailId }),
      },
      select: {
        userName: true,
        wbEmailId: true
      }
    });

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error (POST /api/users/me):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}