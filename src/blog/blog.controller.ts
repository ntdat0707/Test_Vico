import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Query,
  Param,
  Put,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { BlogPictureInput, UpdateBlogInput, CreateBlogInput, FilterBlogInput, CreateTagInput } from './blog.dto';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterBlogPipe } from '../lib/validatePipe/blog/filterBlogPipe.class';
import { CreateBlogPipe } from '../lib/validatePipe/blog/createBlogPipe.class';
import { UpdateBlogPipe } from '../lib/validatePipe/blog/updateBlogPipe.class';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../role/role.decorators';
import { CREATE_BLOG, DELETE_BLOG, FILTER_BLOG, GET_BLOG, UPDATE_BLOG } from '../role/codePermission';
import { OptionalGuard } from 'src/auth/optional.guard';
import { ConvertArray } from 'src/lib/validatePipe/convertArrayPipe.class';

@Controller('blogs')
@ApiTags('Blog')
@UseFilters(new HttpExceptionFilter())
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([GET_BLOG])
  async getBlog(@Param('id', new CheckUUID()) id: string) {
    return await this.blogService.getBlog(id);
  }

  @Get('/slug/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return await this.blogService.getBlogBySlug(slug);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'categoryBlogId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getBlogs(
    @Query('categoryBlogId', new CheckUUID()) categoryBlogId: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.blogService.getBlogs(categoryBlogId, page, limit);
  }

  @Get('/:categoryBlogId/blog')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getBlogByCategory(
    @Param('categoryBlogId', new CheckUUID()) categoryBlogId: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.blogService.getBlogByCategory(categoryBlogId, page, limit);
  }

  @Post('/upload-image-blog')
  @UseInterceptors(FileInterceptor('blogPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: BlogPictureInput,
  })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_BLOG, UPDATE_BLOG])
  async uploadImageBlog(@UploadedFile() blogPicture: BlogPictureInput) {
    return await this.blogService.uploadImageBlog(blogPicture);
  }

  @Post()
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_BLOG])
  async createBlog(@GetUser('userId') userId: string, @Body(new CreateBlogPipe()) createBlogInput: CreateBlogInput) {
    return await this.blogService.createBlog(userId, createBlogInput);
  }

  @Put(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([UPDATE_BLOG])
  async updateBlog(
    @Param('id', new CheckUUID()) id: string,
    @GetUser('userId') userId: string,
    @Body(new UpdateBlogPipe()) updateBlogInput: UpdateBlogInput,
  ) {
    return await this.blogService.updateBlog(id, userId, updateBlogInput);
  }

  @Delete(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([DELETE_BLOG])
  async deleteBlog(@Param('id', new CheckUUID()) id: string) {
    return await this.blogService.deleteBlog(id);
  }

  @Post('admin/blog-filter')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_BLOG])
  async blogFilterAdmin(@Body(new FilterBlogPipe()) blogFilterInput: FilterBlogInput) {
    return await this.blogService.blogFilterAdmin(blogFilterInput);
  }

  @Get('filter/get-all-blog')
  @ApiBearerAuth()
  @UseGuards(OptionalGuard)
  @ApiQuery({ name: 'searchValue', required: false })
  @ApiQuery({ name: 'parentId', required: false })
  @ApiQuery({ name: 'categoryBlogs', required: false, type: String, isArray: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async blogFilter(
    @Query('searchValue') searchValue: string,
    @Query('parentId', new CheckUUID()) parentId: string,
    @Query('categoryBlogs', new ConvertArray()) categoryBlogs: string[],
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.blogService.blogFilter(searchValue, parentId, categoryBlogs, page, limit);
  }

  @Get('admin/get-all-manager')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_BLOG])
  async getAllManager() {
    return await this.blogService.getAllManager();
  }

  @Post('admin/tag/create')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_BLOG])
  async createTag(@Body() createTagInput: CreateTagInput) {
    return await this.blogService.createTag(createTagInput);
  }

  @Get('admin/tag/get-all')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_BLOG])
  async getAllTag() {
    return await this.blogService.getAllTag();
  }
}
