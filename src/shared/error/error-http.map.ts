import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

/**
 * Map ErrorCode -> HTTP Status Code
 * NOTE:
 * - Domain layer KHÔNG được import file này
 * - Chỉ dùng ở Infrastructure (REST layer)
 */
export const ERROR_HTTP_MAP: Partial<Record<ErrorCode, number>> = {
  /* =====================================================
   * GLOBAL / SYSTEM
   * ===================================================== */
  [ErrorCode.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.TIMEOUT]: HttpStatus.GATEWAY_TIMEOUT,
  [ErrorCode.UNKNOWN_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,

  /* =====================================================
   * VALIDATION
   * ===================================================== */
  [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_PAYLOAD]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_QUERY]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_COMMAND]: HttpStatus.BAD_REQUEST,

  /* =====================================================
   * AUTH / SECURITY
   * ===================================================== */
  [ErrorCode.AUTH_UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.AUTH_INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTH_PERMISSION_DENIED]: HttpStatus.FORBIDDEN,

  /* =====================================================
   * USER DOMAIN
   * ===================================================== */
  [ErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.USER_BLOCKED]: HttpStatus.FORBIDDEN,
  [ErrorCode.USER_INACTIVE]: HttpStatus.FORBIDDEN,

  [ErrorCode.USER_CREATE_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.USER_UPDATE_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.USER_DELETE_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,

  /* =====================================================
   * GROUP / ROLE / PERMISSION
   * ===================================================== */
  [ErrorCode.GROUP_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.GROUP_ALREADY_EXISTS]: HttpStatus.CONFLICT,

  [ErrorCode.ROLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.PERMISSION_NOT_FOUND]: HttpStatus.NOT_FOUND,

  [ErrorCode.USER_ALREADY_IN_GROUP]: HttpStatus.CONFLICT,
  [ErrorCode.USER_NOT_IN_GROUP]: HttpStatus.BAD_REQUEST,

  /* =====================================================
   * CATALOG (BIKE / CAR / MOTO)
   * ===================================================== */
  [ErrorCode.CATALOG_ITEM_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.CATALOG_ITEM_INACTIVE]: HttpStatus.GONE,
  [ErrorCode.CATALOG_ITEM_OUT_OF_STOCK]: HttpStatus.CONFLICT,

  [ErrorCode.BIKE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.CAR_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.MOTO_NOT_FOUND]: HttpStatus.NOT_FOUND,

  /* =====================================================
   * BRANCH / MULTI-TENANT
   * ===================================================== */
  [ErrorCode.BRANCH_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.BRANCH_ACCESS_DENIED]: HttpStatus.FORBIDDEN,

  /* =====================================================
   * INTEGRATION
   * ===================================================== */
  [ErrorCode.KAFKA_PUBLISH_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.KAFKA_CONSUME_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,

  [ErrorCode.REDIS_CONNECTION_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.S3_UPLOAD_FAILED]: HttpStatus.BAD_GATEWAY,

  [ErrorCode.KEYCLOAK_ERROR]: HttpStatus.BAD_GATEWAY,
};
