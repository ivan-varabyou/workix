import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_GATEWAY || 'postgresql://postgres:postgres@localhost:5000/workix_gateway',
    },
  },
});

async function main() {
  console.log('🌱 Seeding Gateway database...');

  // Check if super_admin already exists
  const existingSuperAdmin = await prisma.gatewayAdmin.findFirst({
    where: { role: 'super_admin' },
  });

  if (existingSuperAdmin) {
    console.log('✅ Super admin already exists, skipping seed');
    return;
  }

  // Create super_admin
  const superAdminEmail = process.env.GATEWAY_SUPER_ADMIN_EMAIL || 'admin@workix.com';
  const superAdminPassword = process.env.GATEWAY_SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
  const superAdminName = process.env.GATEWAY_SUPER_ADMIN_NAME || 'Super Admin';

  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.gatewayAdmin.create({
    data: {
      email: superAdminEmail,
      passwordHash,
      name: superAdminName,
      role: 'super_admin',
      isActive: true,
    },
  });

  console.log(`✅ Super admin created: ${superAdmin.email}`);
  console.log(`   Email: ${superAdminEmail}`);
  console.log(`   Password: ${superAdminPassword}`);
  console.log('   ⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
