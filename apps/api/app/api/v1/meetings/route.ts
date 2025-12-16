import { NextRequest } from 'next/server';
import { authenticateUser, checkPermission } from '../../../lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../../../lib/response';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'read:meetings')) {
    return forbiddenResponse();
  }

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        tenantId: user.tenantId
      },
      include: {
        documents: true,
        transcriptions: true
      }
    });

    return successResponse(meetings);
  } catch (err) {
    return errorResponse('Failed to fetch meetings', 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'create:meetings')) {
    return forbiddenResponse();
  }

  try {
    const { title, description, scheduledAt, participants } = await request.json();

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        tenantId: user.tenantId,
        createdBy: user.id,
        participants: {
          create: participants.map((email: string) => ({
            user: {
              connectOrCreate: {
                where: { email },
                create: { email, name: email.split('@')[0] }
              }
            }
          }))
        }
      },
      include: {
        participants: true
      }
    });

    return successResponse(meeting, 201);
  } catch (err) {
    return errorResponse('Failed to create meeting', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'update:meetings')) {
    return forbiddenResponse();
  }

  try {
    const { id, ...updateData } = await request.json();

    const meeting = await prisma.meeting.update({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: updateData
    });

    if (!meeting) {
      return notFoundResponse('Meeting');
    }

    return successResponse(meeting);
  } catch (err) {
    return errorResponse('Failed to update meeting', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'delete:meetings')) {
    return forbiddenResponse();
  }

  try {
    const { id } = await request.json();

    const meeting = await prisma.meeting.delete({
      where: {
        id,
        tenantId: user.tenantId
      }
    });

    if (!meeting) {
      return notFoundResponse('Meeting');
    }

    return successResponse({ id: meeting.id });
  } catch (err) {
    return errorResponse('Failed to delete meeting', 500);
  }
}
