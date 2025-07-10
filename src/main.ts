import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable global Zod exception filter
  app.useGlobalFilters(new ZodExceptionFilter());

  // Swagger/OpenAPI documentation setup
  const config = new DocumentBuilder()
    .setTitle('Draw a Day API')
    .setDescription(
      'REST API for the Draw a Day application with authentication and user management',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('profile', 'User profile management')
    .addTag('app', 'Application health and status')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
