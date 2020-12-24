import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ProductSearch } from '../entities/productSearch.entity';
import { diskStorage } from 'multer';
import { extname, resolve, basename } from 'path';
import * as shortid from 'shortid';
import { OrderDetail } from '../entities/orderDetail.entity';
import { Order } from '../entities/order.entity';
import { ProductVariant } from '../entities/productVariant.entity';
import { ProductImage } from '../entities/productImage.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { Blog } from '../entities/blog.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { ProductTopping } from '../entities/productTopping.entity';
import { Topping } from '../entities/topping.entity';
import { CategoryBlog } from '../entities/categoryBlog.entity';
import { RoleService } from '../role/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      ProductSearch,
      OrderDetail,
      Order,
      ProductVariant,
      ProductImage,
      Role,
      Permission,
      PermissionRole,
      Blog,
      ProductCategory,
      ProductImage,
      ProductTopping,
      Topping,
      CategoryBlog,
    ]),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: (req, file, cb) => cb(null, resolve('.', process.env.PRODUCT_IMAGE_PATH)),
          filename: (req: any, file: any, cb: any) => {
            cb(
              null,
              `${basename(file.originalname, extname(file.originalname).toLowerCase())}_${shortid.generate()}${extname(
                file.originalname,
              ).toLowerCase()}`,
            );
          },
        }),
        limits: {
          fileSize: parseInt(process.env.MAX_SIZE_PER_FILE_UPLOAD),
          files: parseInt(process.env.MAX_NUMBER_FILE_UPLOAD),
        },
      }),
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, RoleService],
})
export class ProductModule {}
