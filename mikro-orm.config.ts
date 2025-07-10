import { defineConfig } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { User } from './src/entities/user.entity';

export default defineConfig({
  entities: [User],
  dbName: './data/database.sqlite',
  driver: SqliteDriver,
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './migrations',
    pathTs: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    emit: 'ts',
  },
});
