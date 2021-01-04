import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCategoryTopping202012311609400555779 implements MigrationInterface {
  name = 'fixCategoryTopping202012311609400555779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "isProduct"`);
    await queryRunner.query(`ALTER TABLE "topping" DROP COLUMN "categoryId"`);
    await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "position" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "position" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "topping" ADD "categoryId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "category" ADD "isProduct" boolean NOT NULL DEFAULT true`);
  }
}
