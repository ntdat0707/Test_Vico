import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixProductEntity202101041609734240043 implements MigrationInterface {
  name = 'fixProductEntity202101041609734240043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" ADD "position" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "position"`);
  }
}
