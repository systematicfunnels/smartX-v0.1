import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export async function createTaskJob({
  masterJobId,
  tenantId,
  worker,
  payload,
}: {
  masterJobId: string;
  tenantId: string;
  worker: any;
  payload: any;
}) {
  return prisma.taskJob.create({
    data: {
      masterJobId,
      tenantId,
      worker,
      payload,
    },
  });
}
