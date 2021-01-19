import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkEmail } from '../../../lib/pipeUtils/emailValidate';
import { checkPhoneNumber } from '../../../lib/pipeUtils/phoneNumberValidate';
import { ActiveCustomerInput } from '../../../customer/customer.dto';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';

@Injectable()
export class ActiveCustomerPipe implements PipeTransform<any> {
  async transform(value: ActiveCustomerInput) {
    if (!value.customerId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CUSTOMER_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!checkUUID(value.customerId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CUSTOMER_ID_NOT_VALID',
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

    if (!checkPhoneNumber(value.phoneNumber)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PHONE_NUMBER_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
