import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixBlog202101051609832304000 implements MigrationInterface {
  name = 'fixBlog202101051609832304000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog" ADD "position" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "position" integer`);
    await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "position" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "position" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "position" SET DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "position" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "position"`);
  }
}
