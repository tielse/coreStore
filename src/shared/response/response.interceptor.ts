import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ResponseBuilder } from './response.builder';
import { IApiResponse, IResponseMeta } from './response.interface';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithId extends Request {
  id?: string;
}

/**
 * SOLID: Open/Closed Principle
 * Response Interceptor - Transform tất cả responses về unified format
 * Không modify response nếu đã là IApiResponse format
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  constructor(private readonly responseBuilder: ResponseBuilder) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse | null | undefined> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    context.switchToHttp().getResponse<Response>();

    // Generate request ID for tracing
    const requestId = (request.headers?.['x-request-id'] as string) || uuidv4();
    request.id = requestId;

    // Meta information
    const meta: IResponseMeta = {
      timestamp: new Date().toISOString(),
      path: request.path || '',
      method: request.method || '',
      requestId,
    };

    return next.handle().pipe(
      map((data: unknown) => {
        // Nếu đã là IApiResponse format, return as-is
        if (this._isApiResponse(data)) {
          return data;
        }

        // Transform raw data to IApiResponse
        return this.responseBuilder.success(data, {}, meta);
      }),
    );
  }

  /**
   * Check nếu response đã tuân thủ IApiResponse interface
   */
  private _isApiResponse(data: unknown): data is IApiResponse {
    return (
      data &&
      typeof data === 'object' &&
      'payload' in data &&
      'status' in data &&
      'message' in data
    );
  }
}
