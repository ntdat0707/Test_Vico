import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateCustomerPipe } from '../lib/validatePipe/customer/updateCustomerPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { GetUser } from '../auth/get-user.decorator';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import {
  ActiveCustomerInput,
  AddProductInCartInput,
  ChangePasswordInput,
  CreateCustomerInput,
  DeleteProductInCartInput,
  RefreshCartInput,
  UpdateCartInput,
  UpdateCustomerAvatarInput,
  UpdateCustomerInput,
  UpdateProfileInput,
} from './customer.dto';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DELETE_CUSTOMER, FILTER_CUSTOMER } from '../role/codePermission';
import { Roles } from '../role/role.decorators';
import { RolesGuard } from '../role/roles.guard';
import { AddProductInCartPipe } from '../lib/validatePipe/customer/addProductInCart.class';
import { UpdateProfilePipe } from '../lib/validatePipe/customer/updateProfilePipe.class';
import { ActiveCustomerPipe } from '../lib/validatePipe/customer/activeCustomerPipe.class';
import { DeleteProductInCartPipe } from '../lib/validatePipe/customer/deleteProductInCartPipe.class';
import { UpdateCartPipe } from '../lib/validatePipe/customer/updateCartPipe.class';
import { RefreshCartPipe } from '../lib/validatePipe/customer/refreshCartPipe.class';
@Controller('customer')
@ApiTags('Customer')
@UseFilters(new HttpExceptionFilter())
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get(':customerId')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_CUSTOMER])
  async getCustomer(@Param('customerId') customerId: string) {
    return await this.customerService.getCustomer(customerId);
  }

  @Put('/update-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateCustomerAvatarInput,
  })
  async updateCustomerAvatar(@GetUser('userId') customerId: string, @UploadedFile() avatar: any) {
    return await this.customerService.updateCustomerAvatar(customerId, avatar);
  }

  @Get('/filter/get-all-customer')
  @ApiQuery({ name: 'searchValue', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_CUSTOMER])
  async filterCustomer(
    @Query('searchValue') searchValue: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.customerService.filterCustomer(searchValue, page, limit);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([DELETE_CUSTOMER])
  async deleteCustomer(@Param('id', new CheckUUID()) id: string) {
    return await this.customerService.deleteCustomer(id);
  }

  @Post('/cart/add-product')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addProductInCart(
    @GetUser('userId') customerId: string,
    @Body(new AddProductInCartPipe()) addProductInCartInput: AddProductInCartInput,
  ) {
    return await this.customerService.addProductInCart(customerId, addProductInCartInput);
  }

  @Get('/cart/get-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllCartCustomer(@GetUser('userId') customerId: string) {
    return await this.customerService.getAllCartCustomer(customerId);
  }

  @Put('/cart/update/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateCart(
    @GetUser('userId') customerId: string,
    @Param('id', new CheckUUID()) id: string,
    @Body(new UpdateCartPipe()) updateCartInput: UpdateCartInput,
  ) {
    return await this.customerService.updateCart(customerId, id, updateCartInput);
  }

  @Delete('/cart/delete-product')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteProductInCart(
    @GetUser('userId') customerId: string,
    @Body(new DeleteProductInCartPipe()) deleteProductInCartInput: DeleteProductInCartInput,
  ) {
    return await this.customerService.deleteProductInCart(customerId, deleteProductInCartInput);
  }

  @Post('/cart/refresh')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async refreshCart(
    @GetUser('userId') customerId: string,
    @Body(new RefreshCartPipe()) refreshCartInput: RefreshCartInput,
  ) {
    return await this.customerService.refreshCart(customerId, refreshCartInput);
  }

  @Post('create-customer')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_CUSTOMER])
  async createCustomer(@Body(new AddProductInCartPipe()) createCustomerInput: CreateCustomerInput) {
    return await this.customerService.createCustomer(createCustomerInput);
  }

  @Post('active-customer')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_CUSTOMER])
  async activeCustomer(@Body(new ActiveCustomerPipe()) activeCustomerInput: ActiveCustomerInput) {
    return await this.customerService.activeCustomer(activeCustomerInput);
  }

  @Put('/profile/update')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateProfile(
    @GetUser('userId') customerId: string,
    @Body(new UpdateProfilePipe()) updateProfileInput: UpdateProfileInput,
  ) {
    return await this.customerService.updateProfile(customerId, updateProfileInput);
  }

  @Put('/profile/change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePassword(
    @GetUser('userId') customerId: string,
    @Body(new UpdateProfilePipe()) changePasswordInput: ChangePasswordInput,
  ) {
    return await this.customerService.changePassword(customerId, changePasswordInput);
  }

  @Get('/profile/get-all-shipping')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllShippingByCustomer(@GetUser('userId') customerId: string) {
    return await this.customerService.getAllShippingByCustomer(customerId);
  }

  @Get('/profile/get-all-order')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllOrderByCustomer(@GetUser('userId') customerId: string) {
    return await this.customerService.getAllOrderByCustomer(customerId);
  }
}
