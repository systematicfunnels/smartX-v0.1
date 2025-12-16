// SmartX Database Client
// Prisma client wrapper with enhanced functionality

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
export * from '@prisma/client';
