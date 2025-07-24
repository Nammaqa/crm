import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import nodemailer from 'nodemailer';
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

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Format the date and time for email
    const reminderDate = new Date(`${followUpDate}T${followUpTime}`);
    const formattedDate = reminderDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: creatorEmail, // Send to the user who created the reminder
      subject: `Follow-up Reminder: ${clientName}`,
      html: `
        <h2>Follow-up Reminder</h2>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      `
    };

    // Schedule the email to be sent at 9:30 AM on the specified date
    const reminderTime = new Date(followUpDate);
    reminderTime.setHours(9, 30, 0, 0);
    
    // If the reminder time is in the future, schedule the email
    if (reminderTime > new Date()) {
      setTimeout(async () => {
        try {
          await transporter.sendMail(mailOptions);
        } catch (error) {
          console.error('Error sending reminder email:', error);
        }
      }, reminderTime.getTime() - Date.now());
    }

    return NextResponse.json({ message: 'Reminder scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return NextResponse.json({ error: 'Failed to schedule reminder' }, { status: 500 });
  }
}
