import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const companyID = new URL(req.url).searchParams.get("companyID");
  if (!companyID) {
    return NextResponse.json({ error: "Missing companyID" }, { status: 400 });
  }
  // Find all requirements for this companyID
  const requirements = await prisma.requirement.findMany({
    where: { requirementId: { startsWith: `${companyID}-REQ` } },
    select: { requirementId: true }
  });
  // Extract sequence numbers
  let maxSeq = 0;
  requirements.forEach(r => {
    const match = r.requirementId.match(/-REQ(\d{3})$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  return NextResponse.json({ nextSeq: maxSeq + 1 });
}