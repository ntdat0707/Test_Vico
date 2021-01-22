import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { isTrueSet } from '../../../lib/pipeUtils/isTrueSet';
import { UpdateCategoryInput } from '../../../category/category.dto';
import * as moment from 'moment';

@Injectable()
export class UpdateCategoryPipe implements PipeTransform<any> {
  async transform(value: UpdateCategoryInput) {
    value.status = isTrueSet(value.status);
    if (value.slug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SLUG_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
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
    return value;
  }
}
