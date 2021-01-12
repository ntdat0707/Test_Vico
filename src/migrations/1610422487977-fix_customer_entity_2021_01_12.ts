import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCustomerEntity202101121610422487977 implements MigrationInterface {
  name = 'fixCustomerEntity202101121610422487977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ADD "isActive" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "order" ADD "shippingTime" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shippingTime"`);
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "isActive"`);
  }
}
