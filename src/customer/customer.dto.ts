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

class CartTopping {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly quantity: number;
}

export class AddProductInCartInput {
  @ApiProperty()
  readonly productVariantId: string;

  @ApiProperty()
  readonly quantity: number;

  @ApiProperty()
  readonly sugar: number;

  @ApiProperty({ type: [CartTopping], required: false })
  readonly toppings: CartTopping[];
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

  @ApiProperty({ required: false })
  readonly phoneNumber: string;

  @ApiProperty({ required: false })
  readonly email: string;
}

export class UpdateProfileInput {
  @ApiProperty({ required: false })
  readonly phoneNumber: string;

  @ApiProperty({ required: false })
  readonly gender?: number;

  @ApiProperty({ required: false })
  readonly birthDay?: Date;

  @ApiProperty()
  readonly fullName: string;
}

export class ChangePasswordInput {
  @ApiProperty()
  readonly currentPassword: string;

  @ApiProperty()
  readonly newPassword: string;
}

export class DeleteProductInCartInput {
  @ApiProperty()
  readonly cartId: string;
}

export class UpdateCartInput {
  @ApiProperty()
  readonly productVariantId: string;

  @ApiProperty()
  readonly quantity: number;

  @ApiProperty()
  readonly sugar: number;

  @ApiProperty({ type: [CartTopping], required: false })
  readonly toppings: CartTopping[];
}

export class RefreshCartInput {
  @ApiProperty({ type: [AddProductInCartInput], required: false })
  readonly productsInCart: AddProductInCartInput[];
}
