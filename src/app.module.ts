import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceConfig } from './config/typeorm';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [dataSourceConfig],
    }),
    TypeOrmModule.forRoot(dataSourceConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
