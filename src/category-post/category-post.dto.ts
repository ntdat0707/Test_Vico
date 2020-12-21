import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryPostInput {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryPostPicture?: any;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ required: false })
  readonly parentId?: string;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty()
  readonly slug: string;
}

export class UpdateCategoryPostInput {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryPostPicture?: any;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ required: false })
  readonly parentId?: string;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty()
  readonly slug: string;
}
