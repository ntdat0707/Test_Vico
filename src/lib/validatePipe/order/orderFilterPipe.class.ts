import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { checkUUID } from '../../../lib/pipeUtils/uuidValidate';
import { OrderFilterInput } from '../../../order/order.dto';

@Injectable()
export class OrderFilterPipe implements PipeTransform<any> {
  async transform(value: OrderFilterInput) {
    if (value.status && value.status.length > 0) {
      for (let i = 0; i < value.status.length; i++) {
        if (!Number.isInteger(value.status[i])) {
          throw new HttpException(
            {
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: 'STATUS_NOT_VALID',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }
    }

    if (value.customerId) {
      if (!checkUUID(value.customerId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CUSTOMER_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.minOrderAmount) {
      if (!Number.isInteger(value.minOrderAmount)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'STATUS_NOT_VALID',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    if (value.maxOrderAmount) {
      if (!Number.isInteger(value.maxOrderAmount)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'STATUS_NOT_VALID',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (value.createdAtTo) {
      const date = moment(value.createdAtTo);
      if (!date.isValid()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CREATED_AT_TO_MUST_BE_DATE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.createdAtFrom) {
      const date = moment(value.createdAtFrom);
      if (!date.isValid()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CREATED_AT_FROM_MUST_BE_DATE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return value;
  }
}
