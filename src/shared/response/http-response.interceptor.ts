import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { ResponseBuilder } from '../response/response.builder';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  constructor(private readonly responseBuilder: ResponseBuilder) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();

    // Không phải HTTP context (GraphQL, RPC...)
    if (!ctx.getResponse()) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Nếu controller đã custom response → giữ nguyên
        if (data?.success === true || data?.success === false) {
          return data;
        }

        return this.responseBuilder.success(data);
      }),
    );
  }
}
