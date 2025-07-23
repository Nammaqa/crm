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
        shippingAttention: otherDetails.shippingAttention || '',
        shippingCountry: otherDetails.shippingCountry || '',
        shippingAddress: otherDetails.shippingAddress || '',
        shippingCity: otherDetails.shippingCity || '',
        shippingState: otherDetails.shippingState || '',
        shippingPinCode: otherDetails.shippingPinCode || '',
        shippingPhone: otherDetails.shippingPhone || '',
        remarks: otherDetails.remarks || '',
        gstNumber: otherDetails.gstNumber || '',
        gstTreatment: otherDetails.gstTreatment || '',
        placeOfSupply: otherDetails.placeOfSupply || '',
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
      include: { 
        ContactPerson: true, 
        Invoice: { 
          include: { Item: true },
          orderBy: { createdAt: 'desc' }
        } 
      },
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
        Invoice: { 
          include: { Item: true },
          orderBy: { createdAt: 'desc' }
        },
      },
      orderBy: { id: 'desc' },
    });
    
    // Return all fields needed by the frontend with enhanced invoice data
    return NextResponse.json({
      success: true,
      data: customers.map((c) => ({
        id: c.id,
        customerType: c.customerType,
        primaryContact: c.primaryContact,
        companyName: c.companyName,
        company: c.companyName,
        displayName: c.displayName,
        name: c.displayName,
        currency: c.currency,
        emailAddress: c.emailAddress,
        email: c.emailAddress,
        phoneNumberWork: c.phoneNumberWork,
        phone: c.phoneNumberWork,
        phoneNumberMobile: c.phoneNumberMobile,
        pan: c.pan,
        paymentTerms: c.paymentTerms,
        documents: c.documents,
        department: c.department,
        designation: c.designation,
        website: c.website,
        billingAttention: c.billingAttention,
        billingCountry: c.billingCountry,
        billingAddress: c.billingAddress,
        billingCity: c.billingCity,
        billingState: c.billingState,
        billingPinCode: c.billingPinCode,
        billingPhone: c.billingPhone,
        billingFax: c.billingFax,
        shippingAttention: c.shippingAttention,
        shippingCountry: c.shippingCountry,
        shippingAddress: c.shippingAddress,
        shippingCity: c.shippingCity,
        shippingState: c.shippingState,
        shippingPinCode: c.shippingPinCode,
        shippingPhone: c.shippingPhone,
        remarks: c.remarks,
        gstNumber: c.gstNumber,
        gstTreatment: c.gstTreatment,
        placeOfSupply: c.placeOfSupply,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        ContactPerson: c.ContactPerson,
        Invoice: c.Invoice.map((invoice) => ({
          id: invoice.id,
          invoiceCode: invoice.invoiceCode,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          total: invoice.total,
          discount: invoice.discount,
          gstRate: invoice.gstRate,
          terms: invoice.terms,
          notes: invoice.notes,
          status: invoice.status || 'Draft',
          isDraft: invoice.isDraft,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
          Item: invoice.Item,
          // Add computed fields for easier display
          date: invoice.invoiceDate,
          amount: invoice.total,
        })),
        // Add summary statistics
        totalInvoices: c.Invoice.length,
        totalAmount: c.Invoice.reduce((sum, inv) => sum + (inv.total || 0), 0),
        pendingAmount: c.Invoice
          .filter(inv => inv.status === 'Pending' || inv.isDraft)
          .reduce((sum, inv) => sum + (inv.total || 0), 0),
        latestInvoice: c.Invoice.length > 0 ? {
          id: c.Invoice[0].invoiceCode,
          date: c.Invoice[0].invoiceDate,
          dueDate: c.Invoice[0].dueDate,
          total: c.Invoice[0].total,
          status: c.Invoice[0].status || 'Draft'
        } : null,
      })),
    });
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
        gstNumber: otherDetails.gstNumber || '',
        gstTreatment: otherDetails.gstTreatment || '',
        placeOfSupply: otherDetails.placeOfSupply || '',
      },
      include: { 
        ContactPerson: true, 
        Invoice: { 
          include: { Item: true },
          orderBy: { createdAt: 'desc' }
        } 
      },
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
      include: { 
        ContactPerson: true, 
        Invoice: { 
          include: { Item: true },
          orderBy: { createdAt: 'desc' }
        } 
      },
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
