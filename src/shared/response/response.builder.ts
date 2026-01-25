import { Injectable, Logger } from '@nestjs/common';
import {
  IApiResponse,
  IMessage,
  IPaginatedPayload,
  IPaginationMeta,
  IResponseMeta,
} from './response.interface';

/**
 * SOLID: Single Responsibility Principle
 * Dedicated service để build standardized responses
 * Tuân thủ REST API conventions
 */
@Injectable()
export class ResponseBuilder {
  private readonly logger = new Logger(ResponseBuilder.name);

  /**
   * Build successful response
   * @param data - Payload data
   * @param message - Custom message
   * @param meta - Metadata (path, method, requestId)
   */
  success<T>(
    data: T,
    message: Partial<IMessage> = {},
    meta?: IResponseMeta,
  ): IApiResponse<T> {
    const defaultMessage: IMessage = {
      code: 'SUCCESS_200',
      message: 'Request processed successfully',
      ...message,
    };

    return {
      payload: {
        data,
        meta,
      },
      status: 'success' as const,
      message: defaultMessage,
    };
  }

  /**
   * Build paginated success response
   * @param items - Array of items
   * @param pagination - Pagination info
   * @param message - Custom message
   * @param meta - Metadata
   */
  paginated<T>(
    items: T[],
    pagination: IPaginationMeta,
    message: Partial<IMessage> = {},
    meta?: IResponseMeta,
  ): IApiResponse<IPaginatedPayload<T>> {
    const defaultMessage: IMessage = {
      code: 'SUCCESS_200',
      message: 'Data retrieved successfully with pagination',
      ...message,
    };

    const payload: IPaginatedPayload<T> = {
      data: items,
      pagination,
      meta,
    };

    return {
      payload,
      status: 'success' as const,
      message: defaultMessage,
    };
  }

  /**
   * Build error response
   * @param code - Error code (e.g., ERR_400_VALIDATION)
   * @param message - Error message
   * @param errors - Validation errors object
   * @param meta - Metadata
   */
  error(
    code: string,
    message: string,
    errors?: Record<string, any>,
    meta?: IResponseMeta,
  ): IApiResponse {
    return {
      payload: {
        data: null,
        meta,
      },
      status: 'error' as const,
      message: {
        code,
        message,
      },
      errors,
    };
  }

  /**
   * Build validating response (for async validation)
   * @param data - Current data state
   * @param message - Validation message
   * @param meta - Metadata
   */
  validating<T>(
    data?: T,
    message: Partial<IMessage> = {},
    meta?: IResponseMeta,
  ): IApiResponse<T | null> {
    const defaultMessage: IMessage = {
      code: 'VALIDATING_202',
      message: 'Data is being validated',
      ...message,
    };

    return {
      payload: {
        data: data ?? null,
        meta,
      },
      status: 'validating' as const,
      message: defaultMessage,
    };
  }

  /**
   * Build created response
   * @param data - Created resource
   * @param meta - Metadata
   */
  created<T>(data: T, meta?: IResponseMeta): IApiResponse<T> {
    return this.success(
      data,
      {
        code: 'CREATED_201',
        message: 'Resource created successfully',
      },
      meta,
    );
  }

  /**
   * Build no content response
   * @param meta - Metadata
   */
  noContent(meta?: IResponseMeta): IApiResponse<null> {
    return {
      payload: {
        data: null,
        meta,
      },
      status: 'success' as const,
      message: {
        code: 'NO_CONTENT_204',
        message: 'No content',
      },
    };
  }
}
