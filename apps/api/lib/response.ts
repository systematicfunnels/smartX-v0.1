import { NextResponse } from 'next/server';

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null
    },
    { status }
  );
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error
    },
    { status }
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: 'Unauthorized'
    },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: 'Forbidden'
    },
    { status: 403 }
  );
}

export function notFoundResponse(entity: string) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: `${entity} not found`
    },
    { status: 404 }
  );
}
