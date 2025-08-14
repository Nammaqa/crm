// scripts/insertTestReminder.js
// Run: node scripts/insertTestReminder.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Set the reminder for 2 minutes from now
  const now = new Date();
  const followUpDateTime = new Date(now.getTime() + 2 * 60 * 1000);

  const reminder = await prisma.reminder.create({
    data: {
      companyName: 'Test Client',
      followUpDateTime,
      notes: 'This is a test reminder. You should receive an email in 2 minutes.',
      phoneNumber: '1234567890',
      creatorEmail: process.env.SMTP_USER || 'your@email.com',
      completed: false,
      // Add clientId if required by your schema
    },
  });

  console.log('Test reminder created:', reminder);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
