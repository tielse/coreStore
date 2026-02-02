import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { ErrorCode } from '../error/error-code.enum';

/* =====================================================
 * Swagger base models (NON-GENERIC)
 * ===================================================== */
class SwaggerSuccessBase {
  success: true;
  data: unknown;
  meta?: Record<string, any>;
}

class SwaggerErrorBase {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    meta?: Record<string, any>;
  };
}

/* =====================================================
 * Options
 * ===================================================== */
export interface SwaggerResponseOptions<T> {
  type?: Type<T>;
  isArray?: boolean;
  description?: string;
  errorCodes?: ErrorCode[];
}

/* =====================================================
 * Main decorator
 * ===================================================== */
export function SwaggerResponse<T>(
  options: SwaggerResponseOptions<T> = {},
): MethodDecorator {
  const {
    type,
    isArray = false,
    description = 'Success',
    errorCodes = [],
  } = options;

  const decorators: MethodDecorator[] = [];

  /* =======================
   * Register models
   * ======================= */
  decorators.push(
    ApiExtraModels(
      SwaggerSuccessBase,
      SwaggerErrorBase,
      ...(type ? [type] : []),
    ),
  );

  /* =======================
   * SUCCESS RESPONSE
   * ======================= */
  const successSchema: SchemaObject = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: type
        ? isArray
          ? {
              type: 'array',
              items: { $ref: getSchemaPath(type) },
            }
          : { $ref: getSchemaPath(type) }
        : { type: 'object' },
      meta: {
        type: 'object',
        additionalProperties: true,
      },
    },
  };

  decorators.push(
    ApiOkResponse({
      description,
      schema: successSchema,
    }),
  );

  /* =======================
   * ERROR SCHEMA (REUSED)
   * ======================= */
  const errorSchema: SchemaObject = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            enum: Object.values(ErrorCode),
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          meta: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
  };

  /* =======================
   * ERROR RESPONSES
   * ======================= */

  if (errorCodes.includes(ErrorCode.VALIDATION_ERROR)) {
    decorators.push(
      ApiBadRequestResponse({
        description: 'Validation error',
        schema: errorSchema,
      }),
    );
  }

  if (
    errorCodes.some((code) =>
      [
        ErrorCode.AUTH_UNAUTHORIZED,
        ErrorCode.AUTH_INVALID_TOKEN,
        ErrorCode.AUTH_TOKEN_EXPIRED,
      ].includes(code),
    )
  ) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
        schema: errorSchema,
      }),
    );
  }

  if (
    errorCodes.some((code) =>
      [ErrorCode.AUTH_FORBIDDEN, ErrorCode.AUTH_PERMISSION_DENIED].includes(
        code,
      ),
    )
  ) {
    decorators.push(
      ApiForbiddenResponse({
        description: 'Forbidden',
        schema: errorSchema,
      }),
    );
  }

  if (
    errorCodes.some((code) =>
      [
        ErrorCode.USER_NOT_FOUND,
        ErrorCode.GROUP_NOT_FOUND,
        ErrorCode.ROLE_NOT_FOUND,
        ErrorCode.PERMISSION_NOT_FOUND,
        ErrorCode.CATALOG_ITEM_NOT_FOUND,
        ErrorCode.BRANCH_NOT_FOUND,
      ].includes(code),
    )
  ) {
    decorators.push(
      ApiNotFoundResponse({
        description: 'Resource not found',
        schema: errorSchema,
      }),
    );
  }

  if (
    errorCodes.some((code) =>
      [
        ErrorCode.USER_ALREADY_EXISTS,
        ErrorCode.GROUP_ALREADY_EXISTS,
        ErrorCode.USER_ALREADY_IN_GROUP,
        ErrorCode.CATALOG_ITEM_OUT_OF_STOCK,
      ].includes(code),
    )
  ) {
    decorators.push(
      ApiConflictResponse({
        description: 'Conflict',
        schema: errorSchema,
      }),
    );
  }

  if (
    errorCodes.some((code) =>
      [
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorCode.USER_CREATE_FAILED,
        ErrorCode.USER_UPDATE_FAILED,
        ErrorCode.USER_DELETE_FAILED,
        ErrorCode.SERVICE_UNAVAILABLE,
      ].includes(code),
    )
  ) {
    decorators.push(
      ApiInternalServerErrorResponse({
        description: 'Internal server error',
        schema: errorSchema,
      }),
    );
  }

  return applyDecorators(...decorators);
}
