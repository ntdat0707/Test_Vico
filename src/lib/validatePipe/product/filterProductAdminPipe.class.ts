import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { FilterProductAdminInput } from '../../../product/product.dto';

@Injectable()
export class FilterProductAdminPipe implements PipeTransform<any> {
  async transform(value: FilterProductAdminInput) {
    if (value.categoryId) {
      if (!checkUUID(value.categoryId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CATEGORY_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (value.searchValue) {
      if (!Array.isArray(value.searchValue)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SEARCH_VALUE_MUST_BE_ARRAY',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return value;
  }
}
