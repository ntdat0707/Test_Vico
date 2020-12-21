import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFunctionConvertTv202012211608535755161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION convertTVkdau (x text) RETURNS text AS
        $$
        DECLARE
        cdau text; kdau text; r text;
        BEGIN
        cdau = 'áàảãạâấầẩẫậăắằẳẵặđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ';
        kdau = 'aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAADEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY';
        r = x;
        FOR i IN 0..length(cdau)
        LOOP
        r = replace(r, substr(cdau,i,1), substr(kdau,i,1));
        END LOOP;
        RETURN r;
        END;
        $$ LANGUAGE plpgsql;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
