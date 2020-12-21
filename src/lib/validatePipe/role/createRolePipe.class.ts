import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRoleInput } from '../../../role/role.dto';

@Injectable()
export class CreateRolePipe implements PipeTransform<any> {
  async transform(value: CreateRoleInput) {
    if (!value.name) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'GROUP_NAME_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
