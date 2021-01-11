import { ApiProperty } from '@nestjs/swagger';

export class FileUploadInput {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;
}

export class ProductPictures {
  @ApiProperty()
  readonly picture: string;

  @ApiProperty()
  readonly alt: string;

  @ApiProperty()
  readonly position: number;

  @ApiProperty()
  readonly isAvatar: boolean;
}

export class ProductVariant {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ required: false })
  readonly price: number;

  @ApiProperty({ required: false })
  readonly flavor: string;

  @ApiProperty({ required: false })
  readonly unit?: string;

  @ApiProperty({ required: false })
  readonly inStock: number;

  @ApiProperty()
  readonly itemCode: string;

  @ApiProperty({ required: false })
  readonly volume: number;

  @ApiProperty({ required: false })
  readonly alt: string;

  @ApiProperty({ required: false })
  readonly avatar: string;
}

export class CreateProductInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly itemCode: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly slug: string;

  @ApiProperty({ required: true })
  readonly categoryIds: string[];

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty({ required: false, type: Date })
  readonly timePublication?: Date;

  @ApiProperty({ required: false, type: [String] })
  readonly tags?: string[];

  @ApiProperty({ required: false })
  readonly bottleType?: string;

  @ApiProperty({ required: false })
  readonly metaDescription?: string;

  @ApiProperty({ required: false })
  readonly alt?: string;

  @ApiProperty({ required: false })
  readonly pageTitle?: string;

  @ApiProperty({ required: false })
  readonly title?: string;

  @ApiProperty({ required: false })
  readonly shortDescription?: string;

  @ApiProperty({ required: false })
  readonly flavor?: string;

  @ApiProperty({ required: false })
  readonly volume?: number;

  @ApiProperty({ required: false })
  readonly avatar?: string;

  @ApiProperty({ required: false, type: [ProductPictures] })
  readonly productPictures?: ProductPictures[];

  @ApiProperty({ required: false })
  readonly unit?: string;

  @ApiProperty({ required: false })
  readonly sellOutOfStock?: boolean;

  @ApiProperty({ required: false })
  readonly allowSelectSugar?: boolean;

  @ApiProperty({ required: false })
  readonly inStock?: number;

  @ApiProperty({ required: false })
  readonly toppingAvailable?: boolean;

  @ApiProperty({ required: false })
  readonly status?: boolean;

  @ApiProperty({ required: true })
  readonly numberToppingAllow: number;

  @ApiProperty({ required: false })
  readonly toppingIds?: string[];
}

export class CreateManyProductInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly slug: string;

  @ApiProperty({ required: true })
  readonly categoryIds: string[];

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty({ required: false, type: Date })
  readonly timePublication?: string;

  @ApiProperty({ required: false, type: [String] })
  readonly tags?: string[];

  @ApiProperty({ required: false })
  readonly bottleType?: string;

  @ApiProperty({ required: false })
  readonly metaDescription?: string;

  @ApiProperty({ required: false })
  readonly alt?: string;

  @ApiProperty({ required: false })
  readonly pageTitle?: string;

  @ApiProperty({ required: false })
  readonly title?: string;

  @ApiProperty({ required: false })
  readonly shortDescription?: string;

  @ApiProperty({ required: false })
  readonly sellOutOfStock?: boolean;

  @ApiProperty({ required: false })
  readonly allowSelectSugar?: boolean;

  @ApiProperty({ required: false })
  readonly toppingAvailable?: boolean;

  @ApiProperty({ required: false })
  readonly toppingIds?: string[];

  @ApiProperty({ required: false })
  readonly numberToppingAllow?: number;

  @ApiProperty({ required: false, type: [ProductPictures] })
  readonly productPictures: ProductPictures[];

  @ApiProperty({ required: false, type: [ProductVariant] })
  readonly productVariants?: ProductVariant[];
}

export class CreateProductVariantInput {
  @ApiProperty()
  readonly productId: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty({ required: false })
  readonly price: number;

  @ApiProperty({ required: false })
  readonly flavor: string;

  @ApiProperty({ required: false })
  readonly unit?: string;

  @ApiProperty({ required: false })
  readonly inStock: number;

  @ApiProperty()
  readonly itemCode: string;

  @ApiProperty({ required: false })
  readonly volume: number;

  @ApiProperty({ required: false })
  readonly alt: string;

  @ApiProperty({ required: false })
  readonly avatar: string;
}

export class UpdateProductInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly slug: string;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty({ required: true })
  readonly categoryIds: string[];

  @ApiProperty({ required: false })
  readonly description?: string;

  @ApiProperty({ required: false, type: Date })
  readonly timePublication?: string;

  @ApiProperty({ required: false, type: [String] })
  readonly tags?: string[];

  @ApiProperty({ required: false })
  readonly bottleType?: string;

  @ApiProperty({ required: false })
  readonly metaDescription?: string;

  @ApiProperty({ required: false })
  readonly alt?: string;

  @ApiProperty({ required: false })
  readonly pageTitle?: string;

  @ApiProperty({ required: false })
  readonly title?: string;

  @ApiProperty({ required: false })
  readonly shortDescription?: string;

  @ApiProperty({ required: false })
  readonly toppingAvailable?: boolean;

  @ApiProperty({ required: false })
  readonly sellOutOfStock?: boolean;

  @ApiProperty({ required: false })
  readonly allowSelectSugar?: boolean;

  @ApiProperty({ required: false })
  readonly toppingIds?: string[];

  @ApiProperty({ required: false })
  readonly numberToppingAllow?: number;
}

export class UpdateProductVariantInput {
  @ApiProperty({ required: false })
  readonly name: string;

  @ApiProperty({ required: false })
  readonly price: number;

  @ApiProperty({ required: false })
  readonly flavor: string;

  @ApiProperty({ required: false })
  readonly unit?: string;

  @ApiProperty({ required: false })
  readonly inStock: number;

  @ApiProperty({ required: false })
  readonly itemCode: string;

  @ApiProperty({ required: false })
  readonly volume: number;

  @ApiProperty({ required: false })
  readonly alt: string;

  @ApiProperty({ required: false })
  readonly avatar: string;
}

export class FilterProductAdminInput {
  @ApiProperty()
  readonly searchValue: string[];

  @ApiProperty()
  readonly categoryId: string;

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;
}
