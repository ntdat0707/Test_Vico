import { ApiProperty } from '@nestjs/swagger';

class ToppingProduct {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly categoryId: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly quantity: number;

  @ApiProperty()
  readonly unit: string;

  @ApiProperty()
  readonly trackQuantity: boolean;

  @ApiProperty()
  readonly inStock: number;

  @ApiProperty()
  readonly picture: string;
}

class ImageProductVariant {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly productVariantId: string;

  @ApiProperty()
  readonly picture: string;

  @ApiProperty()
  readonly alt: string;

  @ApiProperty()
  readonly isAvatar: string;

  @ApiProperty()
  readonly position: string;
}

class OrderDetail {
  @ApiProperty()
  readonly discount: number;

  @ApiProperty()
  readonly quantity: number;

  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly productId: string;

  @ApiProperty({ required: false })
  readonly itemCode?: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty({ required: false })
  readonly volume?: number;

  @ApiProperty({ required: false })
  readonly flavor?: string;

  @ApiProperty({ required: false })
  readonly inStock?: number;

  @ApiProperty({ type: [ImageProductVariant], required: false })
  readonly images?: ImageProductVariant[];

  @ApiProperty({ type: [ToppingProduct], required: false })
  readonly toppings?: ToppingProduct[];
}

export class CreateOrderInput {
  @ApiProperty()
  readonly totalDiscount: number;

  @ApiProperty()
  readonly shippingId: string;

  @ApiProperty()
  readonly shippingAmount: number;

  @ApiProperty()
  readonly orderAmount: number;

  @ApiProperty()
  readonly orderQuantity: number;

  @ApiProperty()
  readonly paymentType: string;

  @ApiProperty()
  readonly source: string;

  @ApiProperty()
  readonly note?: string;

  @ApiProperty({ type: [OrderDetail] })
  readonly orderDetails: OrderDetail[];

  @ApiProperty({ type: [ToppingProduct] })
  readonly toppings: ToppingProduct[];

  @ApiProperty({ required: false })
  readonly ip: string;
}

export class OrderFilterInput {
  @ApiProperty()
  readonly searchValue: string;

  @ApiProperty()
  readonly customerId: string;

  @ApiProperty()
  readonly minOrderAmount: number;

  @ApiProperty()
  readonly maxOrderAmount: number;

  @ApiProperty()
  readonly createdAtTo: Date;

  @ApiProperty()
  readonly createdAtFrom: Date;

  @ApiProperty()
  readonly status: number[];

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;
}

export class UpdateOrderInput {
  @ApiProperty()
  readonly shippingId?: string;

  @ApiProperty()
  readonly status?: number;
}

class OrderRefundDetail {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly quantity: number;

  @ApiProperty()
  readonly retailPrice: number;

  @ApiProperty()
  readonly amount: number;
}

export class UpdateOrderRefundInput {
  @ApiProperty()
  readonly orderRefundAmount: number;

  @ApiProperty()
  readonly reason: string;

  @ApiProperty({ type: [OrderRefundDetail] })
  readonly orderRefundDetails: OrderRefundDetail[];
}

class UserInformationInput {
  @ApiProperty()
  readonly email: string;

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

  @ApiProperty()
  readonly isCreateAccount: boolean;
}

export class CreateOrderNoneAuthenInput {
  @ApiProperty()
  readonly totalDiscount: number;

  @ApiProperty()
  readonly userInformation: UserInformationInput;

  @ApiProperty()
  readonly orderAmount: number;

  @ApiProperty()
  readonly isVAT: boolean;

  @ApiProperty()
  readonly orderQuantity: number;

  @ApiProperty()
  readonly paymentType: string;

  @ApiProperty()
  readonly note?: string;

  @ApiProperty({ type: [OrderDetail] })
  readonly orderDetails: OrderDetail[];
}

export class ConfirmPaymentInput {
  @ApiProperty()
  readonly orderCode: string;

  @ApiProperty()
  readonly secureHash: string;

  @ApiProperty()
  readonly txnResponseCode: string;

  @ApiProperty()
  readonly urlResponse: string;
}
