import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { Order } from '../entities/order.entity';
import { RoleService } from '../role/role.service';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { Shipping } from '../entities/shipping.entity';
import { ProductVariant } from '../entities/productVariant.entity';
import { Topping } from '../entities/topping.entity';
import { OrderDetailTopping } from 'src/entities/orderDetailTopping.entity';
import { Customer } from 'src/entities/customer.entity';
import { ProductTopping } from 'src/entities/productTopping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      OrderDetailTopping,
      Product,
      ProductVariant,
      ProductTopping,
      Topping,
      Order,
      OrderDetail,
      Shipping,
      Customer,
      Role,
      Permission,
      PermissionRole,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, RoleService],
})
export class OrderModule {}
