import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../pipeUtils/uuidValidate';
import { CreateOrderInput } from 'src/order/order.dto';
import { EOrderSource, EPaymentType } from 'src/lib/constant';
import { checkIpAddress } from '../../../lib/pipeUtils/ipAddressValidate';

@Injectable()
export class CreateOrderPipe implements PipeTransform<any> {
  async transform(value: CreateOrderInput) {
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

    if (!value.shippingId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHIPPING_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkUUID(value.shippingId)) {
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

    if ((!value.orderDetails || value.orderDetails.length === 0) && (!value.toppings || value.toppings.length === 0)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_DETAIL_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (value.ip) {
      if (!checkIpAddress(value.ip)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'IP_ADDRESS_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.orderDetails?.length > 0) {
      for (let i = 0; i < value.orderDetails.length; i++) {
        if (!value.orderDetails[i].discount && value.orderDetails[i].discount !== 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'DISCOUNT_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!Number.isInteger(value.orderDetails[i].discount) && value.orderDetails[i].discount < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'DISCOUNT_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.orderDetails[i].quantity && value.orderDetails[i].quantity !== 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'QUANTITY_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!Number.isInteger(value.orderDetails[i].quantity) && value.orderDetails[i].quantity < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'QUANTITY_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.orderDetails[i].id) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'ID_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!checkUUID(value.orderDetails[i].id)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'ID_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.orderDetails[i].productId) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_ID_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!checkUUID(value.orderDetails[i].productId)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_ID_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.orderDetails[i].itemCode) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_ID_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.orderDetails[i].name) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_ID_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.orderDetails[i].price && value.orderDetails[i].price !== 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRICE_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!Number.isInteger(value.orderDetails[i].price) && value.orderDetails[i].price < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRICE_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (value.orderDetails[i].volume) {
          if (!Number.isInteger(value.orderDetails[i].volume) && value.orderDetails[i].volume < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'VOLUME_INVALID',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        if (value.orderDetails[i].inStock) {
          if (!Number.isInteger(value.orderDetails[i].inStock) && value.orderDetails[i].inStock < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'IN_STOCK_INVALID',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        if (value.orderDetails[i].toppings?.length > 0) {
          for (let j = 0; j < value.orderDetails[i].toppings.length; j++) {
            if (!value.orderDetails[i].toppings[j].id) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'ID_REQUIRED',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            if (!checkUUID(value.orderDetails[i].toppings[j].id)) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'ID_INVALID',
                },
                HttpStatus.BAD_REQUEST,
              );
            }

            if (!value.orderDetails[i].toppings[j].categoryId) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'CATEGORY_ID_REQUIRED',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            if (!checkUUID(value.orderDetails[i].toppings[j].categoryId)) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'CATEGORY_ID_INVALID',
                },
                HttpStatus.BAD_REQUEST,
              );
            }

            if (!value.orderDetails[i].toppings[j].price && value.orderDetails[i].toppings[j].price !== 0) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'PRICE_REQUIRED',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            if (
              !Number.isInteger(value.orderDetails[i].toppings[j].price) &&
              value.orderDetails[i].toppings[j].price < 0
            ) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'PRICE_INVALID',
                },
                HttpStatus.BAD_REQUEST,
              );
            }

            if (!value.orderDetails[i].toppings[j].inStock && value.orderDetails[i].toppings[j].inStock !== 0) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'IN_STOCK_REQUIRED',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            if (
              !Number.isInteger(value.orderDetails[i].toppings[j].inStock) &&
              value.orderDetails[i].toppings[j].inStock < 0
            ) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'IN_STOCK_INVALID',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
          }
        }
      }
    }

    if (value.toppings?.length > 0) {
      for (let i = 0; i < value.toppings.length; i++) {
        if (!value.toppings[i].id) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'ID_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!checkUUID(value.toppings[i].id)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'ID_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.toppings[i].categoryId) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CATEGORY_ID_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!checkUUID(value.toppings[i].categoryId)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CATEGORY_ID_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.toppings[i].price && value.toppings[i].price !== 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRICE_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!Number.isInteger(value.toppings[i].price) && value.toppings[i].price < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRICE_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (!value.toppings[i].inStock && value.toppings[i].inStock !== 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'IN_STOCK_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!Number.isInteger(value.toppings[i].inStock) && value.toppings[i].inStock < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'IN_STOCK_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    return value;
  }
}
