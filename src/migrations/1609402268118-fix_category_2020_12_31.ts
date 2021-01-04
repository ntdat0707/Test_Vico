import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCategory202012311609402268118 implements MigrationInterface {
  name = 'fixCategory202012311609402268118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "title" TO "alt"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "alt" TO "title"`);
  }
}
