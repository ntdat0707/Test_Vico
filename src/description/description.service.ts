import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class DescriptionService {
  async uploadImage(image: any) {
    if (!image) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'IMAGE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      data: {
        picture: image.filename,
      },
    };
  }
}
