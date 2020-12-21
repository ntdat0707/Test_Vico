import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { Category } from '../entities/category.entity';
import { CategoryPost } from '../entities/categoryPost.entity';
import { Product } from '../entities/product.entity';
import { EBlogStatus } from '../lib/constant';
import { Connection, getManager, IsNull, Not, Repository } from 'typeorm';
import { CreateCategoryPostInput, UpdateCategoryPostInput } from './category-post.dto';

@Injectable()
export class CategoryPostService {
  private readonly logger = new Logger(CategoryPostService.name);
  constructor(
    @InjectRepository(CategoryPost)
    private categoryPostRepository: Repository<CategoryPost>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    private connection: Connection,
  ) {}

  async getCategoryPost(id: string) {
    this.logger.debug(`Running api getCategoryPost at ${new Date()}`);
    const category = await this.categoryPostRepository
      .createQueryBuilder('category')
      .where('category."deletedAt" is null')
      .andWhere('category.id=:id', { id })
      .cache(`category_post_${id}`)
      .getOne();
    if (!category) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_POST_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return { data: category };
  }

  async getCategoriesByParentId(
    categoryPostId: string,
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    this.logger.debug(`Running api getCategoriesByParentId at ${new Date()}`);
    const countCategory: number = await this.categoryPostRepository
      .createQueryBuilder('category')
      .where('category."deletedAt" is null')
      .andWhere('category."parentId"=:categoryPostId', { categoryPostId })
      .cache(`categories_post_count${categoryPostId}`)
      .getCount();
    const existCategories: CategoryPost[] = await this.categoryPostRepository
      .createQueryBuilder('category')
      .where('category."deletedAt" is null')
      .andWhere('category."parentId"=:categoryPostId', { categoryPostId })
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`categories_post_parentId${categoryPostId}page${page}_limit${limit}`)
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
    const categoriesQuery = this.categoryPostRepository
      .createQueryBuilder('category')
      .where('category."deletedAt" is null');
    const categoriesCount = await categoriesQuery.cache(`categories_post_count_page${page}_limit${limit}`).getCount();
    const categories = await categoriesQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`categories_post_page${page}_limit${limit}`)
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
    const categoryPostParents = await this.categoryPostRepository.find({
      where: {
        parentId: IsNull(),
      },
    });
    return {
      data: categoryPostParents,
    };
  }

  async createCategoryPost(categoryPostPicture: any, createCategoryPostInput: CreateCategoryPostInput) {
    this.logger.warn(`Running api createCategoryPost at ${new Date()}`);
    const existNameCategory = await this.categoryPostRepository.findOne({
      where: {
        name: createCategoryPostInput.name,
      },
    });
    if (existNameCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'CATEGORY_POST_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    let existParentId: CategoryPost;
    if (createCategoryPostInput.parentId) {
      existParentId = await this.categoryPostRepository.findOne({
        where: {
          id: createCategoryPostInput.parentId,
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
      .where(`slugs::text = :slug`, { slug: `%"${createCategoryPostInput.slug}"%` })
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
      .where(`slugs::text = :slug`, { slug: `%"${createCategoryPostInput.slug}"%` })
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
      .where(`slug = :slug`, { slug: `%"${createCategoryPostInput.slug}"%` })
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
    existSlug = await this.categoryPostRepository
      .createQueryBuilder('category')
      .where(`slug = :slug`, { slug: `%"${createCategoryPostInput.slug}"%` })
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

    let newCategoryPost = new CategoryPost();
    newCategoryPost.setAttributes(createCategoryPostInput);
    if (categoryPostPicture) {
      newCategoryPost.picture = categoryPostPicture.filename;
    }
    await this.connection.queryResultCache.clear();
    await getManager().transaction(async transactionalEntityManager => {
      if (createCategoryPostInput.parentId && existParentId.isHaveChildren === false) {
        existParentId.isHaveChildren = true;
        await transactionalEntityManager.save<CategoryPost>(existParentId);
      }
      newCategoryPost = await transactionalEntityManager.save<CategoryPost>(newCategoryPost);
    });

    return { data: newCategoryPost };
  }

  async updateCategoryPost(id: string, categoryPostPicture: any, updateCategoryPostInput: UpdateCategoryPostInput) {
    this.logger.warn(`Running api updateCategoryPost at ${new Date()}`);
    const existCategoryPost = await this.categoryPostRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existCategoryPost) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_POST_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateCategoryPostInput.name !== existCategoryPost.name) {
      const existNameCategory = await this.categoryPostRepository.findOne({
        name: updateCategoryPostInput.name,
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
      existCategoryPost.name = updateCategoryPostInput.name;
    }

    if (updateCategoryPostInput.slug !== existCategoryPost.slug) {
      let existSlug: any = await this.productRepository
        .createQueryBuilder('product')
        .where(`slugs::text = :slug`, { slug: `%"${updateCategoryPostInput.slug}"%` })
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
        .where(`slugs::text = :slug`, { slug: `%"${updateCategoryPostInput.slug}"%` })
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
          slug: updateCategoryPostInput.slug,
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
          slug: updateCategoryPostInput.slug,
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

      existCategoryPost.slug = updateCategoryPostInput.slug;
    }

    if (updateCategoryPostInput.parentId && updateCategoryPostInput.parentId !== existCategoryPost.parentId) {
      const parent: any = await this.categoryPostRepository
        .createQueryBuilder('category')
        .leftJoinAndMapMany(
          'category.children',
          CategoryPost,
          'category_children',
          'category.id = category_children.parentId',
        )
        .where('"category"."id" = :parentId', { parentId: existCategoryPost.parentId })
        .andWhere('"category"."deletedAt" is null')
        .andWhere('"category_children"."deletedAt" is null')
        .getOne();
      if (parent.children.length === 1) {
        parent.isHaveChildren = false;
        await this.categoryPostRepository.save(parent);
      }

      const existParentId = await this.categoryPostRepository.findOne({
        where: {
          id: updateCategoryPostInput.parentId,
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

      existCategoryPost.parentId = updateCategoryPostInput.parentId;
    }
    if (updateCategoryPostInput.description !== existCategoryPost.description) {
      existCategoryPost.description = updateCategoryPostInput.description;
    }
    if (categoryPostPicture) {
      existCategoryPost.picture = categoryPostPicture.filename;
    }

    await this.categoryPostRepository.save(existCategoryPost);
    return { data: existCategoryPost };
  }

  async deleteCategoryPost(id: string) {
    this.logger.warn(`Running api deleteCategoryPost at ${new Date()}`);
    const existCategoryPost = await this.categoryPostRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existCategoryPost) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_POST_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existCategoryPost.isHaveChildren) {
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
        categoryPostId: id,
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

    if (existCategoryPost.parentId) {
      const parent: any = await this.categoryPostRepository
        .createQueryBuilder('category')
        .leftJoinAndMapMany(
          'category.children',
          CategoryPost,
          'category_children',
          'category.id = category_children.parentId',
        )
        .where('"category"."id" = :parentId', { parentId: existCategoryPost.parentId })
        .andWhere('"category"."deletedAt" is null')
        .andWhere('"category_children"."deletedAt" is null')
        .getOne();
      if (parent.children.length === 1) {
        parent.isHaveChildren = false;
        await this.categoryPostRepository.save(parent);
      }
    }

    await this.connection.queryResultCache.clear();
    await this.categoryPostRepository.softRemove(existCategoryPost);
    return { data: 'success' };
  }
}
