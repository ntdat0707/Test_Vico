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

    if (!value.numberToppingAllow && value.numberToppingAllow !== 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NUMBER_TOPPING_ALLOW_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      if (!Number.isInteger(value.numberToppingAllow) || value.numberToppingAllow < 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'NUMBER_TOPPING_ALLOW_INVALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!value.categoryIds || value.categoryIds.length === 0 || !Array.isArray(value.categoryIds)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

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

    if (!value.productVariants || value.productVariants.length === 0 || !Array.isArray(value.productVariants)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_VARIANT_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (value.productPictures) {
      let countAvatar = 0;
      for (const productPicture of value.productPictures) {
        if (!productPicture.picture) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PICTURE_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (productPicture.isAvatar) {
          countAvatar++;
        }
      }
      if (countAvatar !== 1) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ONLY_ONE_AVATAR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    for (const productVariant of value.productVariants) {
      if (!productVariant.price && productVariant.price !== 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRICE_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        if (!Number.isInteger(productVariant.price) || productVariant.price < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRICE_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (productVariant.inStock) {
        if (!Number.isInteger(productVariant.inStock) || productVariant.inStock < 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'IN_STOCK_INVALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (!productVariant.itemCode) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ITEM_CODE_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (value.productPictures) {
        if (!productVariant.avatar) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'AVATAR_REQUIRED',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (productVariant.flavor && productVariant.volume) {
        const object = {};
        object['volume'] = productVariant.volume;
        object['flavor'] = productVariant.flavor;
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
        if (productVariant.volume && !productVariant.flavor && arrVolume.includes(productVariant.volume)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'VOLUME_ALREADY_EXIST',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!productVariant.volume && productVariant.flavor && arrFlavor.includes(productVariant.flavor)) {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'FLAVOR_ALREADY_EXIST',
            },
            HttpStatus.CONFLICT,
          );
        }
      }
      arrVolume.push(productVariant.volume);
      arrFlavor.push(productVariant.flavor);

      if (arrItemCode.includes(productVariant.itemCode)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'ITEM_CODE_ALREADY_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
      arrItemCode.push(productVariant.itemCode);
    }

    return value;
  }
}
