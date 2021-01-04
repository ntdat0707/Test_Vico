import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { CreateBlogInput } from '../../../blog/blog.dto';
import moment = require('moment');

@Injectable()
export class CreateBlogPipe implements PipeTransform<any> {
  async transform(value: CreateBlogInput) {
    if (!value.shortDescription) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHORT_DESCRIPTION_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!value.title) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'BLOG_TITLE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.content) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'BLOG_CONTENT_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.slug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'BLOG_SLUG_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value.authorId) {
      if (!checkUUID(value.authorId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'AUTHOR_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (!value.categoryBlogId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'BLOG_CATEGORY_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkUUID(value.categoryBlogId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_BLOG_ID_NOT_VALID',
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
