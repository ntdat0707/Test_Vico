import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AddPermissionForRoleInput } from '../../../role/role.dto';
import { checkUUID } from '../../pipeUtils/uuidValidate';

@Injectable()
export class AddPermissionForRolePipe implements PipeTransform<any> {
  async transform(value: AddPermissionForRoleInput) {
    if (value.roleId) {
      if (!checkUUID(value.roleId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ROLE_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ROLE_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (value.permissionIds) {
      for (let i = 0; i < value.permissionIds.length; i++) {
        if (!checkUUID(value.permissionIds[i])) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PERMISSION_ID_NOT_VALID',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PERMISSION_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
