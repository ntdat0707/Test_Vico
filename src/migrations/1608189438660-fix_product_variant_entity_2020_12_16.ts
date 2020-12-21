import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixProductVariantEntity202012161608189438660 implements MigrationInterface {
  name = 'fixProductVariantEntity202012161608189438660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" ADD "alt" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "alt"`);
  }
}
