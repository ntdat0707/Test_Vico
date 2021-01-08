import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { Category } from '../entities/category.entity';
import { CategoryBlog } from '../entities/categoryBlog.entity';
import { Product } from '../entities/product.entity';
import { EBlogStatus } from '../lib/constant';
import { Connection, getManager, IsNull, Not, Repository } from 'typeorm';
import { CreateCategoryBlogInput, UpdateCategoryBlogInput } from './category-blog.dto';

@Injectable()
export class CategoryBlogService {
  private readonly logger = new Logger(CategoryBlogService.name);
  constructor(
    @InjectRepository(CategoryBlog)
    private categoryBlogRepository: Repository<CategoryBlog>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    private connection: Connection,
  ) {}

  async getCategoryBlog(id: string) {
    this.logger.debug(`Running api getCategoryBlog at ${new Date()}`);
    const category = await this.categoryBlogRepository
      .createQueryBuilder('category_blog')
      .where('category_blog."deletedAt" is null')
      .andWhere('category_blog.id=:id', { id })
      .cache(`category_blog_${id}`)
      .getOne();
    if (!category) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_BLOG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return { data: category };
  }

  async getCategoriesByParentId(
    categoryBlogId: string,
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    this.logger.debug(`Running api getCategoriesByParentId at ${new Date()}`);
    const countCategory: number = await this.categoryBlogRepository
      .createQueryBuilder('category_blog')
      .where('category_blog."deletedAt" is null')
      .andWhere('category_blog."parentId"=:categoryBlogId', { categoryBlogId })
      .cache(`categories_blog_count${categoryBlogId}`)
      .getCount();
    const existCategories: CategoryBlog[] = await this.categoryBlogRepository
      .createQueryBuilder('category_blog')
      .where('category_blog."deletedAt" is null')
      .andWhere('category_blog."parentId"=:categoryBlogId', { categoryBlogId })
      .orderBy('category_blog.position', 'ASC')
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`categories_blog_parentId${categoryBlogId}page${page}_limit${limit}`)
      .getMany();

