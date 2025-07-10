import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database = require('better-sqlite3');
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

@Injectable()
export class DatabaseService {
  private _db: ReturnType<typeof drizzle>;

  constructor() {
    const sqlite = new Database('./data/database.sqlite');
    this._db = drizzle(sqlite, { schema });

    // Run migrations on startup
    this.runMigrations();
  }

  get db() {
    return this._db;
  }

  private runMigrations() {
    migrate(this._db, { migrationsFolder: './src/db/migrations' });
  }
}
