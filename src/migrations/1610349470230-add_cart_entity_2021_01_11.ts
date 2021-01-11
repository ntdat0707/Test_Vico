import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCartEntity202101111610349470230 implements MigrationInterface {
  name = 'addCartEntity202101111610349470230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" uuid NOT NULL, "productVariantId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "order_detail" ALTER COLUMN "productVariantId" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" ALTER COLUMN "productVariantId" DROP NOT NULL`);
    await queryRunner.query(`DROP TABLE "cart"`);
  }
}
