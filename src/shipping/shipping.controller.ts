import { Body, Controller, Delete, Get, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { ShippingService } from './shipping.service';
import { GetUser } from '../auth/get-user.decorator';
import { CreateShippingInput, UpdateShippingInput } from './shipping.dto';
import { CreateShippingPipe } from '../lib/validatePipe/shipping/createShippingPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { UpdateShippingPipe } from '../lib/validatePipe/shipping/updateShippingPipe.class';

@Controller('shipping')
@ApiTags('Shipping')
@UseFilters(new HttpExceptionFilter())
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getShippingById(@GetUser() customerId: string, @Param('id', new CheckUUID()) id: string) {
    return this.shippingService.getShippingById(customerId, id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getShippingByCustomerId(@GetUser() customerId: string) {
    return this.shippingService.getShippingByCustomerId(customerId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  createShipping(
    @GetUser() customerId: string,
    @Body(new CreateShippingPipe()) createShippingInput: CreateShippingInput,
  ) {
    return this.shippingService.createShipping(customerId, createShippingInput);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateShipping(
    @GetUser() customerId: string,
    @Param('id', new CheckUUID()) id: string,
    @Body(new UpdateShippingPipe()) updateShippingInput: UpdateShippingInput,
  ) {
    return this.shippingService.updateShipping(customerId, id, updateShippingInput);
  }

  @Put('set-shipping-default/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  setShippingDefault(@GetUser() customerId: string, @Param('id', new CheckUUID()) id: string) {
    return this.shippingService.setShippingDefault(customerId, id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteShipping(@GetUser() customerId: string, @Param('id', new CheckUUID()) id: string) {
    return this.shippingService.deleteShipping(customerId, id);
  }
}
