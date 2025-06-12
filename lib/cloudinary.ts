import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/jwt';
import { AgreementType, Technology } from '@prisma/client';
import { cookies } from 'next/headers';
import { uploadToCloudinary } from '@/lib/cloudinary';

const verifyAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || null;

  if (!token) {
    console.error('No token provided in cookies');
    return null;
  }
  if (token.split('.').length !== 3) {
    console.error('Malformed JWT:', token);
    return null;
  }
  return await verifyJwtToken(token);
};

export async function POST(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    if (!decodedToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const clientName = (formData.get('clientName') as string || '').trim();
    const employeeName = (formData.get('employeeName') as string || '').trim();
    const type = (formData.get('type') as string || '').trim();
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const technology = (formData.get('technology') as string || '').trim();
    const otherTechnology = (formData.get('otherTechnology') as string || '').trim();
    const poNumber = (formData.get('poNumber') as string || '').trim();
    const file = formData.get('fileUpload') as File;

    let fileUploadPath: string | null = null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Use your helper to upload to Cloudinary
      fileUploadPath = await uploadToCloudinary(buffer, file.name);
      if (!fileUploadPath) {
        return NextResponse.json({ success: false, message: 'File upload to Cloudinary failed' }, { status: 500 });
      }
    }

    // Save agreement with Cloudinary file URL
    const agreement = await prisma.agreement.create({
      data: {
        clientName: clientName || '',
        employeeName: employeeName || '',
        type: type ? (type as AgreementType) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        technology: technology ? (technology as Technology) : null,
        otherTechnology: technology === 'other' ? (otherTechnology || '') : null,
        poNumber: poNumber || null,
        fileUpload: fileUploadPath,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Agreement created successfully',
      data: agreement
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating agreement:', error);
    return NextResponse.json({ success: false, message: 'Failed to create agreement' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const agreements = await prisma.agreement.findMany();
    return NextResponse.json({ success: true, data: agreements });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch agreements' }, { status: 500 });
  }
}