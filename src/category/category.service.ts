import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository, IsNull, Connection, Not, getManager, In } from 'typeorm';
import { CreateCategoryInput, UpdateCategoryInput } from './category.dto';
import { Product } from '../entities/product.entity';
import { Blog } from '../entities/blog.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { CategoryPost } from '../entities/categoryPost.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryPost)
    private categoryPostRepository: Repository<CategoryPost>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
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

  async getCategories(page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE)) {
    this.logger.debug(`Running api getCategories at ${new Date()}`);
    const categoryQuery = this.categoryRepository.createQueryBuilder('category');
    const categoryCount = await categoryQuery.cache(`category_count_page${page}_limit${limit}`).getCount();
    const category = await categoryQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('category.sales', 'DESC')
      .cache(`category_page${page}_limit${limit}`)
      .getMany();
    const pages = Math.ceil(Number(categoryCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: categoryCount,
      data: category,
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
          message: 'CATEGORY_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }
    let existSlug: any = await this.productRepository
      .createQueryBuilder('product')
      .where(`slugs::text = :slug`, { slug: `%"${createCategoryInput.slug}"%` })
      .andWhere('"deletedAt" is null')
      .getOne();
    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    existSlug = await this.blogRepository
      .createQueryBuilder('blog')
      .where(`slugs::text = :slug`, { slug: `%"${createCategoryInput.slug}"%` })
      .andWhere('"deletedAt" is null')
      .getOne();
    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    existSlug = await this.categoryRepository.findOne({
      where: {
        slug: createCategoryInput.slug,
      },
    });
    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    existSlug = await this.categoryPostRepository.findOne({
      where: {
        slug: createCategoryInput.slug,
      },
    });
    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_ALREADY_EXIST',
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

  async updateCategory(id: string, updateCategoryInput: UpdateCategoryInput, categoryPicture: any) {
    this.logger.debug(`Running api updateCategory at ${new Date()}`);
    let existCategory: any;
    if (updateCategoryInput.name) {
      existCategory = await this.categoryRepository.findOne({
        where: {
          name: updateCategoryInput.name,
          id: Not(id),
        },
      });
      if (existCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'CATEGORY_NAME_EXISTED',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    if (updateCategoryInput.slug) {
      let existSlug: any = await this.productRepository
        .createQueryBuilder('product')
        .where(`slugs::text = :slug`, { slug: `${updateCategoryInput.slug}` })
        .getOne();
      if (existSlug) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SLUG_ALREADY_EXIST',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      existSlug = await this.categoryRepository.findOne({
        where: {
          slug: updateCategoryInput.slug,
          id: Not(id),
        },
      });
      if (existSlug) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SLUG_ALREADY_EXIST',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      existSlug = await this.blogRepository
        .createQueryBuilder('blog')
        .where(`slugs::text = :slug`, { slug: `${updateCategoryInput.slug}` })
        .getOne();
      if (existSlug) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'SLUG_ALREADY_EXIST',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    existCategory = await this.categoryRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!existCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let arrUpdateProduct = [];
    if (existCategory.status) {
      const productCategories = await this.productCategoryRepository.find({
        where: {
          categoryId: id,
        },
      });

      if (productCategories.length > 0) {
        arrUpdateProduct = productCategories.map(x => x.productId);
      }
    }

    existCategory.setAttributes(updateCategoryInput);
    if (categoryPicture) {
      existCategory.picture = categoryPicture.filename;
    }
    //clear cache
    await this.connection.queryResultCache.clear();
    await getManager().transaction(async transactionalEntityManager => {
      if (arrUpdateProduct.length > 0) {
        await transactionalEntityManager.update(Product, { id: In(arrUpdateProduct) }, { status: false });
      }
      await transactionalEntityManager.save<Category>(existCategory);
    });
    return {
      data: existCategory,
    };
  }

  async deleteCategory(id: string) {
    this.logger.debug(`Running api deleteCategory at ${new Date()}`);
    const existCategory: Category = await this.categoryRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!existCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const productInCategory = await this.productCategoryRepository
      .createQueryBuilder('productCategory')
      .where('"productCategory"."categoryId" = :id', { id: id })
      .leftJoinAndMapMany('productCategory.product', Product, ' product', 'productCategory.productId = product.id')
      .getOne();

    if (productInCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_DELETE_NOT_ALLOW',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.connection.queryResultCache.clear();
    await this.categoryRepository.softRemove(existCategory);
    return {
      data: 'success',
    };
  }
}
