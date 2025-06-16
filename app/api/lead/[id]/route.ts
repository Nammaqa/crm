import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to add CORS headers to all responses
function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,PATCH,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// GET handler
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  if (!id || isNaN(leadId)) {
    return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { spocs: true },
    });

    if (!lead) {
      return withCors(NextResponse.json({ error: "Lead not found" }, { status: 404 }));
    }

    return withCors(NextResponse.json(lead));
  } catch (error: unknown) {
    console.error("[GET ERROR]:", error);
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  }
}

// PUT handler
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  if (!id || isNaN(leadId)) {
    return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error("[PUT JSON PARSE ERROR]:", err);
    return withCors(NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  try {
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { spocs: true },
    });

    if (!existingLead) {
      return withCors(NextResponse.json({ error: "Lead not found" }, { status: 404 }));
    }

    // Convert empty string to null for enum fields
    const safeIndustry = !body.industry || body.industry === "" ? null : body.industry;
    const safeTechnology = !body.technology || body.technology === "" ? null : body.technology;
    const safeLeadType = !body.leadType || body.leadType === "" ? null : body.leadType;
    const safeStatus = !body.status || body.status === "" ? null : body.status;
    const safeReplacementReason = !body.replacementReason || body.replacementReason === "" ? null : body.replacementReason;

    // If spocs are provided, delete old ones before creating new
    if (body.spocs) {
      await prisma.spoc.deleteMany({ where: { leadId } });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        salesName: body.salesName ?? existingLead.salesName,
        leadType: safeLeadType ?? existingLead.leadType,
        businessType: body.businessType ?? existingLead.businessType,
        companyName: body.companyName ?? existingLead.companyName,
        companysize: body.companysize ?? existingLead.companysize,
        companyID: body.companyID ?? existingLead.companyID,
        numberOfEmployees: body.numberOfEmployees ?? existingLead.numberOfEmployees,
        employeeName: body.employeeName ?? existingLead.employeeName,
        replacementReason: safeReplacementReason ?? existingLead.replacementReason,
        replacementRequestDate: body.replacementRequestDate
          ? new Date(body.replacementRequestDate)
          : existingLead.replacementRequestDate,
        companySelect: body.companySelect ?? existingLead.companySelect,
        companyNameGST: body.companyNameGST ?? existingLead.companyNameGST,
        status: safeStatus ?? existingLead.status,
        technology: safeTechnology ?? existingLead.technology,
        industry: safeIndustry ?? existingLead.industry,
        percentage: body.percentage ?? existingLead.percentage,
        remarks: body.remarks ?? existingLead.remarks,
        updatedAt: new Date(),
        ...(body.spocs && {
          spocs: {
            create: body.spocs.map((spoc: any) => ({
              name: spoc.name,
              email: spoc.email,
              contact: spoc.contact,
              altContact: spoc.altContact,
              designation: spoc.designation,
              location: spoc.location,
            })),
          },
        }),
      },
      include: { spocs: true },
    });

    return withCors(NextResponse.json(updatedLead));
  } catch (error: unknown) {
    console.error("[PUT ERROR]:", error);
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  }
}

// DELETE handler
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  if (!id || isNaN(leadId)) {
    return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));
  }

  try {
    await prisma.lead.delete({
      where: { id: leadId },
    });

    return withCors(NextResponse.json({ message: "Lead deleted successfully" }));
  } catch (error: unknown) {
    console.error("[DELETE ERROR]:", error);
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  }
}

// PATCH handler
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  if (!id || isNaN(leadId)) {
    return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error("[PATCH JSON PARSE ERROR]:", err);
    return withCors(NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  try {
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: { spocs: true },
    });

    return withCors(NextResponse.json(updatedLead));
  } catch (error: unknown) {
    console.error("[PATCH ERROR]:", error);
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}