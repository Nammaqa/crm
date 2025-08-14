// scripts/insertTestReminderLocal.cjs
// Run: node scripts/insertTestReminderLocal.cjs

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Set the reminder for 2 minutes from now (local time)
  const now = new Date();
  const followUpDateTime = new Date(now.getTime() + 2 * 60 * 1000);

  // Format date and time for API fields
  const followUpDate = followUpDateTime.toISOString().slice(0, 10); // yyyy-mm-dd
  const followUpTime = followUpDateTime.toTimeString().slice(0, 5); // HH:MM

  // Use a valid clientId for your schema
  const clientId = 22;

  const reminder = await prisma.reminder.create({
    data: {
      clientId,
      companyName: 'Test Client (Local Time)',
      followUpDateTime,
      notes: 'This is a test reminder for local time. You should receive an email in 2 minutes.',
      phoneNumber: '1234567890',
      creatorEmail: process.env.SMTP_USER || 'your@email.com',
      completed: false,
    },
  });

  console.log('Test reminder created (local time):', reminder);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
