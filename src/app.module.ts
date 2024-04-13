import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { authConfig } from './config/auth.config';

const IS_DEV = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: IS_DEV
        ? ['.env', '.env.development.local', '.env.development']
        : ['.env', '.env.production.local', '.env.production'],
      load: [dataSourceConfig, authConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceConfig()),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
