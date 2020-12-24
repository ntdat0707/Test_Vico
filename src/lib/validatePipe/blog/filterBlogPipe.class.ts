import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { FilterBlogInput } from '../../../blog/blog.dto';

@Injectable()
export class FilterBlogPipe implements PipeTransform<any> {
  async transform(value: FilterBlogInput) {
    if (value.categoryBlogs?.length > 0) {
      for (let i = 0; i < value.categoryBlogs.length; i++) {
        if (!checkUUID(value.categoryBlogs[i])) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CATEGORY_BLOG_ID_NOT_VALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    if (value.parentId) {
      if (!checkUUID(value.parentId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PARENT_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return value;
  }
}
