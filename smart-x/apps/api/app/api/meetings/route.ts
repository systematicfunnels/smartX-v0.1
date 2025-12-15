import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const meeting = await prisma.meeting.create({
    data: {
      title: body.title,
      projectId: body.projectId,
      tenantId: body.tenantId,
    },
  });

  return NextResponse.json(meeting);
}
