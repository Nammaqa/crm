import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import type { NextRequest } from 'next/server';

interface ReminderInput {
  clientId: string;
  companyName: string;
  phoneNumber: string;
  followUpDateTime: string;
  notes?: string;
  creatorEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ReminderInput = await request.json();
    
    const reminder = await prisma.reminder.create({
      data: {
        clientId: parseInt(data.clientId),
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        followUpDateTime: new Date(data.followUpDateTime),
        notes: data.notes,
        creatorEmail: data.creatorEmail
      }
    });

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: { followUpDateTime: 'asc' },
      include: { lead: true }
    });
    
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}
