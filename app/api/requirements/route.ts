import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ GET all requirements
export async function GET() {
  try {
    console.log("GET /api/requirements - Fetching all requirements");

    const requirements = await prisma.requirement.findMany();

    console.log("GET /api/requirements - Success", requirements.length, "items found");

    return NextResponse.json(requirements, { status: 200 });
  } catch (error) {
    console.error("GET /api/requirements - Error:", error);
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

// ✅ POST a new requirement
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("POST /api/requirements - Received Data:", data);

    const newRequirement = await prisma.requirement.create({
      data: {
        requirementName: data.requirementName,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
        experience: data.experience,
        noticePeriod: data.noticePeriod,
        positions: data.positions,
        primarySkills: data.primarySkills,
        secondarySkills: data.secondarySkills,
        closePositions: data.closePositions,
        requirementType: data.requirementType,
        workLocation: data.workLocation,
      },
    });

    console.log("POST /api/requirements - Created:", newRequirement);

    return NextResponse.json(newRequirement, { status: 201 });

  } catch (error) {
    console.error("POST /api/requirements - Error:", error);
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}

// ✅ PUT update a requirement
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("PUT /api/requirements - Body:", body);

    const { id, ...data } = body;
    if (!id) {
      console.error("PUT /api/requirements - Missing ID");
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const updatedRequirement = await prisma.requirement.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    console.log("PUT /api/requirements - Updated:", updatedRequirement);

    return NextResponse.json(updatedRequirement, { status: 200 });

  } catch (error) {
    console.error("PUT /api/requirements - Error:", error);
    return NextResponse.json({ error: 'Failed to update requirement' }, { status: 500 });
  }
}

// ✅ DELETE a requirement
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    console.log("DELETE /api/requirements - ID:", id);

    if (!id) {
      console.error("DELETE /api/requirements - Missing ID");
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const deletedRequirement = await prisma.requirement.delete({
      where: { id: parseInt(id, 10) },
    });

    console.log("DELETE /api/requirements - Deleted:", deletedRequirement);

    return NextResponse.json(deletedRequirement, { status: 200 });

  } catch (error) {
    console.error("DELETE /api/requirements - Error:", error);
    return NextResponse.json({ error: 'Failed to delete requirement' }, { status: 500 });
  }
}
