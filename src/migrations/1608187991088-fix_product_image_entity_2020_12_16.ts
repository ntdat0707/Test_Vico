import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixProductImageEntity202012161608187991088 implements MigrationInterface {
  name = 'fixProductImageEntity202012161608187991088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_image" RENAME COLUMN "productVariantId" TO "productId"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "allowSelectSugar" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "product_variant" ADD "avatar" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "allowSelectSugar"`);
    await queryRunner.query(`ALTER TABLE "product_image" RENAME COLUMN "productId" TO "productVariantId"`);
  }
}
