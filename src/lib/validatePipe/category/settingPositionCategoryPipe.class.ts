import { Injectable, PipeTransform, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { SettingPositionCategoryInput } from '../../../category/category.dto';

@Injectable()
export class SettingPositionCategoryPipe implements PipeTransform<any> {
  async transform(value: SettingPositionCategoryInput) {
    if (!value.categoryPositions || value.categoryPositions.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_POSITION_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    for (const categoryPosition of value.categoryPositions) {
      if (!categoryPosition.categoryId) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CATEGORY_ID_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!categoryPosition.position) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'POSITION_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!checkUUID(categoryPosition.categoryId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CATEGORY_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(categoryPosition.position)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'POSITION_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return value;
  }
}
