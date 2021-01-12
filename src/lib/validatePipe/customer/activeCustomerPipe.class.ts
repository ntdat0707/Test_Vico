import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    return value;
  }
}
