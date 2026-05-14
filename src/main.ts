import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://mo-marketplace-mewan.vercel.app',
    ],
    credentials: true, // allows cookies to be sent in cross-origin requests, necessary for JWT auth if stored in cookies
    allowedHeaders: 'Content-Type, Authorization', // explicitly allow the Authorization header for JWT tokens
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //strips properties that are not defined in the DTOs, preventing unexpected data from being processed
      transform: true, //automatically converts route params/query strings to their declared TypeScript types in DTOs, e.g., '123' to 123 for numbers
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MO Marketplace API')
    .setDescription('Product & Variant management with JWT auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api`);
}

void bootstrap();
