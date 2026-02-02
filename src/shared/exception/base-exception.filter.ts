import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { ApplicationError } from '../error/application-error';
import { ErrorCode } from '../error/error-code.enum';

@Catch()
export abstract class BaseExceptionFilter {
  protected normalizeError(exception: unknown): ApplicationError {
    if (exception instanceof ApplicationError) {
      return exception;
    }

    return new ApplicationError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      (exception as Error)?.message || 'Internal server error',
      {
        cause: exception,
      },
    );
  }

  protected isGraphQL(context: ArgumentsHost): boolean {
    try {
      const gqlHost = GqlArgumentsHost.create(context);
      return !!gqlHost.getContext();
    } catch {
      return false;
    }
  }
}
