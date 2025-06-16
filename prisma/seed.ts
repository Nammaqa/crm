// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const adminExists = await prisma.user.findFirst({
    where: { 
      OR: [
        { userName: 'admin' },
        { wbEmailId: 'admin@example.com' }
      ]
    }
  });

  if (!adminExists) {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        userName: 'admin',
        wbEmailId: 'admin@example.com',
        password: hashedPassword,
        phoneNumber: '1234567890',
        role: 'ADMIN',
      },
    });
    
    console.log(`Created admin user: ${admin.userName}`);
  } else {
    console.log('Admin user already exists, skipping creation');
  }

  // Add some example agreements if none exist
  const agreementCount = await prisma.agreement.count();
  
  if (agreementCount === 0) 
  {
  //   await prisma.agreement.createMany({
  //     data: [
  //       {
  //         clientName: 'Acme Corporation',
  //         employeeName: 'John Doe',
  //         employeeId: 'EMP001',
  //         type: 'MSA',
  //         startDate: new Date('2023-01-01'),
  //         endDate: new Date('2023-12-31'),
  //       },
  //       {
  //         clientName: 'TechCorp Inc.',
  //         employeeName: 'Jane Smith',
  //         employeeId: 'EMP002',
  //         type: 'NDA',
  //         startDate: new Date('2023-02-15'),
  //         endDate: new Date('2023-08-15'),
  //       },
  //     ],
  //   });
    
  //   console.log('Added sample agreements');
  // } 
  // else
    console.log('Agreements already exist, skipping creation');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })