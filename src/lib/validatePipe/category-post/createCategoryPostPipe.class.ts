import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryPostInput } from '../../../category-post/category-post.dto';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { checkSlug } from '../../../lib/pipeUtils/slugValidate';

@Injectable()
export class CreateCategoryPostPipe implements PipeTransform<any> {
  async transform(value: CreateCategoryPostInput) {
    if (!value.name) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NAME_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value.parentId && !checkUUID(value.parentId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PARENT_ID_INVALID',
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
    return value;
  }
}
