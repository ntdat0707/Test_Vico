import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkPhoneNumber } from '../../../lib/pipeUtils/phoneNumberValidate';
import { EShippingPlace } from '../../../lib/constant';
import { UpdateShippingInput } from '../../../shipping/shipping.dto';

@Injectable()
export class UpdateShippingPipe implements PipeTransform<any> {
  async transform(value: UpdateShippingInput) {
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
    if (value.place && value.place !== EShippingPlace.HOME && value.place !== EShippingPlace.OFFICE) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PLACE_INVALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.provinceId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PROVINCE_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.districtId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'DISTRICT_ID_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!value.wardId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'WARD_ID_REQUIRED',
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
    if (!Number.isInteger(value.provinceId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PROVINCE_ID_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.districtId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'DISTRICT_ID_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isInteger(value.wardId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'WARD_ID_NOT_VALID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
