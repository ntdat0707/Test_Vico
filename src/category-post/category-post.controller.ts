import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCategoryPostPipe } from '../lib/validatePipe/category-post/createCategoryPostPipe.class';
import { UpdateCategoryPostPipe } from '../lib/validatePipe/category-post/updateCategoryPostPipe.class';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { CreateCategoryPostInput, UpdateCategoryPostInput } from './category-post.dto';
import { CategoryPostService } from './category-post.service';

@Controller('category-post')
@ApiTags('Category Post')
export class CategoryPostController {
  constructor(private categoryPostService: CategoryPostService) {}

  @Get(':id')
  async getCategoryPost(@Param('id', new CheckUUID()) id: string) {
    return await this.categoryPostService.getCategoryPost(id);
  }

  @Get(':categoryPostId/children')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getCategoriesByParentId(
    @Param('categoryPostId', new CheckUUID()) categoryPostId: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.categoryPostService.getCategoriesByParentId(categoryPostId, page, limit);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getCategories(
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.categoryPostService.getCategories(page, limit);
  }

  @Get('get-all/category-post-parent')
  async getAllCategoryParent() {
    return await this.categoryPostService.getAllCategoryParent();
  }

  @Post()
  @UseInterceptors(FileInterceptor('categoryPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateCategoryPostInput,
  })
  async createCategoryPost(
    @UploadedFile() categoryPostPicture: any,
    @Body(new CreateCategoryPostPipe()) createCategoryPostInput: CreateCategoryPostInput,
  ) {
    return this.categoryPostService.createCategoryPost(categoryPostPicture, createCategoryPostInput);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('categoryPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateCategoryPostInput,
  })
  async updateCategoryPost(
    @Param('id', new CheckUUID()) id: string,
    @UploadedFile() categoryPostPicture: any,
    @Body(new UpdateCategoryPostPipe()) updateCategoryPostInput: UpdateCategoryPostInput,
  ) {
    return this.categoryPostService.updateCategoryPost(id, categoryPostPicture, updateCategoryPostInput);
  }

  @Delete(':id')
  async deleteCategoryPost(@Param('id', new CheckUUID()) id: string) {
    return this.categoryPostService.deleteCategoryPost(id);
  }
}
