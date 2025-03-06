import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LoggerInterceptorInterceptor } from './logger-interceptor/logger-interceptor.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new LoggerInterceptorInterceptor());
  require('dotenv').config();
  
// configuration pour swagger
  const config = new DocumentBuilder()
  .setTitle('Poket API')
  .setDescription('The Poker API est un des jeus de carte')
  .setVersion('1.0')
  .addTag('Poker')
  .addBearerAuth()
  .build();
const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, documentFactory);
await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
