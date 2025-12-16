import { NextRequest } from 'next/server';
import { authenticateUser, checkPermission } from '../../../lib/auth';
import { successResponse, errorResponse, forbiddenResponse } from '../../../lib/response';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  // Only admins can check permissions for other users
  const { userId } = Object.fromEntries(request.nextUrl.searchParams);

  if (userId && user.role !== 'admin') {
    return forbiddenResponse();
  }

  try {
    const targetUserId = userId || user.id;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    // Get all available permissions from the system
    const allPermissions = await getAllPermissions();

    return successResponse({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role
      },
      permissions: targetUser.permissions || [],
      allPermissions
    });
  } catch (err) {
    return errorResponse('Failed to fetch permissions', 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  // Only admins can assign permissions
  if (user.role !== 'admin') {
    return forbiddenResponse();
  }

  try {
    const { userId, permissions } = await request.json();

    if (!userId || !Array.isArray(permissions)) {
      return errorResponse('userId and permissions array are required', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          set: permissions
        }
      }
    });

    return successResponse({
      userId: updatedUser.id,
      permissions: updatedUser.permissions
    });
  } catch (err) {
    return errorResponse('Failed to update permissions', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  // Only admins can update roles
  if (user.role !== 'admin') {
    return forbiddenResponse();
  }

  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return errorResponse('userId and role are required', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role
      }
    });

    return successResponse({
      userId: updatedUser.id,
      role: updatedUser.role
    });
  } catch (err) {
    return errorResponse('Failed to update role', 500);
  }
}

async function getAllPermissions() {
  // This would typically come from a database or config
  // For now, we'll return a comprehensive list of permissions
  return [
    // Meeting permissions
    'read:meetings',
    'create:meetings',
    'update:meetings',
    'delete:meetings',

    // Document permissions
    'read:documents',
    'create:documents',
    'update:documents',
    'delete:documents',

    // Repository permissions
    'read:repositories',
    'create:repositories',
    'update:repositories',
    'delete:repositories',

    // Job permissions
    'read:jobs',
    'create:jobs',
    'update:jobs',
    'delete:jobs',

    // User permissions
    'read:users',
    'create:users',
    'update:users',
    'delete:users',

    // Admin permissions
    'manage:permissions',
    'manage:roles'
  ];
}
