import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

// Fetch all requirements
export async function GET() {
  try {
    const requirements = await prisma.requirement.findMany();
    return NextResponse.json(requirements, { status: 200 });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

// Create a new requirement
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
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
    return NextResponse.json(newRequirement, { status: 201 });
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json({ error: 'Failed to create requirement' }, { status: 500 });
  }
}

// Update a requirement by ID
export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    const updatedRequirement = await prisma.requirement.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...data,
      },
    });
    return NextResponse.json(updatedRequirement, { status: 200 });
  } catch (error) {
    console.error('Error updating requirement:', error);
    return NextResponse.json({ error: 'Failed to update requirement' }, { status: 500 });
  }
}

// Delete a requirement by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const deletedRequirement = await prisma.requirement.delete({
      where: { id: parseInt(id, 10) },
    });
    return NextResponse.json(deletedRequirement, { status: 200 });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    return NextResponse.json({ error: 'Failed to delete requirement' }, { status: 500 });
  }
}