import { ApiProperty } from '@nestjs/swagger';
import { Moment } from 'moment';

export class LoginCustomerInput {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;

  // @ApiProperty()
  // readonly source: string;

  // @ApiProperty({ required: false })
  // readonly ip: string;
}

export class RefreshTokenInput {
  @ApiProperty()
  readonly token: string;

  @ApiProperty()
  readonly refreshToken: string;
}

export class PasswordRecoveryInput {
  @ApiProperty()
  readonly email: string;
}

export class ChangePasswordWithCodeInput {
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly newPassword: string;
  @ApiProperty()
  readonly code: string;
}

export class ChangePasswordInput {
  @ApiProperty()
  readonly currentPassword: string;
  @ApiProperty()
  readonly newPassword: string;
}

export class LoginSocialInput {
  @ApiProperty({ enum: ['facebook', 'google'] })
  readonly provider: string;

  @ApiProperty()
  readonly providerId: string;

  @ApiProperty()
  readonly fullName: string;

  @ApiProperty({ required: false })
  readonly email?: string;

  @ApiProperty()
  readonly token: string;

  @ApiProperty()
  readonly source: string;

  @ApiProperty({ required: false })
  readonly ip: string;
}

export class RegisterSocialInput {
  @ApiProperty({ enum: ['facebook', 'google'] })
  readonly provider: string;

  @ApiProperty()
  readonly providerId: string;

  @ApiProperty()
  readonly fullName: string;

  @ApiProperty({ required: false })
  readonly email?: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly token: string;

  @ApiProperty()
  readonly source: string;

  @ApiProperty({ required: false })
  readonly ip: string;
}

export class LoginAppleInput {
  @ApiProperty()
  readonly appleId: string;

  @ApiProperty()
  readonly appleCode: string;

  @ApiProperty({ required: false })
  readonly fullName?: string;

  @ApiProperty({ required: false })
  readonly email?: string;

  @ApiProperty({ required: false })
  readonly ip: string;
}

export class LoginManagerInput {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;
}

export class FilterLogInput {
  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;
}

export class DeleteLogsInput {
  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;
}

export class RegisterAccountInput {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly fullName: string;

  @ApiProperty({ required: false })
  readonly gender?: number;

  @ApiProperty({ required: false, enum: [true, false] })
  acceptEmailMkt?: boolean;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty({ required: false })
  readonly birthDay?: Date;

  @ApiProperty({ required: false })
  readonly address: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly avatar?: any;
}
