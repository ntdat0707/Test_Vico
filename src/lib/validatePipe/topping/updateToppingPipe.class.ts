import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UpdateToppingInput } from '../../../topping/topping.dto';
import { isTrueSet } from '../../../lib/pipeUtils/isTrueSet';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { checkInteger } from '../../../lib/pipeUtils/integerValidate';

@Injectable()
export class UpdateToppingPipe implements PipeTransform<any> {
  async transform(value: UpdateToppingInput) {
    value.trackQuantity = isTrueSet(value.trackQuantity);
    if (!value.name) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NAME_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
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
      if (!checkInteger(value.price) || Number(value.price) <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRICE_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!value.categoryId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkUUID(value.categoryId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_ID_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value.trackQuantity && !value.inStock) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'IN_STOCK_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value.inStock) {
      if (!checkInteger(value.inStock) || Number(value.inStock) <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'IN_STOCK_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return value;
  }
}