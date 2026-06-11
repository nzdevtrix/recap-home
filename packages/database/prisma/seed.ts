import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.region.findFirst();
  if (!existing) {
    await prisma.region.create({
      data: {
        name: 'Default Region',
        code: 'DEFAULT',
        boundaries: JSON.stringify({ type: 'Polygon', coordinates: [] }),
        center: JSON.stringify({ lat: 0, lng: 0 }),
      },
    });
    console.log('Created default region');
  } else {
    console.log('Region already exists');
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
