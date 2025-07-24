import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// One-time test route
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
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

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.SMTP_USER, // Sending to the same email
      subject: 'Test Email from CRM',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your CRM application.</p>
        <p>If you're receiving this, your email configuration is working correctly!</p>
        <p>Current time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!' 
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email', 
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
