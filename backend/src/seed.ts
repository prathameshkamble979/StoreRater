import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const adminEmail = 'admin@platform.com';
  
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
  
  await prisma.user.create({
    data: {
      name: 'Super System Administrator',
      email: adminEmail,
      passwordHash,
      address: '123 Admin Street, Tech City',
      role: 'ADMIN',
    }
  });
  
  console.log(`Admin user created: ${adminEmail} / AdminPassword123!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
