import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository, IsNull, Connection, Not, getManager } from 'typeorm';
import { CreateCategoryInput, SettingPositionCategoryInput } from './category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private connection: Connection,
  ) {}

  async getCategory(id: string) {
    this.logger.debug(`Running api getCategory at ${new Date()}`);
    const existCategory = await this.categoryRepository.findOne({
      where: {
        id: id,
        status: true,
      },
    });

    if (!existCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return { data: existCategory };
  }

  async getCategories(page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE, 10)) {
    this.logger.debug(`Running api getCategories at ${new Date()}`);
    const now = new Date();
    const categoryQuery = this.categoryRepository
      .createQueryBuilder('category')
      .where('category."timePublication" <=:now or category."timePublication" is null', { now: now });
    const categoryCount = await categoryQuery.cache(`category_count_page${page}_limit${limit}`).getCount();
    const categories = await categoryQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('category.position', 'ASC')
      .where('category."timePublication" <=:now or category."timePublication" is null', { now: now })
      .cache(`category_page${page}_limit${limit}`)
      .getMany();
    const pages = Math.ceil(Number(categoryCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: categoryCount,
      data: categories,
    };
  }

  async getAllCategories() {
    this.logger.debug(`Running api getAllCategories at ${new Date()}`);
    const now = new Date();
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .orderBy('category.position', 'ASC')
      .where('category."timePublication" <=:now or category."timePublication" is null', { now: now })
      .cache(`get_all_categories`)
      .getMany();
    return {
      data: categories,
    };
  }

  async createCategory(categoryPicture: any, createCategoryInput: CreateCategoryInput) {
    this.logger.debug(`Running api createCategory at ${new Date()}`);
    const existCategory = await this.categoryRepository.findOne({
      where: {
        name: createCategoryInput.name,
      },
    });
    if (existCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'CATEGORY_NAME_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }
    const existCategoryCode = await this.categoryRepository.findOne({
      where: {
        code: createCategoryInput.code,
      },
    });
    if (existCategoryCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'CATEGORY_CODE_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    let newCategory = new Category();
    newCategory.setAttributes(createCategoryInput);

    if (!createCategoryInput.pageTitle) {
      newCategory.pageTitle = createCategoryInput.name + ' | Mi Dom';
    }
    if (categoryPicture) {
      newCategory.picture = categoryPicture.filename;
    }
    await this.connection.queryResultCache.clear();
    newCategory = await this.categoryRepository.save(newCategory);
    return { data: newCategory };
  }

  // async updateCategory(id: string, updateCategoryInput: UpdateCategoryInput, categoryPicture: any) {
  //   this.logger.debug(`Running api updateCategory at ${new Date()}`);
  //   let existCategory: any;
  //   if (updateCategoryInput.name) {
  //     existCategory = await this.categoryRepository.findOne({
  //       where: {
  //         name: updateCategoryInput.name,
  //         id: Not(id),
  //       },
  //     });
  //     if (existCategory) {
  //       throw new HttpException(
  //         {
  //           statusCode: HttpStatus.CONFLICT,
  //           message: 'CATEGORY_NAME_EXISTED',
  //         },
  //         HttpStatus.CONFLICT,
  //       );
  //     }
  //   }

  //   existCategory = await this.categoryRepository.findOne({
  //     where: {
  //       id: id,
  //     },
  //   });

  //   if (!existCategory) {
  //     throw new HttpException(
  //       {
  //         statusCode: HttpStatus.NOT_FOUND,
  //         message: 'CATEGORY_NOT_EXIST',
  //       },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }

  //   let arrUpdateProduct = [];

  //   existCategory.setAttributes(updateCategoryInput);
  //   if (categoryPicture) {
  //     existCategory.picture = categoryPicture.filename;
  //   }
  //   //clear cache
  //   await this.connection.queryResultCache.clear();
  //   await getManager().transaction(async transactionalEntityManager => {
  //     if (arrUpdateProduct.length > 0) {
  //       await transactionalEntityManager.update(Product, { id: In(arrUpdateProduct) }, { status: false });
  //     }
  //     await transactionalEntityManager.save<Category>(existCategory);
  //   });
  //   return {
  //     data: existCategory,
  //   };
  // }

  // async deleteCategory(id: string) {
  //   this.logger.debug(`Running api deleteCategory at ${new Date()}`);
  //   const existCategory: Category = await this.categoryRepository.findOne({
  //     where: {
  //       id: id,
  //     },
  //   });

  //   if (!existCategory) {
  //     throw new HttpException(
  //       {
  //         statusCode: HttpStatus.NOT_FOUND,
  //         message: 'CATEGORY_NOT_EXIST',
  //       },
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   const productInCategory = await this.productCategoryRepository
  //     .createQueryBuilder('productCategory')
  //     .where('"productCategory"."categoryId" = :id', { id: id })
  //     .leftJoinAndMapMany('productCategory.product', Product, ' product', 'productCategory.productId = product.id')
  //     .getOne();

  //   if (productInCategory) {
  //     throw new HttpException(
  //       {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'CATEGORY_DELETE_NOT_ALLOW',
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   await this.connection.queryResultCache.clear();
  //   await this.categoryRepository.softRemove(existCategory);
  //   return {
  //     data: 'success',
  //   };
  // }

  async getAllCategoriesByAdmin() {
    this.logger.debug(`Running api getAllCategoriesByAdmin at ${new Date()}`);
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .orderBy('category.position', 'ASC')
      .cache(`get_all_categories_by_admin`)
      .getMany();
    return {
      data: categories,
    };
  }

  async settingCategoryPosition(settingPositionCategoryInput: SettingPositionCategoryInput) {
    const arrUpdateCategory = [];
    for (const categoryPosition of settingPositionCategoryInput.categoryPositions) {
      const category = await this.categoryRepository.findOne({
        select: ['id', 'position'],
        where: {
          id: categoryPosition.categoryId,
          status: true,
        },
      });

      if (!category) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'CATEGORY_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      category.position = categoryPosition.position;
      arrUpdateCategory.push(category);
    }

    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.update(Category, { position: Not(IsNull()) }, { position: null });
      await transactionalEntityManager.save<Category>(arrUpdateCategory);
    });
    await this.connection.queryResultCache.clear();
    return { data: true };
  }
}
