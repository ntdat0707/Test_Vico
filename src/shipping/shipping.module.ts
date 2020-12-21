import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from '../entities/shipping.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { Role } from '../entities/role.entity';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { RoleService } from '../role/role.service';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipping, Customer, Role, Permission, PermissionRole])],
  controllers: [ShippingController],
  providers: [ShippingService, RoleService],
})
export class ShippingModule {}
