import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseBuilder } from './response.builder';
import { IApiResponse } from './response.interface';

/**
 * SOLID: Single Responsibility Principle
 * Global Exception Filter - Centralized error handling
 * Transform toàn bộ exceptions thành unified IApiResponse format
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly responseBuilder = new ResponseBuilder();

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { id?: string }>();
    const response = ctx.getResponse<Response>();

    // Request metadata
    const requestId = request.id || 'unknown';
    const meta = {
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      requestId,
    };

    // Log exception
    this.logger.error(
      `[${requestId}] ${request.method} ${request.path}`,
      exception,
    );

    let apiResponse: IApiResponse;

    // Handle HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as Record<
        string,
        unknown
      >;

      // Extract error details
      let errorCode = `ERR_${status}`;
      let errorMessage = exception.message;
      let errors: Record<string, unknown> | undefined;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const message = exceptionResponse.message;

        if (typeof message === 'string') {
          errorMessage = message;
        } else if (Array.isArray(message)) {
          // For validation errors
          if (exception instanceof BadRequestException) {
            errors = this._formatValidationErrors(
              message as Array<{
                property: string;
                constraints: Record<string, string>;
              }>,
            );
            errorMessage = 'Validation failed';
            errorCode = 'ERR_VALIDATION_400';
          }
        }

        if (
          'errors' in exceptionResponse &&
          typeof exceptionResponse.errors === 'object'
        ) {
          errors = exceptionResponse.errors as Record<string, unknown>;
        }
      }

      apiResponse = this.responseBuilder.error(
        errorCode,
        errorMessage,
        errors,
        meta,
      );
    } else {
      // Handle unknown errors
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : 'An unexpected error occurred';

      apiResponse = this.responseBuilder.error(
        'ERR_500_INTERNAL_SERVER_ERROR',
        errorMessage,
        {
          type:
            (exception as Record<string, unknown>)?.constructor?.name ||
            'UnknownError',
        },
        meta,
      );
    }

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode).json(apiResponse);
  }

  /**
   * Format validation error array thành object
   */
  private _formatValidationErrors(
    errors: Array<{ property: string; constraints: Record<string, string> }>,
  ): Record<string, string[]> {
    return errors.reduce(
      (acc, error) => {
        acc[error.property] = Object.values(error.constraints);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }
}
