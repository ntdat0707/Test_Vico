import { Body, Controller, Get, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { CreateOrderInput, OrderFilterInput, UpdateOrderInput } from './order.dto';
import { CreateOrderPipe } from '../lib/validatePipe/order/createOrderPipe.class';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { UpdateOrderPipe } from '../lib/validatePipe/order/updateOrderPipe.class';
import { OrderFilterPipe } from '../lib/validatePipe/order/orderFilterPipe.class';

@Controller('orders')
@ApiTags('Order')
@UseFilters(new HttpExceptionFilter())
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getOrders(
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.orderService.getOrders(page, limit);
  }

  @Get('get-orders/by-customer')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getOrdersByCustomer(
    @GetUser() customerId: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.orderService.getOrdersByCustomer(customerId, page, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOrder(@Param('id', new CheckUUID()) id: string) {
    return await this.orderService.getOrder(id);
  }

  @Get('order-code/:orderCode')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOrderByOrderCode(@Param('orderCode') orderCode: string) {
    return await this.orderService.getOrderByOrderCode(orderCode);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  createOrder(@GetUser() customerId: string, @Body(new CreateOrderPipe()) createOrderInput: CreateOrderInput) {
    return this.orderService.createOrder(customerId, createOrderInput);
  }

  @Post('order-filter')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async orderFilter(@Body(new OrderFilterPipe()) filterOrderInput: OrderFilterInput) {
    return await this.orderService.orderFilter(filterOrderInput);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateOrder(@Param('id') id: string, @Body(new UpdateOrderPipe()) updateOrderInput: UpdateOrderInput) {
    return this.orderService.updateOrder(id, updateOrderInput);
  }
}
