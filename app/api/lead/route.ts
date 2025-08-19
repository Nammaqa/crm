import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Industry, Technology, LeadType, LeadStatus } from "@prisma/client";

interface SpocInput {
  name: string;
  email: string;
  contact: string;
  altContact?: string;
  designation: string;
  location: string;
}

const TECHNOLOGY_ENUMS: Technology[] = [
  "development",
  "testing",
  "devops",
  "ai_ml",
  "ai",
  "digital_marketing",
  "data_analytics",
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
const LEAD_TYPE_ENUMS: LeadType[] = [
  "prospective",
  "new",
  "existing",
  "deal"
];
const STATUS_ENUMS: LeadStatus[] = [
  "prospective",
  "newlead",
  "existing",
  "deal",
  "NEW"
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
  let body: unknown;
  try {
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
      companyType,
      technologyOther,
      industryOther,
    } = body as Record<string, any>;

    // Validate required fields
    if (!salesName || !companyName || !leadType || !status) {
      return withCors(
        NextResponse.json(
          { error: "Missing required fields: salesName, companyName, leadType, status" },
          { status: 400 }
        )
      );
    }
    if (!LEAD_TYPE_ENUMS.includes(leadType)) {
      return withCors(
        NextResponse.json(
          { error: `Invalid leadType. Must be one of: ${LEAD_TYPE_ENUMS.join(", ")}` },
          { status: 400 }
        )
      );
    }
    if (!STATUS_ENUMS.includes(status)) {
      return withCors(
        NextResponse.json(
          { error: `Invalid status. Must be one of: ${STATUS_ENUMS.join(", ")}` },
          { status: 400 }
        )
      );
    }

    const techMap = mapToEnumOrOther<Technology>(technology, TECHNOLOGY_ENUMS);
    const indMap = mapToEnumOrOther<Industry>(industry, INDUSTRY_ENUMS);

    let spocArray: SpocInput[] = [];
    if (Array.isArray(spocs)) {
      spocArray = spocs;
    } else if (spocs) {
      return withCors(
        NextResponse.json({ error: "spocs must be an array" }, { status: 400 })
      );
    }

    // Fix: replacementReason must be null if empty string or undefined
    let replacementReasonValue = replacementReason;
    if (replacementReasonValue === "" || replacementReasonValue === undefined) {
      replacementReasonValue = null;
    }

    const lead = await prisma.lead.create({
      data: {
        salesName,
        leadType,
        businessType,
        companyName,
        companysize,
        companyID: companyID ? companyID : null,
        numberOfEmployees: numberOfEmployees ? Number(numberOfEmployees) : 0,
        employeeName,
        replacementReason: replacementReasonValue,
        replacementToDate: replacementToDate ? new Date(replacementToDate) : null,
        replacementRequestDate: replacementRequestDate ? new Date(replacementRequestDate) : null,
        companySelect,
        companyNameGST,
        status,
        technology: techMap.enumValue as Technology,
        industry: indMap.enumValue as Industry,
        percentage: percentage ? Number(percentage) : null,
        remarks,
        companyType, 
        technologyOther: technologyOther || null,
        // industryOther: industryOther || null,
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
    if (typeof error === "object" && error && "code" in error && (error as any).code === "P2002") {
      const target = (error as any).meta?.target as string[] | undefined;

      if (target && target.includes("companyID")) {
        return withCors(
          NextResponse.json(
            { error: "The company ID already exists" },
            { status: 409 }
          )
        );
      }

      if (target && target.includes("companyName")) {
        // find the existing lead to get salesName
        const existingLead = await prisma.lead.findFirst({
          where: { companyName: (body as any).companyName },
          select: { salesName: true },
        });

        if (existingLead) {
          return withCors(
            NextResponse.json(
              { error: `The company already exists for more contact "${existingLead.salesName}"` },
              { status: 409 }
            )
          );
        }

        return withCors(
          NextResponse.json(
            { error: "The company name already exists" },
            { status: 409 }
          )
        );
      }

      return withCors(
        NextResponse.json(
          { error: "Duplicate entry", details: (error as any).meta },
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