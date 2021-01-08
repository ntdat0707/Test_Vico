import { ApiProperty } from '@nestjs/swagger';

export class UploadFileInput {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;
}
