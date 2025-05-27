import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface SpocInput {
  name: string;
  email: string;
  contact: string;
  altContact?: string;
  designation: string;
  location: string;
}

// Helper to add CORS headers to all responses
function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: { spocs: true },
    });
    return withCors(NextResponse.json(leads));
  } catch {
    return withCors(
      NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
        technology,
        industry,
        percentage,
        remarks,
        spocs: {
          create: spocs.map((spoc: SpocInput) => ({
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
  } catch (error) {
    console.error(error);
    return withCors(
      NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
    );
  }
}