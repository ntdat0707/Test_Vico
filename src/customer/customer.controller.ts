import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateCustomerPipe } from 'src/lib/validatePipe/customer/updateCustomerPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { GetUser } from '../auth/get-user.decorator';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { UpdateCustomerAvatarInput, UpdateCustomerInput } from './customer.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
@ApiTags('Customer')
@UseFilters(new HttpExceptionFilter())
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Put('/update-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateCustomerAvatarInput,
  })
  async updateCustomerAvatar(@GetUser('userId') customerId: string, @UploadedFile() avatar: any) {
    return await this.customerService.updateCustomerAvatar(customerId, avatar);
  }

  @Get('/search/:searchValue')
  @ApiParam({ name: 'searchValue', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchCustomer(
    @Param('searchValue') searchValue: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.customerService.searchCustomer(searchValue, page, limit);
  }

  @Put('/update-customer')
  async updateCustomer(
    @GetUser('userId') customerId: string,
    @Body(new UpdateCustomerPipe()) updateCustomerInput: UpdateCustomerInput,
  ) {
    return await this.customerService.updateCustomer(customerId, updateCustomerInput);
  }

  @Get('/check-email-exist/:email')
  async checkEmailExist(@Param('email') email: string) {
    return await this.customerService.checkEmailExist(email);
  }

  @Get('/check-phone-exist/:phone')
  async checkPhoneExist(@Param('phone') phone: string) {
    return await this.customerService.checkPhoneExist(phone);
  }

  @Delete(':id')
  async deleteUser(@Param('id', new CheckUUID()) id: string) {
    return await this.customerService.deleteCustomer(id);
  }
}
