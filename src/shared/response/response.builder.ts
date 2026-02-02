import { Injectable } from '@nestjs/common';
import {
  IApiResponse,
  IMessage,
  IPaginationMeta,
  IResponseMeta,
  ResponseStatus,
} from '../response/response.interface';

@Injectable()
export class ResponseBuilder {
  success<T>(
    data: T,
    message: Partial<IMessage> = {},
    meta?: IResponseMeta,
  ): IApiResponse<T> {
    return {
      payload: { data, meta },
      status: ResponseStatus.SUCCESS,
      message: {
        code: 'SUCCESS',
        message: 'Request processed successfully',
        ...message,
      },
    };
  }

  paginated<T>(
    items: T[],
    pagination: IPaginationMeta,
    meta?: IResponseMeta,
  ): IApiResponse<T[]> {
    return {
      payload: {
        data: items,
        meta: { ...meta, pagination },
      },
      status: ResponseStatus.SUCCESS,
      message: {
        code: 'SUCCESS',
        message: 'Paginated data',
      },
    };
  }

  error(
    code: string,
    message: string,
    meta?: IResponseMeta,
    errors?: Record<string, unknown>,
  ): IApiResponse<null> {
    return {
      payload: { data: null, meta },
      status: ResponseStatus.ERROR,
      message: { code, message },
      errors,
    };
  }
}
