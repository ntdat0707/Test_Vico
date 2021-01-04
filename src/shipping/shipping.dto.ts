import { ApiProperty } from '@nestjs/swagger';

export class CreateShippingInput {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly provinceId: number;

  @ApiProperty()
  readonly districtId: number;

  @ApiProperty()
  readonly wardId: number;

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
  readonly provinceId: number;

  @ApiProperty()
  readonly districtId: number;

  @ApiProperty()
  readonly wardId: number;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly place: string;
}
