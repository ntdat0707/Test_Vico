import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixBlogEntity202012391609209510876 implements MigrationInterface {
  name = 'fixBlogEntity202012391609209510876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog" ADD "shortDescription" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "shortDescription"`);
  }
}
