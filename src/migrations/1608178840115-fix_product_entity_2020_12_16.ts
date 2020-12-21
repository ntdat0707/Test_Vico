import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixProductEntity202012161608178840115 implements MigrationInterface {
  name = 'fixProductEntity202012161608178840115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "trackQuantity" TO "sellOutOfStock"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "sellOutOfStock" TO "trackQuantity"`);
  }
}
