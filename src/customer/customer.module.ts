import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Shipping } from '../entities/shipping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Shipping])],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
