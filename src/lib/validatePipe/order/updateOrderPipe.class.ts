import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkUUID } from '../../pipeUtils/uuidValidate';
import { UpdateOrderInput } from '../../../order/order.dto';
const arrStatus = [0, 1, 2, 3, 4, 5];

@Injectable()
export class UpdateOrderPipe implements PipeTransform<any> {
  async transform(value: UpdateOrderInput) {
    if (value.status) {
      if (!Number.isInteger(value.status) || !arrStatus.includes(value.status)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'STATUS_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (value.shippingId) {
      if (!checkUUID(value.shippingId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SHIPPING_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return value;
  }
}
