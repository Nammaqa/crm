import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
// import nodemailer from 'nodemailer';
import type { NextRequest } from 'next/server';

interface ReminderData {
  clientName: string;
  followUpDate: string;
  followUpTime: string;
  notes?: string;
  phoneNumber: string;
  creatorEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ReminderData = await request.json();
    const { clientName, followUpDate, followUpTime, notes, phoneNumber, creatorEmail } = data;


    // Save the reminder to the database with the correct followUpDateTime
    const followUpDateTime = new Date(`${followUpDate}T${followUpTime}`);
    await prisma.reminder.create({
      data: {
        companyName: clientName,
        followUpDateTime,
        notes,
        phoneNumber,
        creatorEmail,
        completed: false,
        // You may need to add clientId or other fields as required by your schema
      }
    });

  return NextResponse.json({ message: 'Reminder scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return NextResponse.json({ error: 'Failed to schedule reminder' }, { status: 500 });
  }
}
