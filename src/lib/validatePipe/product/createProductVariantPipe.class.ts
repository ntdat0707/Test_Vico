import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { CreateProductVariantInput } from '../../../product/product.dto';

@Injectable()
export class CreateProductVariantPipe implements PipeTransform<any> {
  async transform(value: CreateProductVariantInput) {
    if (!value.productId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      if (!checkUUID(value.productId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRODUCT_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!value.price) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRICE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      if (!Number.isInteger(value.price) || value.price <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRICE_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.inStock) {
      if (!Number.isInteger(value.inStock) || value.inStock <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'IN_STOCK_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!value.itemCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ITEM_CODE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
