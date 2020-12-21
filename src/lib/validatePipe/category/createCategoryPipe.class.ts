import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { isTrueSet } from '../../../lib/pipeUtils/isTrueSet';
import { CreateCategoryInput } from '../../../category/category.dto';
import { checkSlug } from '../../../lib/pipeUtils/slugValidate';

@Injectable()
export class CreateCategoryPipe implements PipeTransform<any> {
  async transform(value: CreateCategoryInput) {
    value.status = isTrueSet(value.status);
    value.isProduct = isTrueSet(value.isProduct);
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
    } else {
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
    if (!value.pageTitle) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PAGE_TITLE_REQUIRED',
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
