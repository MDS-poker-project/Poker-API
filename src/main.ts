import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LoggerInterceptorInterceptor } from './logger-interceptor/logger-interceptor.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new LoggerInterceptorInterceptor());
  require('dotenv').config();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
