import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkInteger } from '../pipeUtils/integerValidate';

@Injectable()
export class CheckUnSignIntPipe implements PipeTransform<any> {
  async transform(value: string) {
    let result: number;
    if (value !== undefined) {
      if (!checkInteger(value)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'MUST_BE_INTEGER',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        result = parseInt(value);
        if (result <= 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'VALUE_MUST_BE_LARGER_THAN_0',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
    return value;
  }
}
