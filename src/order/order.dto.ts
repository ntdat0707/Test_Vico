import { ApiProperty } from '@nestjs/swagger';

class ToppingProduct {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly quantity: number;
}

class OrderDetail {
  @ApiProperty()
  readonly discount: number;

  @ApiProperty()
  readonly quantity: number;

  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly unitPrice: number;

  @ApiProperty()
  readonly totalPrice: number;

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

  @ApiProperty({ required: false, type: Date })
  readonly shippingTime?: Date;

  @ApiProperty({ type: [OrderDetail] })
  readonly orderDetails: OrderDetail[];
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
  readonly arrStatus: number[];

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

export class CreateOrderByAdminInput {
  @ApiProperty()
  readonly customerId: string;

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

  @ApiProperty({ required: false, type: Date })
  readonly shippingTime?: Date;

  @ApiProperty({ type: [OrderDetail] })
  readonly orderDetails: OrderDetail[];
}
