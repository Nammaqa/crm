import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadImagetoCloudinary } from '@/lib/cloudinary';


const prisma = new PrismaClient();


export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const date = formData.get('date');
    const item = formData.get('item');
    const description = formData.get('description');
    const amount = formData.get('amount');
    const file = formData.get('attachment');
    let attachmentUrl = '';
    if (file && typeof file !== 'string' && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachmentUrl = await uploadImagetoCloudinary(buffer, 'expense-attachments');
    }
    if (!date || !item || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        item,
        description,
        amount: parseFloat(amount),
        attachment: attachmentUrl,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get('id'));
    const date = formData.get('date');
    const item = formData.get('item');
    const description = formData.get('description');
    const amount = formData.get('amount');
    const file = formData.get('attachment');
    let attachmentUrl = formData.get('existingAttachment') || '';
    if (file && typeof file !== 'string' && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachmentUrl = await uploadImagetoCloudinary(buffer, 'expense-attachments');
    }
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(date),
        item,
        description,
        amount: parseFloat(amount),
        attachment: attachmentUrl,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update expense', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense', details: error.message }, { status: 500 });
  }
}