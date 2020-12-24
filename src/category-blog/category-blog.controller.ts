import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCategoryBlogPipe } from '../lib/validatePipe/category-blog/createCategoryBlogPipe.class';
import { UpdateCategoryBlogPipe } from '../lib/validatePipe/category-blog/updateCategoryBlogPipe.class';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { CreateCategoryBlogInput, UpdateCategoryBlogInput } from './category-blog.dto';
import { CategoryBlogService } from './category-blog.service';

@Controller('category-post')
@ApiTags('Category Blog')
export class CategoryBlogController {
  constructor(private categoryBlogService: CategoryBlogService) {}

  @Get(':id')
  async getCategoryBlog(@Param('id', new CheckUUID()) id: string) {
    return await this.categoryBlogService.getCategoryBlog(id);
  }

  @Get(':categoryBlogId/children')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getCategoriesByParentId(
    @Param('categoryBlogId', new CheckUUID()) categoryBlogId: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.categoryBlogService.getCategoriesByParentId(categoryBlogId, page, limit);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getCategories(
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.categoryBlogService.getCategories(page, limit);
  }

  @Get('get-all/category-post-parent')
  async getAllCategoryParent() {
    return await this.categoryBlogService.getAllCategoryParent();
  }

  @Post()
  @UseInterceptors(FileInterceptor('categoryPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateCategoryBlogInput,
  })
  async createCategoryBlog(
    @UploadedFile() categoryBlogPicture: any,
    @Body(new CreateCategoryBlogPipe()) createCategoryBlogInput: CreateCategoryBlogInput,
  ) {
    return this.categoryBlogService.createCategoryBlog(categoryBlogPicture, createCategoryBlogInput);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('categoryPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateCategoryBlogInput,
  })
  async updateCategoryBlog(
    @Param('id', new CheckUUID()) id: string,
    @UploadedFile() categoryBlogPicture: any,
    @Body(new UpdateCategoryBlogPipe()) updateCategoryBlogInput: UpdateCategoryBlogInput,
  ) {
    return this.categoryBlogService.updateCategoryBlog(id, categoryBlogPicture, updateCategoryBlogInput);
  }

  @Delete(':id')
  async deleteCategoryBlog(@Param('id', new CheckUUID()) id: string) {
    return this.categoryBlogService.deleteCategoryBlog(id);
  }
}
