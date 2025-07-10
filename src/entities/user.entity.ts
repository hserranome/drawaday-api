import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: string;

  @Property({ unique: true })
  @Index({ name: 'email_idx' })
  email!: string;

  @Property()
  password!: string;

  @Property({ fieldName: 'created_at' })
  createdAt!: Date;

  constructor(id: string, email: string, password: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
  }
}