import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EProductSugarOpt } from 'src/lib/constant';
import { AddProductInCartInput } from '../../../customer/customer.dto';
import { checkUUID } from '../../pipeUtils/uuidValidate';

@Injectable()
export class AddProductInCartPipe implements PipeTransform<any> {
  async transform(value: AddProductInCartInput) {
    if (!value.productVariantId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_VARIANT_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkUUID(value.productVariantId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_VARIANT_ID_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.quantity) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'QUANTITY_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.quantity) && value.quantity < 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'QUANTITY_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      value.sugar &&
      value.sugar !== EProductSugarOpt.NATURAL &&
      value.sugar !== EProductSugarOpt.SUGAR_10ML &&
      value.sugar !== EProductSugarOpt.SUGAR_5ML
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SUGAR_OPTION_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (Array.isArray(value.toppings) && value.toppings?.length > 0) {
      for (const topping of value.toppings) {
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
        if (!topping.quantity) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'TOPPING_QUANTITY_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!Number.isInteger(topping.quantity) || topping.quantity < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'TOPPING_QUANTITY_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
    return value;
  }
}
