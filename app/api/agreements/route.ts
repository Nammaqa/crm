import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/jwt';
import { AgreementType } from '@prisma/client';
import { uploadToCloudinary } from '@/lib/cloudinary';

const verifyAuth = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  return verifyJwtToken(token);
};

// GET all agreements
export async function GET(request: Request) {
  try {
    const decodedToken = verifyAuth(request);
    if (!decodedToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const agreements = await prisma.agreement.findMany({ orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ success: true, data: agreements });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch agreements' }, { status: 500 });
  }
}

// POST create a new agreement with file upload
export async function POST(request: Request) {
  try {
    const decodedToken = verifyAuth(request);
    if (!decodedToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const clientName = formData.get('clientName') as string;
    const employeeName = formData.get('employeeName') as string;
    const employeeId = formData.get('employeeId') as string;
    const type = formData.get('type') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const file = formData.get('fileUpload') as File;

    if (!clientName || !startDate || !endDate || !type) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: clientName, type, startDate, endDate are required',
      }, { status: 400 });
    }

    if ((type === 'SOW' || type === 'PO') && (!employeeName || !employeeId)) {
      return NextResponse.json({
        success: false,
        message: 'For SOW and PO agreements, employeeName and employeeId are required',
      }, { status: 400 });
    }

    let fileUploadPath: string | null = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileUploadPath = await uploadToCloudinary(buffer, `${clientName}_${Date.now()}`);
    }

    const agreement = await prisma.agreement.create({
      data: {
        clientName,
        employeeName: employeeName || null,
        employeeId: employeeId || null,
        type: type as AgreementType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        fileUpload: fileUploadPath,
      }
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
