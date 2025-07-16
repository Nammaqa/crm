import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: /api/contact-person?customerId=123
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = Number(searchParams.get('customerId'));
  if (!customerId) {
    return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 });
  }
  const contactPersons = await prisma.contactPerson.findMany({
    where: { customerId },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json({ success: true, data: contactPersons });
}

// POST: Create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, salutation, firstName, lastName, emailAddress, workPhone, mobile } = body;
    if (!customerId || !firstName || !lastName || !emailAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const newPerson = await prisma.contactPerson.create({
      data: {
        customerId,
        salutation,
        firstName,
        lastName,
        emailAddress,
        workPhone,
        mobile,
      },
    });
    return NextResponse.json({ success: true, data: newPerson }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update contact (by id)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    const body = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing contact person ID' }, { status: 400 });

    const updated = await prisma.contactPerson.update({
      where: { id },
      data: {
        salutation: body.salutation,
        firstName: body.firstName,
        lastName: body.lastName,
        emailAddress: body.emailAddress,
        workPhone: body.workPhone,
        mobile: body.mobile,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove contact (by id)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ success: false, error: 'Missing contact person ID' }, { status: 400 });
    await prisma.contactPerson.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Contact person deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}