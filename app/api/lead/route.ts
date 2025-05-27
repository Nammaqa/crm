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
const ALLOWED_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? 'https://crm.wizzybox.in'
    : '*';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: { spocs: true },
    });
    return NextResponse.json(leads, { headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, 
      { headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }, status: 500 })
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

    return NextResponse.json(lead, { headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN } ,status:201});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create leads" }, 
      { headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }, status: 500 })
  }
}