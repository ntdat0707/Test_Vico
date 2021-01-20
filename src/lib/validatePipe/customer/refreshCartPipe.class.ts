import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { EProductSugarOpt } from 'src/lib/constant';
import { RefreshCartInput } from '../../../customer/customer.dto';
import { checkUUID } from '../../pipeUtils/uuidValidate';

@Injectable()
export class RefreshCartPipe implements PipeTransform<any> {
  async transform(value: RefreshCartInput) {
    for (const product of value.productsInCart) {
      if (!product.productVariantId) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRODUCT_VARIANT_ID_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!checkUUID(product.productVariantId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRODUCT_VARIANT_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!product.quantity) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'QUANTITY_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(product.quantity) && product.quantity < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'QUANTITY_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        product.sugar &&
        product.sugar !== EProductSugarOpt.NATURAL &&
        product.sugar !== EProductSugarOpt.SUGAR_10ML &&
        product.sugar !== EProductSugarOpt.SUGAR_5ML
      ) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SUGAR_OPTION_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (Array.isArray(product.toppings) && product.toppings?.length > 0) {
        for (const topping of product.toppings) {
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
    }
    return value;
  }
}
