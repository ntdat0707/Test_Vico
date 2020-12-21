import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import _ = require('lodash');
import * as moment from 'moment';
import { checkSlug } from '../../../lib/pipeUtils/slugValidate';
import { CreateManyProductInput } from '../../../product/product.dto';
import { checkUUID } from '../../pipeUtils/uuidValidate';

@Injectable()
export class CreateManyProductPipe implements PipeTransform<any> {
  async transform(value: CreateManyProductInput) {
    const arrVolumeFlavor = [];
    const arrVolume = [];
    const arrFlavor = [];
    const arrItemCode = [];

    if (!value.name) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NAME_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
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

    if (value.toppingAvailable === true) {
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

    if (!value.productVariants || value.productVariants.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_VARIANT_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    for (let i = 0; i < value.productVariants.length; i++) {
      if (!value.productVariants[i].price) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRICE_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        if (!Number.isInteger(value.productVariants[i].price) || value.productVariants[i].price <= 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRICE_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (value.productVariants[i].inStock) {
        if (!Number.isInteger(value.productVariants[i].inStock) || value.productVariants[i].inStock <= 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'IN_STOCK_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (value.productVariants[i].volume) {
        if (!Number.isInteger(value.productVariants[i].volume) || value.productVariants[i].volume <= 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'VOLUME_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (!value.productVariants[i].itemCode) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ITEM_CODE_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (value.productPictures) {
        if (!value.productVariants[i].avatar) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'AVATAR_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        for (let j = 0; j < value.productPictures.length; j++) {
          if (!value.productPictures[j].picture) {
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

      if (value.productVariants[i].flavor && value.productVariants[i].volume) {
        const object = {};
        object['volume'] = value.productVariants[i].volume;
        object['flavor'] = value.productVariants[i].flavor;
        arrVolumeFlavor.push(object);
        const arr = _.uniqWith(arrVolumeFlavor, _.isEqual);
        if (arr.length !== arrVolumeFlavor.length) {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'FLAVOR_ALREADY_EXIST',
            },
            HttpStatus.CONFLICT,
          );
        }
      } else {
        if (
          value.productVariants[i].volume &&
          !value.productVariants[i].flavor &&
          arrVolume.includes(value.productVariants[i].volume)
        ) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'VOLUME_ALREADY_EXIST',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (
          !value.productVariants[i].volume &&
          value.productVariants[i].flavor &&
          arrFlavor.includes(value.productVariants[i].flavor)
        ) {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'FLAVOR_ALREADY_EXIST',
            },
            HttpStatus.CONFLICT,
          );
        }
      }
      arrVolume.push(value.productVariants[i].volume);
      arrFlavor.push(value.productVariants[i].flavor);

      if (arrItemCode.includes(value.productVariants[i].itemCode)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'ITEM_CODE_ALREADY_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
      arrItemCode.push(value.productVariants[i].itemCode);
    }

    return value;
  }
}
