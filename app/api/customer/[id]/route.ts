import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadImagetoCloudinary } from '@/lib/cloudinary';

const prisma = new PrismaClient();

async function parseFormData(request: NextRequest) {
  const formData = await request.formData();
  const customer = JSON.parse(formData.get('customer') as string || '{}');
  const otherDetails = JSON.parse(formData.get('otherDetails') as string || '{}');
  const contactPersons = JSON.parse(formData.get('contactPersons') as string || '[]');
  const invoiceData = JSON.parse(formData.get('invoiceData') as string || '{}');
  let documentUrl: string | undefined = undefined;
  const file = formData.get('document') as File | null;
  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      documentUrl = await uploadImagetoCloudinary(buffer, 'invoice-documents');
    } catch (error) {
      throw new Error('File upload failed');
    }
  }
  return { customer, otherDetails, contactPersons, invoiceData, documentUrl };
}

// GET /api/customer/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing customer ID' }, { status: 400 });
    }
   const customer = await prisma.customer.findUnique({
  where: { id },
  select: {
    id: true,
    customerType: true,
    primaryContact: true,
    companyName: true,
    displayName: true,
    currency: true,
    emailAddress: true,
    phoneNumberWork: true,
    phoneNumberMobile: true,
    pan: true,
    paymentTerms: true,
    documents: true,
    department: true,
    designation: true,
    website: true,
    billingAttention: true,
    billingCountry: true,
    billingAddress: true,
    billingCity: true,
    billingState: true,
    billingPinCode: true,
    billingPhone: true,
    billingFax: true,
    remarks: true,
    createdAt: true,
    updatedAt: true,
    ContactPerson: true,
    Invoice: { include: { Item: true } },
  },
});
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch customer' }, { status: 500 });
  }
}

// PUT /api/customer/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing customer ID' }, { status: 400 });
    }
    const { customer, otherDetails, contactPersons, documentUrl } = await parseFormData(request);

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        customerType: customer.customerType || 'BUSINESS',
        primaryContact: customer.primaryName || '',
        companyName: customer.company || '',
        displayName: customer.displayName || '',
        currency: customer.currency || 'INR',
        emailAddress: customer.email || '',
        phoneNumberWork: customer.phone || '',
        pan: otherDetails.panNumber || '',
        paymentTerms: otherDetails.paymentTerms || 'NET_30',
        documents: documentUrl ? [documentUrl] : [],
        department: otherDetails.department || '',
        designation: otherDetails.designation || '',
        website: otherDetails.website || '',
        billingAttention: otherDetails.attention || '',
        billingCountry: otherDetails.country || 'India',
        billingAddress: otherDetails.address || '',
        billingCity: otherDetails.city || '',
        billingState: otherDetails.state || '',
        billingPinCode: otherDetails.pinCode || '',
        billingPhone: otherDetails.phone || '',
        billingFax: otherDetails.faxNumber || '',
        remarks: otherDetails.remarks || '',
      },
      include: { ContactPerson: true, Invoice: { include: { Item: true } } },
    });

    // Update contact persons: remove all and re-create
    await prisma.contactPerson.deleteMany({ where: { customerId: id } });
    if (contactPersons.length > 0) {
      await prisma.contactPerson.createMany({
        data: contactPersons.map((person: any) => ({
          customerId: id,
          salutation: person.salutation || '',
          firstName: person.firstName || '',
          lastName: person.lastName || '',
          emailAddress: person.email || '',
          workPhone: person.workPhone || '',
          mobile: person.mobile || '',
        })),
      });
    }

    const finalCustomer = await prisma.customer.findUnique({
      where: { id },
      include: { ContactPerson: true, Invoice: { include: { Item: true } } },
    });

    return NextResponse.json({ success: true, data: finalCustomer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update customer' }, { status: 500 });
  }
}