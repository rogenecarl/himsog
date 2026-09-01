import prisma from '../src/lib/prisma';

// The six slugs below are the ones the rest of the app already expects:
// seed-providers-v2 keys its provider data off them (CategorySlug), and
// "health-centers" drives the free-services banner and the view-details-instead-
// of-book behaviour in the provider cards. Changing a slug breaks those.
//
// `icon` is rendered directly as text in the category filters and map markers,
// so it holds an emoji (the UI falls back to 🏥 when it is null).
const categories = [
  {
    name: 'Hospitals',
    slug: 'hospitals',
    description: 'General and specialty hospitals offering inpatient care, emergency services, and diagnostics.',
    icon: '🏥',
    color: '#3B82F6',
    sortOrder: 1,
  },
  {
    name: 'Dental Clinics',
    slug: 'dental-clinics',
    description: 'Dental practices offering cleanings, restorative work, orthodontics, and oral surgery.',
    icon: '🦷',
    color: '#06B6D4',
    sortOrder: 2,
  },
  {
    name: 'Health Centers',
    slug: 'health-centers',
    description: 'Barangay and municipal health centers providing free primary care and public health services.',
    icon: '🏛️',
    color: '#10B981',
    sortOrder: 3,
  },
  {
    name: 'Dermatology',
    slug: 'dermatology',
    description: 'Skin, hair, and nail care, from medical dermatology to aesthetic treatments.',
    icon: '🧴',
    color: '#EC4899',
    sortOrder: 4,
  },
  {
    name: 'Veterinary',
    slug: 'veterinary',
    description: 'Veterinary clinics for pet consultations, vaccinations, grooming, and surgery.',
    icon: '🐾',
    color: '#F59E0B',
    sortOrder: 5,
  },
  {
    name: 'Others',
    slug: 'others',
    description: 'Healthcare providers that do not fall under the other categories.',
    icon: '➕',
    color: '#6B7280',
    sortOrder: 6,
  },
];

async function main() {
  console.log('🌱 Seeding categories...\n');

  for (const category of categories) {
    // Upsert on slug so re-running only refreshes the presentation fields and
    // never detaches providers already pointing at an existing category row.
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      create: { ...category, isActive: true },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
      },
    });
    console.log(`   ${result.icon}  ${result.name.padEnd(16)} ${result.slug}`);
  }

  const total = await prisma.category.count();
  console.log(`\n✅ Done. ${categories.length} categories seeded (${total} total in database).`);
}

main()
  .catch((error) => {
    console.error('❌ Category seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
