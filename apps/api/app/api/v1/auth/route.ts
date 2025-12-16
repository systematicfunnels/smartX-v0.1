import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '../../../../lib/auth';
import { successResponse, errorResponse } from '../../../../lib/response';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { action } = await request.json();

  switch (action) {
    case 'login':
      return handleLogin(request);
    case 'register':
      return handleRegister(request);
    case 'validate':
      return handleValidate(request);
    default:
      return errorResponse('Invalid action', 400);
  }
}

async function handleLogin(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = generateToken(user.id);

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    return errorResponse('Login failed', 500);
  }
}

async function handleRegister(request: NextRequest) {
  try {
    const { email, password, name, role = 'user' } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role
      }
    });

    const token = generateToken(user.id);

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    return errorResponse('Registration failed', 500);
  }
}

async function handleValidate(request: NextRequest) {
  const { user, error } = await authenticateUser(request);

  if (error || !user) {
    return errorResponse(error || 'Unauthorized', 401);
  }

  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    }
  });
}
