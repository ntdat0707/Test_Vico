import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { checkUUID } from '../../pipeUtils/uuidValidate';
import { CreateProductInput } from '../../../product/product.dto';
import { checkSlug } from '../../../lib/pipeUtils/slugValidate';

@Injectable()
export class CreateProductPipe implements PipeTransform<any> {
  async transform(value: CreateProductInput) {
    if (!value.name) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NAME_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.numberToppingAllow) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NUMBER_TOPPING_ALLOW_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      if (!Number.isInteger(value.numberToppingAllow) || value.numberToppingAllow <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'NUMBER_TOPPING_ALLOW_INVALID',
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

    if (!value.slug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SLUG_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkSlug(value.slug)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SLUG_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.categoryIds || value.categoryIds.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    for (let i = 0; i < value.categoryIds.length; i++) {
      if (!checkUUID(value.categoryIds[i])) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CATEGORY_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.timePublication) {
      if (!moment(value.timePublication).isValid())
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'TIME_PUBLICATION_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
    }

    if (value.productPictures) {
      if (!value.avatar) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'AVATAR_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      for (let i = 0; i < value.productPictures.length; i++) {
        if (!value.productPictures[i].picture) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PICTURE_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
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

    if (value.volume) {
      if (!Number.isInteger(value.volume) || value.volume <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'VOLUME_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (value.inStock) {
      if (!Number(value.inStock) || value.inStock <= 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'IN_STOCK_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (value.toppingIds && value.toppingIds.length > 0) {
      for (let i = 0; i < value.toppingIds.length; i++) {
        if (!checkUUID(value.toppingIds[i])) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'TOPPING_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
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
