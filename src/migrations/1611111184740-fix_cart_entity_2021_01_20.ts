import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCartEntity202101201611111184740 implements MigrationInterface {
  name = 'fixCartEntity202101201611111184740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cart_topping" DROP COLUMN "sugar"`);
    await queryRunner.query(`ALTER TABLE "cart" ADD "sugar" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "sugar"`);
    await queryRunner.query(`ALTER TABLE "cart_topping" ADD "sugar" integer`);
  }
}
