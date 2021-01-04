import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixProductEntity202012391609217086828 implements MigrationInterface {
  name = 'fixProductEntity202012391609217086828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "unit"`);
    await queryRunner.query(`ALTER TABLE "product_variant" ADD "unit" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "unit"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "unit" character varying`);
  }
}
