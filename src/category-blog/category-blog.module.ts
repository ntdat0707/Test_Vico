import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryBlog } from '../entities/categoryBlog.entity';
import { CategoryBlogController } from './category-blog.controller';
import { CategoryBlogService } from './category-blog.service';
import { diskStorage } from 'multer';
import { extname, resolve, basename } from 'path';
import * as shortid from 'shortid';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Blog } from '../entities/blog.entity';
import { RoleService } from '../role/role.service';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { Role } from '../entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryBlog, Product, Category, Blog, Role, Permission, PermissionRole]),
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
  controllers: [CategoryBlogController],
  providers: [CategoryBlogService, RoleService],
})
export class CategoryBlogModule {}
