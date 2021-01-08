import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCategoryEntity202001081610089851049 implements MigrationInterface {
  name = 'fixCategoryEntity202001081610089851049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category_blog" ADD "position" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category_blog" DROP COLUMN "position"`);
  }
}
