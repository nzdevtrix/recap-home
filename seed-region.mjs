import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
});
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
