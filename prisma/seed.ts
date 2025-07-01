// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminExists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'admin' },
        { wbEmailId: 'admin@example.com' },
      ],
    },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        userName: 'admin',
        wbEmailId: 'admin@example.com',
        password: hashedPassword,
        phoneNumber: '1234567890',
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Created ADMIN user: ${admin.userName}`);
  } else {
    console.log('ℹ️ Admin user already exists, skipping creation');
  }

  // Superadmin user
  const superadminExists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'superadmin' },
        { wbEmailId: 'superadmin@example.com' },
      ],
    },
  });

  if (!superadminExists) {
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    const superadmin = await prisma.user.create({
      data: {
        userName: 'superadmin',
        wbEmailId: 'superadmin@example.com',
        password: hashedPassword,
        phoneNumber: '9876543210',
        role: Role.SUPERADMIN,
      },
    });
    console.log(`✅ Created SUPERADMIN user: ${superadmin.userName}`);
  } else {
    console.log('ℹ️ Superadmin user already exists, skipping creation');
  }

  // IT Admin user
  const itadminExists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'itadmin' },
        { wbEmailId: 'itadmin@wizzbox.com' },
      ],
    },
  });

  if (!itadminExists) {
    const hashedPassword = await bcrypt.hash('itadmin123', 12);
    const itadmin = await prisma.user.create({
      data: {
        userName: 'itadmin',
        wbEmailId: 'itadmin@wizzbox.com',
        password: hashedPassword,
        phoneNumber: '8888888888',
        role: Role.IT_ADMIN,
      },
    });
    console.log(`✅ Created IT_ADMIN user: ${itadmin.userName}`);
  } else {
    console.log('ℹ️ IT_ADMIN user already exists, skipping creation');
  }

  // Agreements check
  const agreementCount = await prisma.agreement.count();
  if (agreementCount === 0) {
    console.log('ℹ️ No agreements present; consider seeding sample agreements if needed.');
  } else {
    console.log('ℹ️ Agreements already exist, skipping creation');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error in seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
