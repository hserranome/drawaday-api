import { defineConfig } from '@mikro-orm/core';
import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { User } from './src/entities/user.entity';

export default defineConfig({
  entities: [User],
  dbName:
    process.env.NODE_ENV === 'test' ? ':memory:' : './data/database.sqlite',
  driver: BetterSqliteDriver,
  debug: false,
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
