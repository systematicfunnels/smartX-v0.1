import { NextRequest } from 'next/server';
import { authenticateUser, checkPermission } from '../../../lib/auth';
import { successResponse, errorResponse, forbiddenResponse } from '../../../lib/response';
import prisma from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'create:jobs')) {
    return forbiddenResponse();
  }

  try {
    const { jobType, entityId, entityType, parameters } = await request.json();

    // Validate required fields
    if (!jobType || !entityId || !entityType) {
      return errorResponse('jobType, entityId, and entityType are required', 400);
    }

    // Create the job in database
    const job = await prisma.job.create({
      data: {
        jobType,
        entityId,
        entityType,
        status: 'PENDING',
        parameters: parameters || {},
        tenantId: user.tenantId,
        createdBy: user.id
      }
    });

    // In a real implementation, this would publish to a queue
    // For now, we'll just return the created job
    // await publishJobToQueue(job);

    return successResponse(job, 201);
  } catch (err) {
    return errorResponse('Failed to create job', 500);
  }
}

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'read:jobs')) {
    return forbiddenResponse();
  }

  try {
    const { entityId, entityType, status } = Object.fromEntries(request.nextUrl.searchParams);

    const where: any = {
      tenantId: user.tenantId
    };

    if (entityId) where.entityId = entityId;
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return successResponse(jobs);
  } catch (err) {
    return errorResponse('Failed to fetch jobs', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'update:jobs')) {
    return forbiddenResponse();
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return errorResponse('id and status are required', 400);
    }

    const job = await prisma.job.update({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    return successResponse(job);
  } catch (err) {
    return errorResponse('Failed to update job', 500);
  }
}
