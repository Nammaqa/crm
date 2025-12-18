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
    console.log(` Created ADMIN user: ${admin.userName}`);
  } else {
    console.log(' Admin user already exists, skipping creation');
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
    console.log(` Created SUPERADMIN user: ${superadmin.userName}`);
  } else {
    console.log(' Superadmin user already exists, skipping creation');
  }
  // Invoice Admin
  const invoiceadminexists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'invoice' },
        { wbEmailId: 'invoice@wizzybox.com' },
      ],
    }
  })
  if (!invoiceadminexists) {
    const hashedPassword = await bcrypt.hash('invoice123', 12);
    const invoiceadmin = await prisma.user.create({
      data: {
        userName: 'invoice',
        wbEmailId: 'invoice@wizzybox.com',
        password: hashedPassword,
        phoneNumber: '9876543210',
        role: Role.INVOICE,
      },
    });
    console.log('Invoice admin created ', invoiceadmin)
  }else{
    console.log('Invoice admin already exists')
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
    console.log(` Created IT_ADMIN user: ${itadmin.userName}`);
  } else {
    console.log('IT_ADMIN user already exists, skipping creation');
  }

  // Account Manager user
  const amExists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'Default account manager' },
        { wbEmailId: 'accountmanager@wizzybox.com' },
      ],
    },
  });

  if (!amExists) {
    const hashedPassword = await bcrypt.hash('accountmanager123', 12);
    const am = await prisma.user.create({
      data: {
        userName: 'Default account manager',
        wbEmailId: 'accountmanager@wizzybox.com',
        password: hashedPassword,
        phoneNumber: '9999999999',
        role: Role.ACCOUNT_MANAGER,
      },
    });
    console.log(` Created ACCOUNT_MANAGER user: ${am.userName}`);
  } else {
    console.log(' ACCOUNT_MANAGER user already exists, skipping creation');
  }

  // Sales user
  const salesExists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'sales' },
        { wbEmailId: 'sales@wizzybox.com' },
      ],
    },
  });

  if (!salesExists) {
    const hashedPassword = await bcrypt.hash('sales123', 12);
    const sales = await prisma.user.create({
      data: {
        userName: 'sales',
        wbEmailId: 'sales@wizzybox.com',
        password: hashedPassword,
        phoneNumber: '7777777777',
        role: Role.SALES,
      },
    });
    console.log(` Created SALES user: ${sales.userName}`);
  } else {
    console.log(' SALES user already exists, skipping creation');
  }

  // HR user
  const hrExists = await prisma.user.findFirst({
    where: {
      OR: [
        { userName: 'hr' },
        { wbEmailId: 'hr@wizzybox.com' },
      ],
    },
  });

  if (!hrExists) {
    const hashedPassword = await bcrypt.hash('hr123', 12);
    const hr = await prisma.user.create({
      data: {
        userName: 'hr',
        wbEmailId: 'hr@wizzybox.com',
        password: hashedPassword,
        phoneNumber: '6666666666',
        role: Role.RECRUITER,
      },
    });
    console.log(` Created HR user: ${hr.userName}`);
  } else {
    console.log(' HR user already exists, skipping creation');
  }

  // Agreements check
  const agreementCount = await prisma.agreement.count();
  if (agreementCount === 0) {
    console.log(' No agreements present; consider seeding sample agreements if needed.');
  } else {
    console.log(' Agreements already exist, skipping creation');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(' Error in seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
