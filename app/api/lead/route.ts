import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Industry, Technology } from "@prisma/client"; 

interface SpocInput {
  name: string;
  email: string;
  contact: string;
  altContact?: string;
  designation: string;
  location: string;
}

// These arrays must match your Prisma schema enums exactly!
const TECHNOLOGY_ENUMS: Technology[] = [
  "development",
  "testing",
  "devops",
  "ai_ml",
  "ai",
  "other"
];
const INDUSTRY_ENUMS: Industry[] = [
  "it",
  "finance",
  "healthcare",
  "manufacturing",
  "retail",
  "education",
  "telecom",
  "automobile",
  "realestate",
  "logistics",
  "media",
  "government",
  "energy",
  "consulting",
  "other"
];

const ALLOWED_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? 'https://crm.wizzybox.in'
    : '*';

function withCors(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'false');
  return res;
}

// Health check endpoint for debugging
export async function HEAD() {
  return withCors(new Response("OK", { status: 200 }));
}

export async function OPTIONS() {
  return withCors(new Response(null, { status: 204 }));
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: { spocs: true },
    });
    return withCors(NextResponse.json(leads));
  } catch (error: unknown) {
    console.error("[GET ERROR]:", error);
    return withCors(
      NextResponse.json(
        { error: "Failed to fetch leads", details: (error as Error).message },
        { status: 500 }
      )
    );
  }
}

// Updated to be generic and type-safe
function mapToEnumOrOther<T extends string>(
  value: string,
  enumValues: readonly T[]
): { enumValue: T | "other" | null } {
  if (!value) return { enumValue: null };
  if (enumValues.includes(value as T)) {
    return { enumValue: value as T };
  }
  return { enumValue: "other" };
}

export async function POST(req: NextRequest) {
  let body: {
    employeeName: string;
    replacementReason: string;
    replacementToDate: string;
    replacementRequestDate: string;
    companySelect: string;
    companyNameGST: string;
    status: string;
    technology: string | "other";
    industry: string | "other";
    percentage: number;
    remarks: string;
    spocs: string[];
  };
  try {
    // Check content-type header
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return withCors(
        NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 })
      );
    }
    body = await req.json();
  } catch (err) {
    console.error("[POST JSON PARSE ERROR]:", err);
    return withCors(
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    );
  }

  try {
    
    const {
      salesName,
      leadType,
      businessType,
      companyName,
      companysize,
      companyID,
      numberOfEmployees,
      employeeID,
      employeeName,
      replacementReason,
      replacementToDate,
      replacementRequestDate,
      companySelect,
      companyNameGST,
      status,
      technology,
      industry,
      percentage,
      remarks,
      spocs,
    } = body;

    // // Validate required fields
    // if (!salesName || !companyName) {
    //   return withCors(
    //     NextResponse.json({ error: "Missing required fields: salesName, companyName" }, { status: 400 })
    //   );
    // }

    const techMap = mapToEnumOrOther<Technology>(technology, TECHNOLOGY_ENUMS);
    const indMap = mapToEnumOrOther<Industry>(industry, INDUSTRY_ENUMS);

    // Defensive: ensure spocs is an array if present
    let spocArray: SpocInput[] = [];
    if (Array.isArray(spocs)) {
      spocArray = spocs;
    } else if (spocs) {
      return withCors(
        NextResponse.json({ error: "spocs must be an array" }, { status: 400 })
      );
    }

    const lead = await prisma.lead.create({
      data: {
        salesName,
        leadType,
        businessType,
        companyName,
        companysize,
        companyID: companyID ? companyID : null,
        numberOfEmployees,
        employeeID,
        employeeName,
        replacementReason,
        replacementToDate: replacementToDate ? new Date(replacementToDate) : null,
        replacementRequestDate: replacementRequestDate ? new Date(replacementRequestDate) : null,
        companySelect,
        companyNameGST,
        status,
        technology: techMap.enumValue as Technology,
        industry: indMap.enumValue as Industry,
        percentage,
        remarks,
        spocs: {
          create: spocArray.map((spoc: SpocInput) => ({
            name: spoc.name,
            email: spoc.email,
            contact: spoc.contact,
            altContact: spoc.altContact,
            designation: spoc.designation,
            location: spoc.location,
          })),
        },
      },
      include: { spocs: true },
    });

    return withCors(NextResponse.json(lead, { status: 201 }));
  } catch (error: unknown) {
    // Prisma validation errors
    if (typeof error === "object" && error && "code" in error && (error as { code: string }).code === "P2002") {
      // Unique constraint failed
      return withCors(
        NextResponse.json(
          { error: "Duplicate entry", details: (error as { meta: unknown }).meta },
          { status: 409 }
        )
      );
    }
    console.error("[POST ERROR]:", error, (error as Error)?.message, (error as Error)?.stack);
    return withCors(
      NextResponse.json(
        { error: "Failed to create leads", details: (error as Error)?.message },
        { status: 500 }
      )
    );
  }
}