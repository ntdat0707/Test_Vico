import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../pipeUtils/uuidValidate';
import { CreateOrderByAdminInput } from '../../../order/order.dto';
import { EOrderSource, EPaymentType } from '../../constant';
import moment = require('moment');

@Injectable()
export class CreateOrderByAdminPipe implements PipeTransform<any> {
  async transform(value: CreateOrderByAdminInput) {
    if (!value.totalDiscount && value.totalDiscount !== 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'TOTAL_DISCOUNT_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.totalDiscount) && value.totalDiscount < 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'TOTAL_DISCOUNT_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.atStore && !value.shippingId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHIPPING_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (value.shippingId && !checkUUID(value.shippingId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHIPPING_ID_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.shippingAmount && value.shippingAmount !== 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHIPPING_AMOUNT_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.shippingAmount) && value.shippingAmount < 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHIPPING_AMOUNT_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.orderAmount && value.orderAmount !== 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_AMOUNT_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.orderAmount) && value.orderAmount < 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_AMOUNT_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.orderQuantity && value.orderAmount !== 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_QUANTITY_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.orderQuantity) && value.orderQuantity < 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_QUANTITY_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!(value.paymentType === EPaymentType.COD || value.paymentType === EPaymentType.BANKING)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PAYMENT_TYPE_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (value.source !== EOrderSource.WEBSITE) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SOURCE_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.orderDetails || value.orderDetails.length === 0 || !Array.isArray(value.orderDetails)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_DETAIL_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value.shippingTime) {
      if (!moment(value.shippingTime).isValid())
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SHIPPING_TIME_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
    }
    for (const orderDetail of value.orderDetails) {
      if (!orderDetail.discount && orderDetail.discount !== 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'DISCOUNT_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(orderDetail.discount) && orderDetail.discount < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'DISCOUNT_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!orderDetail.quantity && orderDetail.quantity !== 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'QUANTITY_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(orderDetail.quantity) && orderDetail.quantity < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'QUANTITY_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!orderDetail.id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRODUCT_VARIANT_ID_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!checkUUID(orderDetail.id)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ID_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!orderDetail.totalPrice && orderDetail.totalPrice !== 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'TOTAL_PRICE_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(orderDetail.totalPrice) && orderDetail.totalPrice < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'TOTAL_PRICE_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!orderDetail.unitPrice && orderDetail.unitPrice !== 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'UNIT_PRICE_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(orderDetail.unitPrice) && orderDetail.unitPrice < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'UNIT_PRICE_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (Array.isArray(orderDetail.toppings) && orderDetail.toppings?.length > 0) {
        for (const topping of orderDetail.toppings) {
          if (!topping.id) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_ID_REQUIRED',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          if (!checkUUID(topping.id)) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'ID_INVALID',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          if (!topping.price) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_PRICE_REQUIRED',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          if (!Number.isInteger(topping.price) && topping.price < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_PRICE_INVALID',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          if (!topping.quantity) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_PRICE_REQUIRED',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          if (!Number.isInteger(topping.quantity) && topping.quantity < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_PRICE_INVALID',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }
    }

    return value;
  }
}
