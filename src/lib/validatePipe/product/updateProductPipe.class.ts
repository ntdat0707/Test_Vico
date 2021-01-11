import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../pipeUtils/uuidValidate';
import { UpdateProductInput } from '../../../product/product.dto';
import moment = require('moment');
import { checkSlug } from '../../../lib/pipeUtils/slugValidate';

@Injectable()
export class UpdateProductPipe implements PipeTransform<any> {
  async transform(value: UpdateProductInput) {
    if (Array.isArray(value.categoryIds) && value.categoryIds?.length > 0) {
      for (const categoryId of value.categoryIds) {
        if (!checkUUID(categoryId)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CATEGORY_ID_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
    if (Array.isArray(value.toppingIds) && value.toppingIds?.length > 0) {
      for (const toppingId of value.toppingIds) {
        if (!checkUUID(toppingId)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'TOPPING_ID_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    if (value.timePublication) {
      if (!moment(value.timePublication).isValid()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'TIME_PUBLICATION_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (value.toppingAvailable) {
      if (!value.toppingIds) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'TOPPING_ID_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.slug) {
      if (!checkSlug(value.slug)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SLUG_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return value;
  }
}
