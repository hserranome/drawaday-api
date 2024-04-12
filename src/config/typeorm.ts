import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions, DataSource } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.TYPE as any) ?? 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) ?? 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: !!process.env.DB_SYNCHRONIZE,
  entities: ['**/*.entity{ .ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
};

export const dataSourceConfig = registerAs(
  'database',
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

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
