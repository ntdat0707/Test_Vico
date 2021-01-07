import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBlogTag202101051609835873674 implements MigrationInterface {
  name = 'addBlogTag202101051609835873674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blog_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tag" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e4abd1ac56d0cfd86bd57c87a06" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blog_tag"`);
  }
}
