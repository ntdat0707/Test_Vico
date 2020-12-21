import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, In, getManager } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import * as _ from 'lodash';
import { AddPermissionForRoleInput, CreateRoleInput, UpdateRoleInput } from './role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    // @InjectRepository(Employee)
    // private employeeRepository: Repository<Employee>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(PermissionRole)
    private rolePermissionRepository: Repository<PermissionRole>,
    private connection: Connection,
  ) {}

  async createRole(createRoleInput: CreateRoleInput) {
    this.logger.warn(`Running api createRole at ${new Date()}`);
    const existRole = await this.roleRepository.findOne({
      where: {
        name: createRoleInput.name,
      },
    });

    if (existRole) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ROLE_NAME_EXISTED',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let newRole = new Role();
    newRole.setAttributes(createRoleInput);
    newRole = await this.roleRepository.save(newRole);
    await this.connection.queryResultCache.clear();
    return {
      data: newRole,
    };
  }

  async updateRole(id: string, updateRoleInput: UpdateRoleInput) {
    this.logger.warn(`Running api updateRole at ${new Date()}`);
    let existRole: Role;
    existRole = await this.roleRepository.findOne({
      where: {
        name: updateRoleInput.name,
      },
    });
    if (existRole && existRole.id !== id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'ROLE_NAME_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }

    existRole = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existRole) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ROLE_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    existRole.setAttributes(updateRoleInput);
    await this.roleRepository.save(existRole);
    await this.connection.queryResultCache.clear();
    return {
      data: existRole,
    };
  }

  async deleteRole(id: string) {
    this.logger.warn(`Running api deleteRole at ${new Date()}`);
    const existRole: Role = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!existRole) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ROLE_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // const existEmployee = await this.employeeRepository.findOne({
    //   where: {
    //     roleId: id,
    //   },
    // });

    // if (existEmployee) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.BAD_REQUEST,
    //       message: 'ROLE_HAVE_USER',
    //     },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    const deletedAt: Date = new Date();
    existRole.deletedAt = deletedAt;

    //clear cache
    await this.connection.queryResultCache.clear();
    //await this.connection.queryResultCache.remove(['users*']);
    //await this.connection.queryResultCache.remove([`user_${existUser.id}`]);
    //await this.connection.queryResultCache.remove([`user_${existUser.email}`]);
    await this.roleRepository.softRemove(existRole);
    return {
      data: { status: true },
    };
  }

  async addPermissionForRole(addPermissionForRoleInput: AddPermissionForRoleInput) {
    this.logger.warn(`Running api addPermissionForRole at ${new Date()}`);
    const existRole = await this.roleRepository.findOne({
      where: {
        id: addPermissionForRoleInput.roleId,
      },
    });
    if (!existRole) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ROLE_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: {
        roleId: addPermissionForRoleInput.roleId,
      },
    });

    const arrAddRolePermission = [];
    const currentPermissionIds = rolePermissions.map(permission => permission.permissionId);
    const removePermissionIds = _.difference(currentPermissionIds, addPermissionForRoleInput.permissionIds);
    const addPermissionIds = _.difference(addPermissionForRoleInput.permissionIds, currentPermissionIds);
    if (addPermissionIds.length > 0) {
      for (let i = 0; i < addPermissionIds.length; i++) {
        const permission = await this.permissionRepository.findOne({
          where: {
            id: addPermissionIds[i],
          },
        });
        if (!permission) {
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'PERMISSION_NOT_EXIST',
            },
            HttpStatus.NOT_FOUND,
          );
        }
        const newRolePermission = new PermissionRole();
        newRolePermission.roleId = existRole.id;
        newRolePermission.permissionId = addPermissionIds[i];
        arrAddRolePermission.push(newRolePermission);
      }
    }
    await getManager().transaction(async transactionalEntityManager => {
      if (removePermissionIds.length > 0) {
        await transactionalEntityManager.update<PermissionRole>(
          PermissionRole,
          { permissionId: In(removePermissionIds), roleId: existRole.id },
          { deletedAt: new Date() },
        );
      }
      await transactionalEntityManager.save<PermissionRole>(arrAddRolePermission);
    });

    return {
      data: true,
    };
  }

  async getPermissionByRole(roleId: string) {
    this.logger.warn(`Running api getPermissionByRole at ${new Date()}`);
    const rolePermissions = await this.rolePermissionRepository.find({
      where: {
        roleId: roleId,
      },
    });

    const permissionIds = rolePermissions.map(permission => permission.permissionId);

    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In(permissionIds),
        },
      });

      const roles = permissions.map(permission => permission.action);
      return {
        roles: roles,
      };
    } else {
      return {
        roles: [],
      };
    }
  }

  async getPermissions() {
    this.logger.warn(`Running api getPermissions at ${new Date()}`);
    const permissions = await this.permissionRepository.find({
      where: {
        isChildren: false,
      },
    });

    return {
      data: permissions,
    };
  }

  async getRoles() {
    this.logger.warn(`Running api getRoles at ${new Date()}`);
    const roles = await this.roleRepository.find();
    return {
      data: roles,
    };
  }

  async getRole(id: string) {
    this.logger.warn(`Running api getRole at ${new Date()}`);
    const role: any = await this.roleRepository
      .createQueryBuilder('role')
      .where('role."deletedAt" is null')
      .andWhere('role.id=:id', { id })
      .cache(`role_${id}`)
      .getOne();

    const rolePermission = await this.rolePermissionRepository
      .createQueryBuilder('permission_role')
      .where('permission_role."deletedAt" is null')
      .andWhere('permission_role."roleId"=:id', { id })
      .leftJoinAndMapOne(
        'permission_role.permission',
        Permission,
        'permission',
        'permission_role."permissionId" = permission.id',
      )
      .getMany();

    role.permissions = rolePermission;

    if (!role) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ROLE_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: role,
    };
  }
}
