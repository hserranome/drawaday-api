import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import 'dotenv/config';

export const typeOrmDataSource = new DataSource({
  type: (process.env.TYPE as any) ?? 'postgres',
  host: 'localhost', // @todo: change to process.env.DB_HOST
  port: parseInt(process.env.DB_PORT, 10) ?? 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: !!process.env.DB_SYNCHRONIZE,
  entities: ['**/*.entity{ .ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
});

export const DATABASE_CONFIG_KEY = 'database';
export const registerDatabaseConfig = registerAs(
  DATABASE_CONFIG_KEY,
  (): TypeOrmModuleOptions => ({
    type: (process.env.TYPE as any) ?? 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) ?? 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: !!process.env.DB_SYNCHRONIZE,
    entities: ['**/*.entity{ .ts,.js}'],
    migrations: ['dist/db/migrations/*{.ts,.js}'],
  }),
);
