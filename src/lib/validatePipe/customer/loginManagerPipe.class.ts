import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkEmail } from '../../pipeUtils/emailValidate';
import { checkPassword } from '../../pipeUtils/passwordValidate';
import { LoginManagerInput } from '../../../auth/auth.dto';

@Injectable()
export class LoginManagerPipe implements PipeTransform<any> {
  async transform(value: LoginManagerInput) {
    const source = ['IOS', 'WEB', 'ANDROID'];
    if (!value.email) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'EMAIL_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // if (!value.source) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.BAD_REQUEST,
    //       message: 'SOURCE_REQUIRED',
    //     },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // if (!source.includes(value.source)) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.BAD_REQUEST,
    //       message: 'SOURCE_NOT_VALID',
    //     },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    if (!value.password) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PASSWORD_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkEmail(value.email)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'EMAIL_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkPassword(value.password)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PASSWORD_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // if (value.ip) {
    //   if (!checkIpAddress(value.ip)) {
    //     throw new HttpException(
    //       {
    //         statusCode: HttpStatus.BAD_REQUEST,
    //         message: 'IP_NOT_VALID',
    //       },
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    // }

    return value;
  }
}
