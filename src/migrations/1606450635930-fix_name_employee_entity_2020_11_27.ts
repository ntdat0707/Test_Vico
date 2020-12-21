import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixNameEmployeeEntity202011271606450635930 implements MigrationInterface {
  name = 'fixNameEmployeeEntity202011271606450635930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "email" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "phone" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "phone" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "email" SET NOT NULL`);
  }
}
