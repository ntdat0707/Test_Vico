import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerInput {
  @ApiProperty({ required: false })
  readonly fullName?: string;

  @ApiProperty({ required: false, enum: ['Male', 'Female'] })
  readonly gender?: string;

  @ApiProperty({ required: false })
  readonly phoneNumber?: string;

  @ApiProperty({ required: false })
  readonly birthDay?: Date;

  @ApiProperty({ required: false })
  readonly position: string;

  @ApiProperty({ required: false })
  readonly address: string;

  @ApiProperty({ required: false })
  readonly acceptEmailMkt: boolean;
}

export class UpdateCustomerAvatarInput {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar?: any;
}

export class CreateCustomerInformationInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly provinceId: number;

  @ApiProperty()
  readonly districtId: number;

  @ApiProperty()
  readonly wardId: number;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly location: string;

  @ApiProperty()
  readonly isDefault: boolean;
}

export class UpdateCustomerInformationInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly provinceId: number;

  @ApiProperty()
  readonly districtId: number;

  @ApiProperty()
  readonly wardId: number;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly location: string;

  @ApiProperty()
  isDefault: boolean;
}

export class GetProductInCartInput {
  @ApiProperty({ required: false })
  productVariantIds?: string[];
}

export class AddProductInCartInput {
  @ApiProperty()
  readonly productVariantId: string;
}

export class CreateCustomerInput {
  @ApiProperty({ required: false })
  readonly email: string;

  @ApiProperty()
  readonly fullName: string;

  @ApiProperty({ required: false })
  readonly gender?: number;

  @ApiProperty({ required: false })
  readonly phoneNumber: string;

  @ApiProperty({ required: false })
  readonly birthDay?: Date;

  @ApiProperty({ required: false })
  readonly address: string;
}

export class ActiveCustomerInput {
  @ApiProperty()
  readonly customerId: string;
}
