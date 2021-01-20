import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixCartEntity2021011917251611052109951 implements MigrationInterface {
  name = 'fixCartEntity2021011917251611052109951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cart_topping" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cartId" uuid NOT NULL, "toppingId" uuid NOT NULL, "quantity" integer NOT NULL, "sugar" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a57c3c599c2bba376df44f2c647" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "cart" ADD "quantity" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order_detail" ADD "sugar" integer`);
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingId" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "order_detail" DROP COLUMN "sugar"`);
    await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "quantity"`);
    await queryRunner.query(`DROP TABLE "cart_topping"`);
  }
}
