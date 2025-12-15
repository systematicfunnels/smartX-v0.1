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
  worker,
  payload,
}: {
  masterJobId: string;
  worker: any;
  payload: any;
}) {
  return prisma.taskJob.create({
    data: {
      masterJobId,
      worker,
      payload,
    },
  });
}