    const pages = Math.ceil(Number(countCategory) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: countCategory,
      data: existCategories,
    };
  }

  async getCategories(page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE)) {
    this.logger.debug(`Running api getCategories at ${new Date()}`);
    const categoriesQuery = this.categoryBlogRepository
      .createQueryBuilder('category_blog')
      .orderBy('category_blog.position', 'ASC')
      .where('category_blog."deletedAt" is null');
    const categoriesCount = await categoriesQuery.cache(`categories_blog_count_page${page}_limit${limit}`).getCount();
    const categories = await categoriesQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`categories_blog_page${page}_limit${limit}`)
      .getMany();
    const pages = Math.ceil(Number(categoriesCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: categoriesCount,
      data: categories,
    };
  }

  async getAllCategoryParent() {
    this.logger.debug(`Running api getAllCategoryParent at ${new Date()}`);
    const categoryBlogParents = await this.categoryBlogRepository.find({
      where: {
        parentId: IsNull(),
      },
      order: { position: 'ASC' },
    });
    return {
      data: categoryBlogParents,
    };
  }

  async createCategoryBlog(categoryBlogPicture: any, createCategoryBlogInput: CreateCategoryBlogInput) {
    this.logger.debug(`Running api createCategoryBlog at ${new Date()}`);
    const existNameCategory = await this.categoryBlogRepository.findOne({
      where: {
        name: createCategoryBlogInput.name,
      },
    });
    if (existNameCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'CATEGORY_BLOG_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    let existParentId: CategoryBlog;
    if (createCategoryBlogInput.parentId) {
      existParentId = await this.categoryBlogRepository.findOne({
        where: {
          id: createCategoryBlogInput.parentId,
          parentId: IsNull(),
        },
      });
      if (!existParentId) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'PARENT_ID_NOT_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    let existSlug: any = await this.productRepository
      .createQueryBuilder('product')
      .where(`slugs::text = :slug`, { slug: `%"${createCategoryBlogInput.slug}"%` })
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
      .where(`slugs::text = :slug`, { slug: `%"${createCategoryBlogInput.slug}"%` })
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
    existSlug = await this.categoryRepository
      .createQueryBuilder('category')
      .where(`slug = :slug`, { slug: `%"${createCategoryBlogInput.slug}"%` })
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
    existSlug = await this.categoryBlogRepository
      .createQueryBuilder('category')
      .where(`slug = :slug`, { slug: `%"${createCategoryBlogInput.slug}"%` })
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

    let newCategoryBlog = new CategoryBlog();
    newCategoryBlog.setAttributes(createCategoryBlogInput);
    if (categoryBlogPicture) {
      newCategoryBlog.picture = categoryBlogPicture.filename;
    }
    await this.connection.queryResultCache.clear();
    await getManager().transaction(async transactionalEntityManager => {
      if (createCategoryBlogInput.parentId && existParentId.isHaveChildren === false) {
        existParentId.isHaveChildren = true;
        await transactionalEntityManager.save<CategoryBlog>(existParentId);
      }
      newCategoryBlog = await transactionalEntityManager.save<CategoryBlog>(newCategoryBlog);
    });

    return { data: newCategoryBlog };
  }

  async updateCategoryBlog(id: string, categoryBlogPicture: any, updateCategoryBlogInput: UpdateCategoryBlogInput) {
    this.logger.debug(`Running api updateCategoryBlog at ${new Date()}`);
    const existCategoryBlog = await this.categoryBlogRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existCategoryBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_BLOG_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateCategoryBlogInput.name !== existCategoryBlog.name) {
      const existNameCategory = await this.categoryBlogRepository.findOne({
        name: updateCategoryBlogInput.name,
        id: Not(id),
      });
      if (existNameCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'CATEGORY_NAME_ALREADY_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
      existCategoryBlog.name = updateCategoryBlogInput.name;
    }

    if (updateCategoryBlogInput.slug !== existCategoryBlog.slug) {
      let existSlug: any = await this.productRepository
        .createQueryBuilder('product')
        .where(`slugs::text = :slug`, { slug: `%"${updateCategoryBlogInput.slug}"%` })
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
        .where(`slugs::text = :slug`, { slug: `%"${updateCategoryBlogInput.slug}"%` })
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
          slug: updateCategoryBlogInput.slug,
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
      existSlug = await this.categoryBlogRepository.findOne({
        where: {
          slug: updateCategoryBlogInput.slug,
          id: Not(id),
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

      existCategoryBlog.slug = updateCategoryBlogInput.slug;
    }

    if (updateCategoryBlogInput.parentId && updateCategoryBlogInput.parentId !== existCategoryBlog.parentId) {
      const parent: any = await this.categoryBlogRepository
        .createQueryBuilder('category')
        .leftJoinAndMapMany(
          'category.children',
          CategoryBlog,
          'category_children',
          'category.id = category_children.parentId',
        )
        .where('"category"."id" = :parentId', { parentId: existCategoryBlog.parentId })
        .andWhere('"category"."deletedAt" is null')
        .andWhere('"category_children"."deletedAt" is null')
        .getOne();
      if (parent.children.length === 1) {
        parent.isHaveChildren = false;
        await this.categoryBlogRepository.save(parent);
      }

      const existParentId = await this.categoryBlogRepository.findOne({
        where: {
          id: updateCategoryBlogInput.parentId,
          parentId: IsNull(),
        },
      });
      if (!existParentId) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'PARENT_ID_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      existCategoryBlog.parentId = updateCategoryBlogInput.parentId;
    }
    if (updateCategoryBlogInput.description !== existCategoryBlog.description) {
      existCategoryBlog.description = updateCategoryBlogInput.description;
    }
    if (categoryBlogPicture) {
      existCategoryBlog.picture = categoryBlogPicture.filename;
    }

    await this.categoryBlogRepository.save(existCategoryBlog);
    return { data: existCategoryBlog };
  }

  async deleteCategoryBlog(id: string) {
    this.logger.debug(`Running api deleteCategoryBlog at ${new Date()}`);
    const existCategoryBlog = await this.categoryBlogRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existCategoryBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_BLOG_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existCategoryBlog.isHaveChildren) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PARENT_CATEGORY_DELETE_NOT_ALLOW',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const blogInCategory = await this.blogRepository.findOne({
      where: {
        categoryBlogId: id,
        status: EBlogStatus.PUBLISH,
      },
    });

    if (blogInCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_DELETE_NOT_ALLOW',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (existCategoryBlog.parentId) {
      const parent: any = await this.categoryBlogRepository
        .createQueryBuilder('category')
        .leftJoinAndMapMany(
          'category.children',
          CategoryBlog,
          'category_children',
          'category.id = category_children.parentId',
        )
        .where('"category"."id" = :parentId', { parentId: existCategoryBlog.parentId })
        .andWhere('"category"."deletedAt" is null')
        .andWhere('"category_children"."deletedAt" is null')
        .getOne();
      if (parent.children.length === 1) {
        parent.isHaveChildren = false;
        await this.categoryBlogRepository.save(parent);
      }
    }

    await this.connection.queryResultCache.clear();
    await this.categoryBlogRepository.softRemove(existCategoryBlog);
    return { data: 'success' };
  }
}
