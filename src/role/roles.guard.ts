import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from './role.service';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector, private readonly roleService: RoleService) {}

  async canActivate(context: ExecutionContext) {
    const roles: string = this._reflector.get<string>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const permissions = await this.roleService.getPermissionByRole(user.role);
    const hasRole = permissions.roles.includes(roles[0]);
    return user && user.role && hasRole;
  }
}
