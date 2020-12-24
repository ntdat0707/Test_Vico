import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixBlogEntity202012241608779675417 implements MigrationInterface {
  name = 'fixBlogEntity202012241608779675417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog" RENAME COLUMN "categoryPostId" TO "categoryBlogId"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category_post" RENAME TO "category_blog"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE IF EXISTS "category_blog" RENAME TO "category_post"`);
    await queryRunner.query(`ALTER TABLE "blog" RENAME COLUMN "categoryBlogId" TO "categoryPostId"`);
  }
}
