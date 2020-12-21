import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryPicture?: any;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty({ required: false })
  readonly metaDescription?: string;

  @ApiProperty({ required: false })
  isProduct: boolean;

  @ApiProperty()
  readonly slug: string;

  @ApiProperty({ required: false })
  readonly title: string;

  @ApiProperty()
  readonly pageTitle: string;

  @ApiProperty({ type: Date, required: false })
  readonly timePublication: string;

  @ApiProperty({ type: Boolean, required: false })
  status?: boolean;
}

export class UpdateCategoryInput {
  @ApiProperty({ required: false })
  readonly name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryPicture?: any;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty({ required: false })
  readonly metaDescription?: string;

  @ApiProperty({ required: false })
  isProduct: boolean;

  @ApiProperty({ required: false })
  readonly slug: string;

  @ApiProperty({ required: false })
  readonly title: string;

  @ApiProperty({ required: false })
  readonly pageTitle: string;

  @ApiProperty({ type: Date, required: false })
  readonly timePublication: string;

  @ApiProperty({ type: Boolean, required: false })
  status?: boolean;
}
