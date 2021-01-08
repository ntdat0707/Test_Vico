import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { resolve, extname, basename } from 'path';
import * as shortid from 'shortid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { CategoryBlog } from '../entities/categoryBlog.entity';
import { Employee } from '../entities/employee.entity';
import { Product } from '../entities/product.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from '../role/role.service';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import { BlogTag } from '../entities/blogTag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, CategoryBlog, Employee, Product, Role, Permission, PermissionRole, BlogTag]),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: (req, file, cb) => cb(null, resolve('.', process.env.BLOG_IMAGE_PATH)),
          filename: (req: any, file: any, cb: any) => {
            console.log(
              '🚀 ~ file: blog.module.ts ~ line 30 ~ `${basename ~ basename(file.originalname, extname(file.originalname).toLowerCase())',
              basename(file.originalname, extname(file.originalname).toLowerCase()),
            );
            cb(
              null,
              `${basename(file.originalname, extname(file.originalname).toLowerCase())}_${shortid.generate()}${extname(
                file.originalname,
              ).toLowerCase()}`,
            );
          },
        }),
      }),
    }),
  ],
  controllers: [BlogController],
  providers: [BlogService, RoleService],
})
export class BlogModule {}
