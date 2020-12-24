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
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { CreateCategoryInput, UpdateCategoryInput } from './category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryPipe } from '../lib/validatePipe/category/createCategoryPipe.class';
import { UpdateCategoryPipe } from '../lib/validatePipe/category/updateCategoryPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';

@Controller('category')
@ApiTags('Category')
@UseFilters(new HttpExceptionFilter())
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get(':id')
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
  async createCategory(
    @UploadedFile() categoryPicture: any,
    @Body(new CreateCategoryPipe()) createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoryService.createCategory(categoryPicture, createCategoryInput);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('categoryPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateCategoryInput,
  })
  async updateCategory(
    @Param('id', new CheckUUID()) id: string,
    @Body(new UpdateCategoryPipe()) updateCategoryInput: UpdateCategoryInput,
    @UploadedFile() categoryPicture: any,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryInput, categoryPicture);
  }

  @Delete(':id')
  async deleteCategoryDuplicate(@Param('id', new CheckUUID()) id: string) {
    return await this.categoryService.deleteCategory(id);
  }

  @Get('get-all/categories')
  async getAllCategories() {
    return await this.categoryService.getAllCategories();
  }

  @Get('admin/get-all/categories')
  async getAllCategoriesByAdmin() {
    return await this.categoryService.getAllCategoriesByAdmin();
  }
}
