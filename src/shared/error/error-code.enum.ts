/* =====================================================
 * GLOBAL / SYSTEM
 * ===================================================== */
export enum ErrorCode {
  // -------- System --------
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // -------- Validation --------
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  INVALID_QUERY = 'INVALID_QUERY',
  INVALID_COMMAND = 'INVALID_COMMAND',

  /* =====================================================
   * AUTH / SECURITY
   * ===================================================== */
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',

  /* =====================================================
   * USER DOMAIN
   * ===================================================== */
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_BLOCKED = 'USER_BLOCKED',
  USER_INACTIVE = 'USER_INACTIVE',

  USER_CREATE_FAILED = 'USER_CREATE_FAILED',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  USER_DELETE_FAILED = 'USER_DELETE_FAILED',

  /* =====================================================
   * GROUP / ROLE / PERMISSION
   * ===================================================== */
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  GROUP_ALREADY_EXISTS = 'GROUP_ALREADY_EXISTS',

  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',

  USER_ALREADY_IN_GROUP = 'USER_ALREADY_IN_GROUP',
  USER_NOT_IN_GROUP = 'USER_NOT_IN_GROUP',

  /* =====================================================
   * CATALOG (BIKE / CAR / MOTO)
   * ===================================================== */
  CATALOG_ITEM_NOT_FOUND = 'CATALOG_ITEM_NOT_FOUND',
  CATALOG_ITEM_INACTIVE = 'CATALOG_ITEM_INACTIVE',
  CATALOG_ITEM_OUT_OF_STOCK = 'CATALOG_ITEM_OUT_OF_STOCK',

  BIKE_NOT_FOUND = 'BIKE_NOT_FOUND',
  CAR_NOT_FOUND = 'CAR_NOT_FOUND',
  MOTO_NOT_FOUND = 'MOTO_NOT_FOUND',

  /* =====================================================
   * BRANCH / MULTI-TENANT
   * ===================================================== */
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  BRANCH_ACCESS_DENIED = 'BRANCH_ACCESS_DENIED',

  /* =====================================================
   * INTEGRATION
   * ===================================================== */
  KAFKA_PUBLISH_FAILED = 'KAFKA_PUBLISH_FAILED',
  KAFKA_CONSUME_FAILED = 'KAFKA_CONSUME_FAILED',

  REDIS_CONNECTION_FAILED = 'REDIS_CONNECTION_FAILED',
  S3_UPLOAD_FAILED = 'S3_UPLOAD_FAILED',

  KEYCLOAK_ERROR = 'KEYCLOAK_ERROR',
}
