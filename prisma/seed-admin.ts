import { UserRole } from '@/lib/generated/prisma/enums';
import prisma from '@/lib/prisma';
import { hashPassword } from 'better-auth/crypto';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME = 'Admin';

async function main() {
  console.log('🌱 Starting admin seeding...');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping creation.');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      return;
    }

    // Hash the password using Better Auth's built-in function
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: UserRole.ADMIN,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create the account with the hashed password
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: adminUser.id,
        providerId: 'credential',
        userId: adminUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Email Verified: true`);

  } catch (error) {
    console.error('❌ Error during admin seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Admin seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
