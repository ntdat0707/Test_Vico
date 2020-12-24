import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { checkPhoneNumber } from '../../../lib/pipeUtils/phoneNumberValidate';
import { UpdateCustomerInput } from '../../../customer/customer.dto';

@Injectable()
export class UpdateCustomerPipe implements PipeTransform<any> {
  async transform(value: UpdateCustomerInput) {
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
    if (value.birthDay) {
      const date = moment(value.birthDay, 'YYYY-MM-DD', true);
      if (!date.isValid()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'BIRTH_DAY_MUST_BE_IN_FORMAT_YYYY-MM-DD',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return value;
  }
}
