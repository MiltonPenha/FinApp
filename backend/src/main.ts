import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Despesas')
    .setDescription('Sistema de gestão de despesas pessoais')
    .setVersion('1.0')
    .addTag('expenses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(3000);
  console.log(`🚀 Aplicação rodando em: ${await app.getUrl()}/api`);
}
bootstrap();