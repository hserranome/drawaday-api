import { Migration } from '@mikro-orm/migrations';

export class Migration20250710211451_initial extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`users\` (\`id\` text not null, \`email\` text not null, \`password\` text not null, \`created_at\` datetime not null, primary key (\`id\`));`);
    this.addSql(`create index \`email_idx\` on \`users\` (\`email\`);`);
    this.addSql(`create unique index \`users_email_unique\` on \`users\` (\`email\`);`);
  }

}
