import { ApplicationError } from '../error/application-error';
import { ErrorCode } from '../error/error-code.enum';

export class ValidationException extends ApplicationError {
  constructor(message = 'Validation failed', errors?: Record<string, any>) {
    super(ErrorCode.VALIDATION_ERROR, message, {
      errors,
    });
  }
}
