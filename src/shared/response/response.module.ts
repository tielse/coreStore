import { Global, Module } from '@nestjs/common';
import { ResponseBuilder } from './response.builder';
import { HttpExceptionFilter } from '../exception/http-exception.filter';
import { HttpResponseInterceptor } from './http-response.interceptor';

@Global()
@Module({
  providers: [ResponseBuilder, HttpExceptionFilter, HttpResponseInterceptor],
  exports: [ResponseBuilder, HttpExceptionFilter, HttpResponseInterceptor],
})
export class ResponseModule {}
