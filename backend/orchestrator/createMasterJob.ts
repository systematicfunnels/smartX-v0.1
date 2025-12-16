import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export async function createMasterJob({
  tenantId,
  projectId,
  type,
  payload,
}: {
  tenantId: string;
  projectId: string;
  type: any;
  payload: any;
}) {
  return prisma.masterJob.create({
    data: {
      tenantId,
      projectId,
      type,
      payload,
    },
  });
}
