/**
 * SOLID: Interface Segregation Principle
 * Standard response interface cho tất cả API responses
 */

export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  VALIDATING = 'validating',
}

/**
 * Response metadata interface
 */
export interface IResponseMeta {
  timestamp: string;
  path: string;
  method: string;
  requestId: string;
}

/**
 * Generic response payload
 */
export interface IPayload<T = any> {
  data: T;
  meta?: IResponseMeta;
}

/**
 * Response status enum wrapper
 */
export type IStatus = keyof typeof ResponseStatus;

/**
 * Response message with i18n support
 */
export interface IMessage {
  code: string;
  message: string;
  i18n?: Record<string, string>;
}

/**
 * Unified API Response - tuân thủ REST conventions
 * Structure: { payload, status, message }
 */
export interface IApiResponse<T = any> {
  /**
   * Dữ liệu thực tế (data wrapper)
   */
  payload: IPayload<T>;

  /**
   * Trạng thái response (success | error | validating)
   */
  status: IStatus;

  /**
   * Message/description
   */
  message: IMessage;

  /**
   * Error details (nullable)
   */
  errors?: Record<string, any>;
}

/**
 * Pagination metadata
 */
export interface IPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response payload
 */
export interface IPaginatedPayload<T> extends IPayload<T[]> {
  pagination: IPaginationMeta;
}
