import { ApiProperty } from '@nestjs/swagger';

export class CreateToppingInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  toppingPicture?: any;

  @ApiProperty()
  readonly price: number;

  @ApiProperty({ required: false })
  readonly unit: string;

  @ApiProperty({ type: Date, required: false })
  readonly inStock: number;

  @ApiProperty({ type: Boolean })
  trackQuantity?: boolean;
}

export class UpdateToppingInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  toppingPicture?: any;

  @ApiProperty()
  readonly price: number;

  @ApiProperty({ required: false })
  readonly unit: string;

  @ApiProperty({ type: Date, required: false })
  readonly inStock: number;

  @ApiProperty({ type: Boolean })
  trackQuantity?: boolean;
}
