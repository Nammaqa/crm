// File: app/api/Expences/route.ts
// (This is the main API route for expenses, unchanged except for consistency)
// Note: I've kept the spelling "Expences" as in the original code for the route path.

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json(expenses);
}

// Accepts JSON, not form-data!
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { date, item, description, amount, attachment } = data;
    if (!date || !item || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        item,
        description,
        amount: parseFloat(amount),
        attachment,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, date, item, description, amount, attachment } = data;
  const expense = await prisma.expense.update({
    where: { id },
    data: {
      date: new Date(date),
      item,
      description,
      amount: parseFloat(amount),
      attachment,
    },
  });
  return NextResponse.json(expense);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
