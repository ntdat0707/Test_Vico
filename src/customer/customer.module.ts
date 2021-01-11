import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Shipping } from '../entities/shipping.entity';
import { RoleService } from '../role/role.service';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/productVariant.entity';
import { Cart } from '../entities/cart.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Shipping, Role, Permission, PermissionRole, Product, ProductVariant, Cart]),
  ],
  providers: [CustomerService, RoleService],
  controllers: [CustomerController],
})
export class CustomerModule {}
