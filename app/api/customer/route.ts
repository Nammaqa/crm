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

export async function POST(request: NextRequest) {
  try {
    const { customer, otherDetails, contactPersons, invoiceData, documentUrl } = await parseFormData(request);
    const createdCustomer = await prisma.customer.create({
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
        ContactPerson: {
          create: contactPersons.map((person: any) => ({
            salutation: person.salutation || '',
            firstName: person.firstName || '',
            lastName: person.lastName || '',
            emailAddress: person.email || '',
            workPhone: person.workPhone || '',
            mobile: person.mobile || '',
          })),
        },
      },
      include: { ContactPerson: true, Invoice: { include: { Item: true } } },
    });
    return NextResponse.json({ success: true, data: createdCustomer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create customer' }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        ContactPerson: true,
        // Add Invoice if you want to aggregate receivables etc.
      },
      orderBy: { id: 'desc' },
    });
    // Optionally transform data for frontend
    const data = customers.map((c) => ({
      id: c.id,
      name: c.primaryContact,
      company: c.companyName,
      email: c.emailAddress,
      phone: c.phoneNumberWork,
    }));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ success: false, error: 'Missing customer ID' }, { status: 400 });
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ success: false, error: 'Missing customer ID' }, { status: 400 });
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete customer' }, { status: 500 });
  }
}