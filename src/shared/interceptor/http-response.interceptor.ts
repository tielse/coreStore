import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResponseBuilder, IApiResponse } from '../response/index.response';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  constructor(private readonly responseBuilder: ResponseBuilder) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next
      .handle()
      .pipe(
        map((data) =>
          data?.payload && data?.status
            ? data
            : this.responseBuilder.success(data),
        ),
      );
  }
}
