import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1713904271309 implements MigrationInterface {
  name = 'NewMigration1713904271309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
  }
}
