import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable global Zod exception filter
  app.useGlobalFilters(new ZodExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
