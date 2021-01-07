import {
  Controller,
  Param,
  UseFilters,
  Get,
  Post,
  Body,
  Delete,
  Put,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { HttpExceptionFilter } from '../exception/httpException.filter';
import {
  CreateManyProductInput,
  CreateProductInput,
  CreateProductVariantInput,
  FileUploadInput,
  FilterProductAdminInput,
  UpdateProductInput,
  UpdateProductVariantInput,
} from './product.dto';
import { CreateProductPipe } from '../lib/validatePipe/product/createProductPipe.class';
import { CheckUUID } from '../lib/validatePipe/uuidPipe.class';
import { UpdateProductPipe } from '../lib/validatePipe/product/updateProductPipe.class';
import { CreateManyProductPipe } from '../lib/validatePipe/product/createManyProductsPipe.class';
import { CreateProductVariantPipe } from '../lib/validatePipe/product/createProductVariantPipe.class';
import { UpdateProductVariantPipe } from '../lib/validatePipe/product/updateProductVariantPipe.class';
import { OptionalGuard } from '../auth/optional.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CheckUnSignIntPipe } from '../lib/validatePipe/checkIntegerPipe.class';
import { ConvertArray } from '../lib/validatePipe/convertArrayPipe.class';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterProductAdminPipe } from '../lib/validatePipe/product/filterProductAdminPipe.class';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CREATE_MANY_PRODUCT,
  CREATE_PRODUCT,
  CREATE_PRODUCT_VARIANT,
  DELETE_PRODUCT,
  DELETE_PRODUCT_VARIANT,
  FILTER_PRODUCT_ADMIN,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_VARIANT,
} from '../role/codePermission';
import { Roles } from '../role/role.decorators';
import { RolesGuard } from '../role/roles.guard';
@Controller('product')
@ApiTags('Product')
@UseFilters(new HttpExceptionFilter())
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get(':id')
  async getProduct(@Param('id', new CheckUUID()) id: string) {
    return await this.productService.getProduct(id);
  }

  @Get('/slug/:slug')
  @ApiBearerAuth()
  @UseGuards(OptionalGuard)
  async getProductBySlug(@GetUser('userId') userId: string, @Param('slug') slug: string) {
    return await this.productService.getProductBySlug(userId, slug);
  }

  @Get('/slug-is-exist/:slug')
  async checkSlugIsExist(@Param('slug') slug: string) {
    return await this.productService.checkSlugIsExist(slug);
  }

  @Get('filter/get-all-product')
  @ApiBearerAuth()
  @UseGuards(OptionalGuard)
  @ApiQuery({ name: 'searchValue', required: false, type: String, isArray: true })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async filterProduct(
    @Query('searchValue', new ConvertArray()) searchValue: string[],
    @GetUser('userId') userId: string,
    @Query('categoryId', new CheckUUID()) categoryId: string,
    @Query('page', new CheckUnSignIntPipe()) page: number,
    @Query('limit', new CheckUnSignIntPipe()) limit: number,
  ) {
    return await this.productService.filterProduct(searchValue, userId, categoryId, page, limit);
  }

  @Post('upload-image-product')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadInput,
  })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_PRODUCT,UPDATE_PRODUCT])
  async uploadImage(@UploadedFile() image: any) {
    return await this.productService.uploadImage(image);
  }

  @Post()
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_PRODUCT])
  async createProduct(@Body(new CreateProductPipe()) createProductInput: CreateProductInput) {
    return await this.productService.createProduct(createProductInput);
  }

  @Post('create-many-product')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_MANY_PRODUCT])
  async createManyProduct(@Body(new CreateManyProductPipe()) createManyProductInput: CreateManyProductInput) {
    return await this.productService.createManyProduct(createManyProductInput);
  }

  @Post('create-product-variant')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_PRODUCT_VARIANT])
  async createProductVariant(
    @Body(new CreateProductVariantPipe()) createProductVariantInput: CreateProductVariantInput,
  ) {
    return await this.productService.createProductVariant(createProductVariantInput);
  }

  @Put(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([UPDATE_PRODUCT])
  async updateProduct(
    @Param('id', new CheckUUID()) id: string,
    @Body(new UpdateProductPipe()) updateProductInput: UpdateProductInput,
  ) {
    return await this.productService.updateProduct(id, updateProductInput);
  }

  @Put('update-product-variant/:id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([UPDATE_PRODUCT_VARIANT])
  async updateProductVariant(
    @Param('id', new CheckUUID()) id: string,
    @Body(new UpdateProductVariantPipe()) updateProductVariantInput: UpdateProductVariantInput,
  ) {
    return await this.productService.updateProductVariant(id, updateProductVariantInput);
  }

  @Delete(':id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([DELETE_PRODUCT])
  async deleteProduct(@Param('id', new CheckUUID()) id: string) {
    return await this.productService.deleteProduct(id);
  }

  @Delete('/delete-product-variant/:id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([DELETE_PRODUCT_VARIANT])
  async deleteProductVariant(@Param('id', new CheckUUID()) id: string) {
    return await this.productService.deleteProductVariant(id);
  }

  @Post('admin/filter-product')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([FILTER_PRODUCT_ADMIN])
  async filterProductAdmin(@Body(new FilterProductAdminPipe()) filterProductAdminInput: FilterProductAdminInput) {
    return await this.productService.filterProductAdmin(filterProductAdminInput);
  }

  // @Post('import-product')
  // // @ApiBearerAuth()
  // // @UseGuards(JwtAuthGuard, RolesGuard)
  // // @Roles([CREATE_PRODUCT_VARIANT])
  // async importProduct() {
  //   return await this.productService.importProduct();
  // }

  // @Post('import-product-variant')
  // // @ApiBearerAuth()
  // // @UseGuards(JwtAuthGuard, RolesGuard)
  // // @Roles([CREATE_PRODUCT_VARIANT])
  // async importProductVariant() {
  //   return await this.productService.importProductVariant();
  // }
}
