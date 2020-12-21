import { Module } from '@nestjs/common';
import { ToppingController } from './topping.controller';
import { ToppingService } from './topping.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topping } from '../entities/topping.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve, basename } from 'path';
import { RoleService } from '../role/role.service';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionRole } from '../entities/permissionRole.entity';
import * as shortid from 'shortid';
import { Category } from '../entities/category.entity';
import { ProductTopping } from 'src/entities/productTopping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topping, ProductTopping, Role, Permission, PermissionRole, Category]),
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
  controllers: [ToppingController],
  providers: [ToppingService, RoleService],
})
export class ToppingModule {}
