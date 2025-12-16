import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized - No token provided' };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true
      }
    });

    if (!user) {
      return { user: null, error: 'Unauthorized - User not found' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Unauthorized - Invalid token' };
  }
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function checkPermission(user: any, requiredPermission: string) {
  // In a real implementation, this would check the user's role/permissions
  // For now, we'll implement a simple permission system
  const permissions: Record<string, string[]> = {
    admin: ['*'],
    user: ['read:meetings', 'read:documents', 'read:repositories'],
    guest: ['read:meetings']
  };

  if (user.role === 'admin') return true;
  if (permissions[user.role]?.includes(requiredPermission)) return true;
  if (permissions[user.role]?.includes('*')) return true;

  return false;
}
