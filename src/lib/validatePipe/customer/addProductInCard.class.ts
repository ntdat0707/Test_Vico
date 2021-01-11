import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AddProductInCartInput } from '../../../customer/customer.dto';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';

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
    return value;
  }
}
