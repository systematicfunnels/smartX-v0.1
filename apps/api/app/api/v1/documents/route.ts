import { NextRequest } from 'next/server';
import { authenticateUser, checkPermission } from '../../../lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../../../lib/response';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'read:documents')) {
    return forbiddenResponse();
  }

  try {
    const documents = await prisma.document.findMany({
      where: {
        tenantId: user.tenantId
      },
      include: {
        meeting: true,
        repository: true
      }
    });

    return successResponse(documents);
  } catch (err) {
    return errorResponse('Failed to fetch documents', 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'create:documents')) {
    return forbiddenResponse();
  }

  try {
    const { title, content, meetingId, repositoryId, documentType } = await request.json();

    const document = await prisma.document.create({
      data: {
        title,
        content,
        documentType,
        tenantId: user.tenantId,
        createdBy: user.id,
        meetingId,
        repositoryId
      }
    });

    return successResponse(document, 201);
  } catch (err) {
    return errorResponse('Failed to create document', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'update:documents')) {
    return forbiddenResponse();
  }

  try {
    const { id, ...updateData } = await request.json();

    const document = await prisma.document.update({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: updateData
    });

    if (!document) {
      return notFoundResponse('Document');
    }

    return successResponse(document);
  } catch (err) {
    return errorResponse('Failed to update document', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  if (!checkPermission(user, 'delete:documents')) {
    return forbiddenResponse();
  }

  try {
    const { id } = await request.json();

    const document = await prisma.document.delete({
      where: {
        id,
        tenantId: user.tenantId
      }
    });

    if (!document) {
      return notFoundResponse('Document');
    }

    return successResponse({ id: document.id });
  } catch (err) {
    return errorResponse('Failed to delete document', 500);
  }
}
