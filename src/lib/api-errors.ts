import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(400, message, 'BAD_REQUEST');
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(422, message, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, message, 'CONFLICT');
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
  }
}

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    fields?: Record<string, string>;
    timestamp: string;
  };
}

/**
 * Formats an error into a standardized JSON response
 */
export function formatErrorResponse(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      },
    };

    if (error instanceof ValidationError && error.fields) {
      response.error.fields = error.fields;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            message: 'A record with this value already exists',
            code: 'DUPLICATE_RECORD',
            statusCode: 409,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 409 }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
            statusCode: 404,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: {
          message: isDev ? error.message : 'An unexpected error occurred',
          code: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandler<T = unknown>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  return handler().catch(formatErrorResponse);
}
