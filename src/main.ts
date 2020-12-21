import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors();

  const uploadDir = join(__dirname, '..', process.env.IMAGE_LOCAL_PATH as string);

  app.use(process.env.IMAGE_PUBLIC_URL as string, express.static(uploadDir));

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Midom')
    .setDescription('The Midom API description')
    .setVersion('3.0')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('midom', app, document);
  await app.listen(3001);
}
bootstrap();
