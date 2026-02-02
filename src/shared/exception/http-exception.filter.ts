import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

import { ERROR_HTTP_MAP } from '../error/error-http.map';
import { ResponseBuilder } from '../../shared/response/response.builder';
import { ApplicationError } from '../error/application-error';
import { ErrorCode } from '../error/error-code.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseBuilder: ResponseBuilder) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const error =
      exception instanceof ApplicationError
        ? exception
        : new ApplicationError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Internal server error',
            { cause: exception },
          );

    const status = ERROR_HTTP_MAP[error.code] ?? 500;

    res
      .status(status)
      .json(this.responseBuilder.error(error.code, error.message, error.meta));
  }
}
