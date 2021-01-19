import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCustomerEntity2021011814111610954058573 implements MigrationInterface {
  name = 'fixCustomerEntity2021011814111610954058573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "password" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "gender" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "gender" SET DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "gender" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "gender" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "password" SET DEFAULT '1'`);
  }
}
