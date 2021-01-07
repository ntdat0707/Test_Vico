import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixVolumeInProduct202101071610003668982 implements MigrationInterface {
  name = 'fixVolumeInProduct202101071610003668982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "volume"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "volume" character varying`);
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "volume"`);
    await queryRunner.query(`ALTER TABLE "product_variant" ADD "volume" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "volume"`);
    await queryRunner.query(`ALTER TABLE "product_variant" ADD "volume" integer`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "volume"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "volume" integer`);
  }
}
