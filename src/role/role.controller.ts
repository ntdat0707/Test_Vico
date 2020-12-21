import { Controller, UseFilters, Get, Post, Put, Param, Body, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddPermissionForRolePipe } from '../lib/validatePipe/role/addPermissionForRolePipe.class';
import { CreateRolePipe } from '../lib/validatePipe/role/createRolePipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { AddPermissionForRoleInput, CreateRoleInput, UpdateRoleInput } from './role.dto';
import { RoleService } from './role.service';

@Controller('role')
@ApiTags('Role')
@UseFilters(new HttpExceptionFilter())
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  async createRole(@Body(new CreateRolePipe()) createProductInput: CreateRoleInput) {
    return await this.roleService.createRole(createProductInput);
  }

  @Put(':id')
  async updateRole(@Param('id', new CheckUUID()) id: string, @Body() updateProductInput: UpdateRoleInput) {
    return await this.roleService.updateRole(id, updateProductInput);
  }

  @Delete(':id')
  async deleteRole(@Param('id', new CheckUUID()) id: string) {
    return await this.roleService.deleteRole(id);
  }

  @Post('add-permission-for-user-group')
  async addPermissionForRole(
    @Body(new AddPermissionForRolePipe()) addPermissionForRoleInput: AddPermissionForRoleInput,
  ) {
    return await this.roleService.addPermissionForRole(addPermissionForRoleInput);
  }

  @Get('/permission/get-all')
  async getPermissions() {
    return await this.roleService.getPermissions();
  }

  @Get(':id')
  async getRole(@Param('id', new CheckUUID()) id: string) {
    return await this.roleService.getRole(id);
  }

  @Get()
  async getRoles() {
    return await this.roleService.getRoles();
  }
}
