import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixOrderEntity202101211611219208400 implements MigrationInterface {
  name = 'fixOrderEntity202101211611219208400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" ADD "isPaid" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "isPaid"`);
  }
}
