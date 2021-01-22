import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { CreateCategoryInput, SettingPositionCategoryInput } from './category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryPipe } from '../lib/validatePipe/category/createCategoryPipe.class';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/role.decorators';
import { CREATE_CATEGORY } from '../role/codePermission';

@Controller('category')
@ApiTags('Category')
@UseFilters(new HttpExceptionFilter())
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([GET_CATEGORY])
  async getCategory(@Param('id') id: string) {
    return await this.categoryService.getCategory(id);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getCategories(
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.categoryService.getCategories(page, limit);
  }

  @Post()
  @UseInterceptors(FileInterceptor('categoryPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateCategoryInput,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([CREATE_CATEGORY])
  async createCategory(
    @UploadedFile() categoryPicture: any,
    @Body(new CreateCategoryPipe()) createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoryService.createCategory(categoryPicture, createCategoryInput);
  }

  // @Put(':id')
  // @UseInterceptors(FileInterceptor('categoryPicture'))
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   type: UpdateCategoryInput,
  // })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([UPDATE_CATEGORY])
  // async updateCategory(
  //   @Param('id', new CheckUUID()) id: string,
  //   @Body(new UpdateCategoryPipe()) updateCategoryInput: UpdateCategoryInput,
  //   @UploadedFile() categoryPicture: any,
  // ) {
  //   return this.categoryService.updateCategory(id, updateCategoryInput, categoryPicture);
  // }

  // @Delete(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([DELETE_CATEGORY])
  // async deleteCategory(@Param('id', new CheckUUID()) id: string) {
  //   return await this.categoryService.deleteCategory(id);
  // }

  @Get('get-all/categories')
  async getAllCategories() {
    return await this.categoryService.getAllCategories();
  }

  @Get('admin/get-all/categories')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([GET_CATEGORIES])
  async getAllCategoriesByAdmin() {
    return await this.categoryService.getAllCategoriesByAdmin();
  }

  @Post('/setting-category-position')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([SETTING_POSITION_CATEGORY])
  async settingCategoryPosition(@Body() settingPositionCategoryInput: SettingPositionCategoryInput) {
    return await this.categoryService.settingCategoryPosition(settingPositionCategoryInput);
  }
}
