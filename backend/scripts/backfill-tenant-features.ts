import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillTenantFeatures() {
  console.log('Starting tenant features backfill...');

  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { hasMeet: null },
          { hasDoc: null },
          { hasCode: null }
        ]
      }
    });

    console.log(`Found ${tenants.length} tenants needing feature backfill`);

    for (const tenant of tenants) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          hasMeet: tenant.hasMeet ?? true,
          hasDoc: tenant.hasDoc ?? false,
          hasCode: tenant.hasCode ?? false,
        }
      });
      console.log(`Updated tenant ${tenant.id} (${tenant.name})`);
    }

    console.log('Tenant features backfilled successfully');
  } catch (error) {
    console.error('Error during tenant features backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillTenantFeatures();
