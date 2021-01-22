import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { RoleService } from '../role/role.service';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Role, Permission, PermissionRole])],
  providers: [CustomerService, RoleService],
  controllers: [CustomerController],
})
export class CustomerModule {}
