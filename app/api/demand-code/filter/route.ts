import { verifyJwtToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const valid = token && (await verifyJwtToken(token));
        if (!valid) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        const { companyId } = await req.json();
        if (!companyId) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }
        const candidatelist = await prisma.candidate.findMany({
            where: { demandCode: companyId, acmanagerStatus: 'Selected' }
        })
        return NextResponse.json({ data: candidatelist, success: true });
    } catch (error) {
        console.error("API Error (GET /api/demand-code):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
