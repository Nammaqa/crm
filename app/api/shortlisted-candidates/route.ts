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

    // 1) Find requirements created by this BD (updatedBy)
    const userRequirements = await prisma.requirement.findMany({
      where: {
        updatedBy: {
          equals: userName,
          mode: "insensitive"
        }
      },
      select: { requirementId: true }
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

    // 2) Fetch candidates through demandCodeAssignments relation
    const candidates = await prisma.candidate.findMany({
      where: {
        demandCodeAssignments: {
          some: {
            demandCode: { in: userRequirementIds }
          }
        },
        acmanagerStatus: {
          equals: "Selected",
          mode: "insensitive"
        }
      },
      include: {
        demandCodeAssignments: true
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`[shortlisted-candidates] user=${userName} reqCount=${userRequirementIds.length} candidates=${candidates.length}`);

    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error("[shortlisted-candidates] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
