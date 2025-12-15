import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const job = await prisma.masterJob.create({
    data: {
      projectId: body.projectId,
      tenantId: body.tenantId,
      type: body.type,
      payload: body.payload,
    },
  });

  return NextResponse.json(job);
}
