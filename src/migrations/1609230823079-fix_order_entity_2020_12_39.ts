import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixOrderEntity202012391609230823079 implements MigrationInterface {
  name = 'fixOrderEntity202012391609230823079';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" DROP COLUMN "toppingId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" ADD "toppingId" uuid`);
  }
}
