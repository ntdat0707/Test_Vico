import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryBlogInput {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryBlogPicture?: any;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ required: false })
  readonly parentId?: string;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty()
  readonly slug: string;
}

export class UpdateCategoryBlogInput {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryBlogPicture?: any;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ required: false })
  readonly parentId?: string;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty()
  readonly slug: string;
}
