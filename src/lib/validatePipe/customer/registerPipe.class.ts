import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { checkEmail } from '../../../lib/pipeUtils/emailValidate';
import { checkPassword } from '../../../lib/pipeUtils/passwordValidate';
import { checkPhoneNumber } from '../../../lib/pipeUtils/phoneNumberValidate';
import { RegisterAccountInput } from '../../../auth/auth.dto';
import { isTrueSet } from '../../../lib/pipeUtils/isTrueSet';
import { checkInteger } from '../../../lib/pipeUtils/integerValidate';

@Injectable()
export class RegisterPipe implements PipeTransform<any> {
  async transform(value: RegisterAccountInput) {
    value.acceptEmailMkt = isTrueSet(value.acceptEmailMkt);

    if (!value.password) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PASSWORD_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.email) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'EMAIL_REQUIRED',
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

    if (!value.phoneNumber) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PHONE_NUMBER_REQUIRED',
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

    if (!value.fullName) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'FULLNAME_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!checkPhoneNumber(value.phoneNumber)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PHONE_NUMBER_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (value.birthDay) {
      const date = moment(value.birthDay);
      if (!date.isValid()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'BIRTH_DAY_MUST_BE_IN_DATE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.gender && !checkInteger(value.gender) && Number(value.gender) !== 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'GENDER_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
