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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateToppingPipe } from '../lib/validatePipe/topping/createToppingPipe.class';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { CreateToppingInput, UpdateToppingInput } from './topping.dto';
import { ToppingService } from './topping.service';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { UpdateToppingPipe } from '../lib/validatePipe/topping/updateToppingPipe.class';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CREATE_TOPPING, DELETE_TOPPING, GET_TOPPING, UPDATE_TOPPING } from '../role/codePermission';
import { Roles } from '../role/role.decorators';
import { RolesGuard } from '../role/roles.guard';
@Controller('topping')
@ApiTags('Topping')
@UseFilters(new HttpExceptionFilter())
export class ToppingController {
  constructor(private toppingService: ToppingService) {}

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([GET_TOPPING])
  async getToppingById(@Param('id', new CheckUUID()) id: string) {
    return this.toppingService.getToppingById(id);
  }

  @Get('get-topping-by-product/:id')
  async getToppingByProduct(@Param('id', new CheckUUID()) id: string) {
    return this.toppingService.getToppingByProduct(id);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getToppings(
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.toppingService.getToppings(page, limit);
  }

  @Post()
  @UseInterceptors(FileInterceptor('toppingPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateToppingInput,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([CREATE_TOPPING])
  async createTopping(
    @UploadedFile() toppingPicture: any,
    @Body(new CreateToppingPipe()) createToppingInput: CreateToppingInput,
  ) {
    return this.toppingService.createTopping(toppingPicture, createToppingInput);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('toppingPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateToppingInput,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UPDATE_TOPPING])
  async updateTopping(
    @Param('id', new CheckUUID()) id: string,
    @UploadedFile() toppingPicture: any,
    @Body(new UpdateToppingPipe()) updateToppingInput: UpdateToppingInput,
  ) {
    return this.toppingService.updateTopping(id, toppingPicture, updateToppingInput);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([DELETE_TOPPING])
  async deleteTopping(@Param('id', new CheckUUID()) id: string) {
    return this.toppingService.deleteTopping(id);
  }
}
