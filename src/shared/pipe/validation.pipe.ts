import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ValidationException } from '../exception/validation.exception';

@Injectable()
export class AppValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(
        'Validation failed',
        this.formatErrors(errors),
      );
    }

    return object;
  }

  private shouldValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.reduce(
      (acc, error) => {
        if (error.constraints) {
          acc[error.property] = Object.values(error.constraints);
        }

        if (error.children?.length) {
          acc[error.property] = this.formatErrors(error.children);
        }

        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
