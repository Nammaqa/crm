import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/jwt';
import { deleteFile, saveFile } from '@/lib/fileUtils';
import { AgreementType, Technology } from '@prisma/client';
import { Prisma } from '@prisma/client';

// Helper function to verify authentication
const verifyAuth = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return null;
  }

  return verifyJwtToken(token);
};

// GET agreement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decodedToken = verifyAuth(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid agreement ID' },
        { status: 400 }
      );
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id },
    });

    if (!agreement) {
      return NextResponse.json(
        { success: false, message: 'Agreement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    console.error('Error fetching agreement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch agreement' },
      { status: 500 }
    );
  }
}

// DELETE agreement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decodedToken = verifyAuth(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid agreement ID' },
        { status: 400 }
      );
    }

    // Get the agreement to find the associated file
    const agreement = await prisma.agreement.findUnique({
      where: { id },
    });

    if (!agreement) {
      return NextResponse.json(
        { success: false, message: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Delete the associated file if exists
    if (agreement.fileUpload) {
      await deleteFile(agreement.fileUpload);
    }

    // Delete the agreement
    await prisma.agreement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Agreement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting agreement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete agreement' },
      { status: 500 }
    );
  }
}

// PUT update agreement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decodedToken = verifyAuth(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid agreement ID' },
        { status: 400 }
      );
    }

    // Check if agreement exists
    const existingAgreement = await prisma.agreement.findUnique({
      where: { id },
    });

    if (!existingAgreement) {
      return NextResponse.json(
        { success: false, message: 'Agreement not found' },
        { status: 404 }
      );
    }

    // For file updates, we need to handle form data
    const formData = await request.formData();

    // Get values from form data, use existing values as defaults
    const clientName = formData.has('clientName')
      ? (formData.get('clientName') as string)
      : existingAgreement.clientName;
    const employeeName = formData.has('employeeName')
      ? (formData.get('employeeName') as string)
      : existingAgreement.employeeName;
    const type = formData.has('type')
      ? (formData.get('type') as string)
      : (existingAgreement.type as string);
    const startDate = formData.has('startDate')
      ? (formData.get('startDate') as string)
      : existingAgreement.startDate.toISOString();
    const endDate = formData.has('endDate')
      ? (formData.get('endDate') as string)
      : existingAgreement.endDate.toISOString();
    const file = formData.get('fileUpload') as File | null;

    // Technology fields
    const technology = formData.has('technology')
      ? (formData.get('technology') as string)
      : (existingAgreement.technology as string);
    const otherTechnology = formData.has('otherTechnology')
      ? (formData.get('otherTechnology') as string)
      : existingAgreement.otherTechnology;

    // Validation for SOW/PO: employeeName required
    if ((type === 'SOW' || type === 'PO') && !employeeName) {
      return NextResponse.json(
        {
          success: false,
          message: 'For SOW and PO agreements, employeeName is required',
        },
        { status: 400 }
      );
    }

    // Technology validation
    const validTechnologies = [
      'development',
      'testing',
      'devops',
      'ai_ml',
      'ai',
      'digital_marketing',
      'data_analytics',
      'other',
    ];
    if ((type === 'SOW' || type === 'PO')) {
      if (!technology || !validTechnologies.includes(technology)) {
        return NextResponse.json(
          { success: false, message: 'Valid technology is required' },
          { status: 400 }
        );
      }
      if (technology === 'other' && (!otherTechnology || otherTechnology.trim() === '')) {
        return NextResponse.json(
          { success: false, message: 'Please specify the technology in Other field' },
          { status: 400 }
        );
      }
    }

    let fileUploadPath = existingAgreement.fileUpload;

    // If a new file is provided, delete the old one and save the new one
    if (file && (file as any).size > 0) {
      // Delete existing file if it exists
      if (existingAgreement.fileUpload) {
        await deleteFile(existingAgreement.fileUpload);
      }

      // Save the new file
      const bytes = await (file as any).arrayBuffer();
      const buffer = Buffer.from(bytes);
      const { relativePath } = await saveFile(buffer, (file as any).name);
      fileUploadPath = relativePath;
    }

    // Prepare update data, only including fields that were provided
    const updateData: Prisma.AgreementUpdateInput = {};

    if (formData.has('clientName')) updateData.clientName = clientName;
    if (formData.has('employeeName')) updateData.employeeName = employeeName || null;
    if (formData.has('type')) updateData.type = type as AgreementType;
    if (formData.has('startDate')) updateData.startDate = new Date(startDate);
    if (formData.has('endDate')) updateData.endDate = new Date(endDate);
    if (file && (file as any).size > 0) updateData.fileUpload = fileUploadPath;

    // Technology fields
    if (formData.has('technology')) updateData.technology = technology as Technology;
    if (formData.has('otherTechnology')) updateData.otherTechnology = technology === 'other' ? otherTechnology : null;

    // Update the agreement with only the changed fields
    const updatedAgreement = await prisma.agreement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Agreement updated successfully',
      data: updatedAgreement,
    });
  } catch (error) {
    console.error('Error updating agreement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update agreement' },
      { status: 500 }
    );
  }
}//agreement