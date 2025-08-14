// app/api/test-email/route.ts (or pages/api/test-email.ts if using Pages Router)
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || v.trim() === '') throw new Error(`Missing required env var: ${name}`);
  return v;
}

export async function GET() {
  try {
    const SMTP_HOST = mustEnv('SMTP_HOST');          // smtp.gmail.com
    const SMTP_PORT = Number(mustEnv('SMTP_PORT'));  // 465
    const SMTP_USER = mustEnv('SMTP_USER');          // full Gmail address
    const SMTP_PASS = mustEnv('SMTP_PASSWORD');      // app password
    const FROM      = mustEnv('SMTP_FROM_EMAIL');    // often same as SMTP_USER

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465 (SSL)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // Verify connectivity & credentials first (great for prod diagnostics)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"CRM" <${FROM}>`,      // Gmail prefers FROM === authenticated user
      to: SMTP_USER,                 // send to yourself for this test
      subject: 'Test Email from CRM (Prod)',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your CRM application (production).</p>
        <p>Current time (Asia/Kolkata): ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      id: info.messageId,
    });
  } catch (error: any) {
    // Minimal leak — no secrets
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error?.message ?? 'Unknown error',
        // Helpful redacted env presence flags (remove later if you want)
        envSeen: {
          HOST: !!process.env.SMTP_HOST,
          PORT: process.env.SMTP_PORT || null,
          USER: !!process.env.SMTP_USER,
          PASS: process.env.SMTP_PASSWORD ? '***' : null,
          FROM: !!process.env.SMTP_FROM_EMAIL,
        },
      },
      { status: 500 }
    );
  }
}
