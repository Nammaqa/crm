// scripts/sendDueReminders.cjs
// Run: node scripts/sendDueReminders.cjs

const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 1000); // next 1 minute

  // Find reminders due in the next minute and not yet sent
  const dueReminders = await prisma.reminder.findMany({
    where: {
      followUpDateTime: {
        lte: soon,
        gte: now,
      },
      completed: false,
    },
  });

  if (dueReminders.length === 0) {
    console.log('No reminders due at this time.');
    return;
  }

  // Setup mail transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  for (const reminder of dueReminders) {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: reminder.creatorEmail,
      subject: `Follow-up Reminder: ${reminder.companyName}`,
      html: `
        <h2>Follow-up Reminder</h2>
        <p><strong>Client:</strong> ${reminder.companyName}</p>
        <p><strong>Date & Time:</strong> ${new Date(reminder.followUpDateTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
        <p><strong>Phone:</strong> ${reminder.phoneNumber}</p>
        ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
      `,
    };
    try {
      await transporter.sendMail(mailOptions);
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { completed: true },
      });
      console.log(`Sent reminder email for reminder ID ${reminder.id}`);
    } catch (err) {
      console.error(`Failed to send reminder for ID ${reminder.id}:`, err);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
