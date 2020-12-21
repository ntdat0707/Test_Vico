import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UpdateProductVariantInput } from '../../../product/product.dto';

@Injectable()
export class UpdateProductVariantPipe implements PipeTransform<any> {
  async transform(value: UpdateProductVariantInput) {
    if (value.price) {
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

    return value;
  }
}
