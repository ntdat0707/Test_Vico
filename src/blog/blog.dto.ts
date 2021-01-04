import { ApiProperty } from '@nestjs/swagger';

export class BlogPictureInput {
  @ApiProperty({ type: 'string', format: 'binary' })
  blogPicture: any;
}

export class UpdateBlogInput {
  @ApiProperty({ required: false })
  readonly content: string;

  @ApiProperty({ required: false })
  readonly slug: string;

  @ApiProperty()
  readonly categoryBlogId: string;

  @ApiProperty({ required: false })
  readonly authorId: string;

  @ApiProperty({ required: false })
  readonly title: string;

  @ApiProperty({ required: false, enum: ['publish', 'private'] })
  readonly status: string;

  @ApiProperty({ required: false })
  readonly tags: string[];

  @ApiProperty({ required: false })
  readonly pageTitle: string;

  @ApiProperty({ required: false })
  readonly metaDescription: string;

  @ApiProperty()
  readonly imageFeatured: string;

  @ApiProperty({ required: false, type: Date })
  readonly timePublication?: string;

  @ApiProperty()
  readonly shortDescription: string;
}

export class CreateBlogInput {
  @ApiProperty()
  readonly categoryBlogId: string;

  @ApiProperty()
  readonly authorId: string;

  @ApiProperty()
  readonly content: string;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly slug: string;

  @ApiProperty({ required: false })
  readonly tags: string[];

  @ApiProperty({ enum: ['publish', 'private'] })
  readonly status: string;

  @ApiProperty({ required: false })
  readonly pageTitle: string;

  @ApiProperty({ required: false })
  readonly metaDescription: string;

  @ApiProperty()
  readonly shortDescription: string;

  @ApiProperty()
  readonly imageFeatured: string;

  @ApiProperty({ required: false, type: Date })
  readonly timePublication?: string;
}

export class FilterBlogInput {
  @ApiProperty()
  readonly searchValue: string;

  @ApiProperty()
  readonly parentId: string;

  @ApiProperty()
  readonly categoryBlogs: string[];

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;
}
