import { PrismaClient } from '@prisma/client';
process.env.DATABASE_URL = 'file:./prisma/dev.db';
const prisma = new PrismaClient();
const existing = await prisma.region.findFirst();
if (!existing) {
  await prisma.region.create({
    data: {
      name: 'Default Region',
      code: 'DEFAULT',
      boundaries: '{}',
      center: '{}',
    },
  });
  console.log('Region created');
} else {
  console.log('Already exists');
}
await prisma.$disconnect();
