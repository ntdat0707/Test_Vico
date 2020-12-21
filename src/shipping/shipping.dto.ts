import { ApiProperty } from '@nestjs/swagger';

export class CreateShippingInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly provinceId: string;

  @ApiProperty()
  readonly districtId: string;

  @ApiProperty()
  readonly wardId: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly place: string;
}

export class UpdateShippingInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly provinceId: string;

  @ApiProperty()
  readonly districtId: string;

  @ApiProperty()
  readonly wardId: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly place: string;
}
