import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixPermissionEntity202012041607055880378 implements MigrationInterface {
  name = 'fixPermissionEntity202012041607055880378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "permission" ADD "isChildren" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "order_detail" ALTER COLUMN "productVariantId" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" ALTER COLUMN "productVariantId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "isChildren"`);
  }
}
