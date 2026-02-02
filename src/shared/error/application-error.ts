import { ErrorCode } from './error-code.enum';

export interface ApplicationErrorMeta {
  cause?: unknown;
  errors?: Record<string, any>;
  [key: string]: any;
}

export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly meta?: ApplicationErrorMeta;
  public readonly message: string;

  constructor(code: ErrorCode, message: string, meta?: ApplicationErrorMeta) {
    super(message);

    this.code = code;
    this.meta = meta;

    // Fix prototype chain (important for instanceof)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
