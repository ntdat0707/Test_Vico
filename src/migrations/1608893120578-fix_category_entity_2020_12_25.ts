import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCategoryEntity202012251608893120578 implements MigrationInterface {
  name = 'fixCategoryEntity202012251608893120578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" ADD "code" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "category" ADD "position" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "code"`);
    await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "position"`);
  }
}
