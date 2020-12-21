import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { MulterModule } from '@nestjs/platform-express';
import { Product } from '../entities/product.entity';
import { diskStorage } from 'multer';
import { extname, resolve, basename } from 'path';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import * as shortid from 'shortid';
import { Blog } from '../entities/blog.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { CategoryPost } from '../entities/categoryPost.entity';
import { RoleService } from '../role/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      Role,
      Permission,
      PermissionRole,
      Blog,
      ProductCategory,
      CategoryPost,
    ]),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: (req, file, cb) => cb(null, resolve('.', process.env.CATEGORY_IMAGE_PATH)),
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
  controllers: [CategoryController],
  providers: [CategoryService, RoleService],
})
export class CategoryModule {}
