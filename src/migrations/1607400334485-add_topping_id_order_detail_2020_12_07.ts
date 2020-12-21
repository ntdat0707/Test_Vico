import { MigrationInterface, QueryRunner } from 'typeorm';

export class addToppingIdOrderDetail202012071607400334485 implements MigrationInterface {
  name = 'addToppingIdOrderDetail202012071607400334485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" ADD "toppingId" uuid`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "status" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "order_detail" ALTER COLUMN "productVariantId" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" ALTER COLUMN "productVariantId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "order" ADD "status" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "order_detail" DROP COLUMN "toppingId"`);
  }
}
