import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCustomerEntity202101211611204778264 implements MigrationInterface {
  name = 'fixCustomerEntity202101211611204778264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "password" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "password" SET NOT NULL`);
  }
}
