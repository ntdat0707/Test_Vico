import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleInput {
  @ApiProperty()
  readonly name: string;
}

export class UpdateRoleInput {
  @ApiProperty()
  readonly name: string;
}

export class AddPermissionForRoleInput {
  @ApiProperty()
  readonly roleId: string;

  @ApiProperty()
  readonly permissionIds: string[];
}
