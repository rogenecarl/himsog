import prisma from '../src/lib/prisma';

const insuranceProviders = [
  'PhilHealth',
  'SSS',
  'Pag-IBIG',
];

async function seedInsuranceProviders() {
  console.log('Seeding insurance providers...');

  for (const name of insuranceProviders) {
    await prisma.insuranceProvider.upsert({
      where: { name },
      update: {},
      create: {
        name,
        isActive: true,
      },
    });
    console.log(`✓ ${name}`);
  }

  console.log('Insurance providers seeded successfully!');
}

seedInsuranceProviders()
  .catch((e) => {
    console.error('Error seeding insurance providers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
