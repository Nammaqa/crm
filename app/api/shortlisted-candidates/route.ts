import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userName = req.nextUrl.searchParams.get("userName");

    if (!userName) {
      return NextResponse.json(
        { success: false, message: "Missing userName" },
        { status: 400 }
      );
    }

    // 1) Find requirements created by this BD (updatedBy). Use case-insensitive match.
    const userRequirements = await prisma.requirement.findMany({
      where: {
        updatedBy: {
          equals: userName,
          mode: "insensitive"
        }
      },
      select: { requirementId: true } // <--- MATCHES your schema field name
    });

    const userRequirementIds = userRequirements
      .map(r => r.requirementId?.trim())
      .filter(Boolean);

    if (userRequirementIds.length === 0) {
      console.log(`[shortlisted-candidates] no requirements found for user=${userName}`);
      return NextResponse.json({
        success: true,
        data: [],
        message: "No requirements found for this user."
      });
    }

    // 2) Fetch candidates whose demandCode is in the user's requirement IDs,
    //    and whose acmanagerStatus is Selected or Shortlisted.
    const candidates = await prisma.candidate.findMany({
      where: {
        demandCode: { in: userRequirementIds },
        acmanagerStatus: {
          in: ["Selected", "Shortlisted"],
          mode: "insensitive"
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`[shortlisted-candidates] user=${userName} reqCount=${userRequirementIds.length} candidates=${candidates.length}`);

    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    // Log full error server-side for debugging
    console.error("[shortlisted-candidates] error:", error);
    // Return safe message to client
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
