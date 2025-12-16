import { NextRequest } from 'next/server';
import { authenticateUser, checkPermission } from '../../../lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../../../lib/response';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'read:repositories')) {
    return forbiddenResponse();
  }

  try {
    const repositories = await prisma.repository.findMany({
      where: {
        tenantId: user.tenantId
      },
      include: {
        documents: true
      }
    });

    return successResponse(repositories);
  } catch (err) {
    return errorResponse('Failed to fetch repositories', 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'create:repositories')) {
    return forbiddenResponse();
  }

  try {
    const { name, description, url, provider } = await request.json();

    const repository = await prisma.repository.create({
      data: {
        name,
        description,
        url,
        provider,
        tenantId: user.tenantId,
        createdBy: user.id
      }
    });

    return successResponse(repository, 201);
  } catch (err) {
    return errorResponse('Failed to create repository', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'update:repositories')) {
    return forbiddenResponse();
  }

  try {
    const { id, ...updateData } = await request.json();

    const repository = await prisma.repository.update({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: updateData
    });

    if (!repository) {
      return notFoundResponse('Repository');
    }

    return successResponse(repository);
  } catch (err) {
    return errorResponse('Failed to update repository', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'delete:repositories')) {
    return forbiddenResponse();
  }

  try {
    const { id } = await request.json();

    const repository = await prisma.repository.delete({
      where: {
        id,
        tenantId: user.tenantId
      }
    });

    if (!repository) {
      return notFoundResponse('Repository');
    }

    return successResponse({ id: repository.id });
  } catch (err) {
    return errorResponse('Failed to delete repository', 500);
  }
}
