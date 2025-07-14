import { verifyJwtToken } from "@/lib/jwt";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const valid = token && (await verifyJwtToken(token));
        if (!valid) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        // Fetch all distinct companyIDs from Lead table where salesName matches the logged-in user
        const leads = await prisma.lead.findMany({
            where: { salesName: valid.userName },
            select: { companyID: true },
            orderBy: { companyID: "asc" }
        });

        // Extract unique, non-empty companyIDs
        const uniqueIds = [
            ...new Set(
                leads
                    .map((l) => l.companyID)
                    .filter((id): id is string => !!id && id.trim() !== "")
            ),
        ];

        return NextResponse.json({ data: uniqueIds, success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch company IDs" }, { status: 500 });
    }
}