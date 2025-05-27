// File: app/api/lead/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Spoc } from "@prisma/client";

// Helper to add CORS headers to all responses
function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,PATCH,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  const leadId = parseInt(id);

  if (isNaN(leadId)) return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { spocs: true },
    });

    if (!lead) return withCors(NextResponse.json({ error: "Lead not found" }, { status: 404 }));
    return withCors(NextResponse.json(lead));
  } catch (error: unknown) {
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  const leadId = parseInt(id);

  if (!id || isNaN(leadId)) {
    return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));
  }

  try {
    const body = await req.json();

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { spocs: true },
    });

    if (!existingLead) return withCors(NextResponse.json({ error: "Lead not found" }, { status: 404 }));

    const {
      salesName = existingLead.salesName,
      leadType = existingLead.leadType,
      businessType = existingLead.businessType,
      companyName = existingLead.companyName,
      companysize = existingLead.companysize,
      companyID = existingLead.companyID,
      numberOfEmployees = existingLead.numberOfEmployees,
      employeeID = existingLead.employeeID,
      employeeName = existingLead.employeeName,
      replacementReason = existingLead.replacementReason,
      replacementToDate = existingLead.replacementToDate,
      replacementRequestDate = existingLead.replacementRequestDate,
      companySelect = existingLead.companySelect,
      companyNameGST = existingLead.companyNameGST,
      status = existingLead.status,
      technology = existingLead.technology,
      industry = existingLead.industry,
      percentage = existingLead.percentage,
      remarks = existingLead.remarks,
      spocs = existingLead.spocs,
    } = body;

    if (body.spocs) {
      await prisma.spoc.deleteMany({ where: { leadId } });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
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
        replacementToDate: replacementToDate ? new Date(replacementToDate) : undefined,
        replacementRequestDate: replacementRequestDate ? new Date(replacementRequestDate) : undefined,
        companySelect,
        companyNameGST,
        status,
        technology,
        industry,
        percentage,
        remarks,
        updatedAt: new Date(),
        ...(body.spocs && {
          spocs: {
            create: spocs.map((spoc: Spoc) => ({
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
    console.log("[PUT ERROR]:", error);
    console.log("[PUT ERROR MESSAGE]:", (error as Error).message);
    console.log("[PUT ERROR STACK]:", (error as Error).stack);
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  const leadId = parseInt(id);

  try {
    await prisma.spoc.deleteMany({ where: { leadId } });
    const deletedLead = await prisma.lead.delete({ where: { id: leadId } });
    return withCors(NextResponse.json(deletedLead));
  } catch (error: unknown) {
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  const leadId = parseInt(id);

  if (isNaN(leadId)) {
    return withCors(NextResponse.json({ error: "Invalid lead ID" }, { status: 400 }));
  }

  try {
    const body = await req.json();
    const { leadType, status } = body;

    console.log("[PATCH] Received body:", body);  // Log request body

    // Update leadType and status in the database
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadType,   // Update leadType
        status,     // Update status
        updatedAt: new Date(),  // Update timestamp
      },
      include: { spocs: true },  // Include spocs if needed
    });

    console.log("[PATCH] Updated lead:", updatedLead);  // Log updated lead

    return withCors(NextResponse.json(updatedLead));
  } catch (error: unknown) {
    console.error("[PATCH ERROR]:", error);  // Log any errors
    return withCors(NextResponse.json({ error: (error as Error).message }, { status: 500 }));
  } finally {
    await prisma.$disconnect();
  }
}