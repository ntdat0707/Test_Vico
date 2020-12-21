import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateShippingInput } from 'src/shipping/shipping.dto';

@Injectable()
export class CreateShippingPipe implements PipeTransform<any> {
  async transform(value: CreateShippingInput) {
    if (!value.name) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'NAME_REQUIRED',
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

    if (!value.address) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ADDRESS_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.place) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PLACE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
