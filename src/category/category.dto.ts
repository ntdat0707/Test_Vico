import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly code: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly categoryPicture?: any;

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty({ required: false })
  readonly metaDescription?: string;

  @ApiProperty()
  readonly slug: string;

  @ApiProperty({ required: false })
  readonly alt: string;

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
  readonly slug: string;

  @ApiProperty({ required: false })
  readonly alt: string;

  @ApiProperty({ required: false })
  readonly pageTitle: string;

  @ApiProperty({ type: Date, required: false })
  readonly timePublication: string;

  @ApiProperty({ type: Boolean, required: false })
  status?: boolean;
}

class PositionCategory {
  @ApiProperty({ required: true })
  readonly categoryId: string;

  @ApiProperty({ required: true })
  readonly position: number;
}

export class SettingPositionCategoryInput {
  @ApiProperty({ required: true, type: [PositionCategory] })
  readonly categoryPositions: PositionCategory[];
}
