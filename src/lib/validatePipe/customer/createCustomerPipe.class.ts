import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { checkEmail } from '../../pipeUtils/emailValidate';
import { checkPhoneNumber } from '../../pipeUtils/phoneNumberValidate';
import { checkInteger } from '../../pipeUtils/integerValidate';
import { CreateCustomerInput } from '../../../customer/customer.dto';

@Injectable()
export class CreateCustomerPipe implements PipeTransform<any> {
  async transform(value: CreateCustomerInput) {
    if (value.email) {
      if (!checkEmail(value.email)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'EMAIL_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.phoneNumber) {
      if (!checkPhoneNumber(value.phoneNumber)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PHONE_NUMBER_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
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

    if (value.gender !== 0 && value.gender !== 1 && value.gender !== 2) {
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
