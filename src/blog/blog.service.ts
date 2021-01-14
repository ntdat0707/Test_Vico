import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { UpdateBlogInput, CreateBlogInput, FilterBlogInput, CreateTagInput } from './blog.dto';
import { Repository, IsNull, Connection, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Blog } from '../entities/blog.entity';
import { CategoryBlog } from '../entities/categoryBlog.entity';
import { convertTv } from '../lib/utils';
import { Employee } from '../entities/employee.entity';
import { BlogTag } from '../entities/blogTag.entity';
@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(CategoryBlog)
    private categoryBlogRepository: Repository<CategoryBlog>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(BlogTag)
    private blogTagRepository: Repository<BlogTag>,
    private connection: Connection,
  ) {}

  async uploadImageBlog(blogPicture: any) {
    if (!blogPicture) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'BLOG_PICTURE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      data: {
        picture: blogPicture.filename,
      },
    };
  }

  async getBlogs(categoryBlogId: string, page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE)) {
    let cacheKey = 'get_blogs';
    const countQuery = this.blogRepository.createQueryBuilder('blog').where('"blog"."deletedAt" is null');

    const blogQuery = this.blogRepository
      .createQueryBuilder('blog')
      .innerJoinAndMapOne(
        'blog.categoryBlog',
        CategoryBlog,
        'category_blog',
        '"blog"."categoryBlogId"=category_blog.id',
      )
      .innerJoinAndMapOne('blog.author', Employee, 'employee_author', '"blog"."authorId"=employee_author.id')
      .innerJoinAndMapOne('blog.createdBy', Employee, 'employee', '"blog"."createdBy"=employee.id')
      .where('"blog"."deletedAt" is null')
      .orderBy('"blog"."createdAt"', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (categoryBlogId) {
      cacheKey += 'categoryBlogId' + categoryBlogId;
      countQuery.andWhere('"blog"."categoryBlogId"=:categoryBlogId', { categoryBlogId });
      blogQuery.andWhere('"blog"."categoryBlogId"=:categoryBlogId', { categoryBlogId });
    }
    const blogs: Blog[] = await blogQuery.cache(`${cacheKey}${page}_limit${limit}`).getMany();

    const countBlog: number = await countQuery.cache(cacheKey).getCount();

    const pages = Math.ceil(Number(countBlog) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: countBlog,
      data: blogs,
    };
  }

  async getBlog(id: string) {
    const existBlog: Blog = await this.connection
      .createQueryBuilder(Blog, 'blog')
      .innerJoinAndMapOne(
        'blog.categoryBlog',
        CategoryBlog,
        'category_blog',
        '"blog"."categoryBlogId"=category_blog.id',
      )
      .innerJoinAndMapOne('blog.author', Employee, 'employee_author', '"blog"."authorId"=employee_author.id')
      .innerJoinAndMapOne('blog.createdBy', Employee, 'employee', '"blog"."createdBy"=employee.id')
      .where('blog.id=:id', { id })
      .cache(`blog_${id}`)
      .getOne();
    if (!existBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'BLOG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: existBlog,
    };
  }

  async getBlogBySlug(slug: string) {
    const existBlog: any = await this.connection
      .createQueryBuilder(Blog, 'blog')
      .leftJoinAndMapOne('blog.categoryBlog', CategoryBlog, 'category_blog', '"blog"."categoryBlogId"=category_blog.id')
      .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id')
      .where('slugs::text like :slug', { slug: `%"${slug}"%` })
      .andWhere('(blog."timePublication" <=:now or blog."timePublication" is null)', { now: new Date() })
      .andWhere(`blog."status" = 'publish'`)
      .cache(`blog_${slug}`)
      .getOne();
    if (!existBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'BLOG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const relationship = [];
    if (existBlog.tags?.length > 0) {
      const tags = existBlog.tags.split('|');
      for (const tag of tags) {
        const blogs = await this.blogRepository
          .createQueryBuilder('blog')
          .leftJoinAndMapOne(
            'blog.categoryBlog',
            CategoryBlog,
            'category_blog',
            '"blog"."categoryBlogId"=category_blog.id',
          )
          .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id')
          .where('tags = :tag', { tag: tag })
          .andWhere('blog."id" != :id', { id: existBlog.id })
          .andWhere('(blog."timePublication" <=:now or blog."timePublication" is null)', { now: new Date() })
          .select(['blog', 'category_blog.id', 'category_blog.name', 'employee.id', 'employee.fullName'])
          .cache(`relationship_${tag}`)
          .getMany();
        relationship.push({
          tag: tag,
          blogs: blogs,
        });
      }
    }
    existBlog.relationship = relationship;

    return {
      data: existBlog,
    };
  }

  async getBlogByCategory(
    categoryBlogId: string,
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    const countBlog: number = await this.blogRepository
      .createQueryBuilder('blog')
      .where('"blog"."deletedAt" is null')
      .andWhere('"blog"."categoryBlogId"=:categoryBlogId', { categoryBlogId })
      .cache(`blogs_count${categoryBlogId}`)
      .getCount();
    const blogs: Blog[] = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndMapOne('blog.categoryBlog', CategoryBlog, 'category_blog', '"blog"."categoryBlogId"=category_blog.id')
      .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id')
      .where('"blog"."deletedAt" is null')
      .andWhere('"blog"."categoryBlogId"=:categoryBlogId', { categoryBlogId })
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('"blog"."createdAt"', 'DESC')
      .cache(`blogs_page${categoryBlogId}${page}_limit${limit}`)
      .getMany();

    const pages = Math.ceil(Number(countBlog) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: countBlog,
      data: blogs,
    };
  }

  async createBlog(userId: string, createBlogInput: CreateBlogInput) {
    const existCategoryBlog: any = await this.categoryBlogRepository
      .createQueryBuilder('category_blog')
      .leftJoinAndMapMany(
        'category_blog.childrens',
        CategoryBlog,
        'category_blog_children',
        '"category_blog".id=category_blog_children."parentId"',
      )
      .where('"category_blog"."deletedAt" is null')
      .andWhere('"category_blog".id = :id', { id: createBlogInput.categoryBlogId })
      .getOne();

    if (!existCategoryBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_BLOG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existCategoryBlog.childrens.length > 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_BLOG_MUST_BE_CHILDREN',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let existSlug: any;
    existSlug = await this.categoryBlogRepository.findOne({
      where: {
        slug: createBlogInput.slug,
        deletedAt: IsNull(),
      },
    });
    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }
    existSlug = await this.productRepository
      .createQueryBuilder('product')
      .where(`slugs::text like :slug`, { slug: `%"${createBlogInput.slug}"%` })
      .andWhere('"deletedAt" is null')
      .getOne();

    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }

    existSlug = await this.blogRepository
      .createQueryBuilder('blog')
      .where(`slugs::text like :slug`, { slug: `%"${createBlogInput.slug}"%` })
      .andWhere('"deletedAt" is null')
      .getOne();

    if (existSlug) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'SLUG_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }

    let newBlog = new Blog();
    newBlog.setAttributes(createBlogInput);
    newBlog.pageTitle = createBlogInput.pageTitle ? createBlogInput.pageTitle : createBlogInput.title + '| Winemart';

    newBlog.timePublication = createBlogInput.timePublication ? createBlogInput.timePublication : new Date();

    newBlog.slugs = [];
    newBlog.slugs.push(createBlogInput.slug);
    if (createBlogInput.status !== 'publish' && createBlogInput.status !== 'private') {
      newBlog.status = 'publish';
    }
    if (createBlogInput.tags?.length > 0) {
      newBlog.tags = createBlogInput.tags.join('|');
    }
    // newBlog.createdBy = userId;
    newBlog.createdBy = userId ? userId : 'fd309657-4aee-4fb5-886b-7d2acfcc5811';
    if (!createBlogInput.authorId) {
      newBlog.authorId = userId;
    } else {
      const existAuthor: Employee = await this.employeeRepository.findOne({
        where: {
          id: createBlogInput.authorId,
          deletedAt: IsNull(),
        },
      });

      if (!existAuthor) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'AUTHOR_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      newBlog.authorId = createBlogInput.authorId;
    }
    await this.connection.queryResultCache.clear();
    newBlog = await this.blogRepository.save(newBlog);
    return {
      data: newBlog,
    };
  }

  async updateBlog(id: string, userId: string, updateBlogInput: UpdateBlogInput) {
    const existBlog: Blog = await this.blogRepository.findOne({
      where: {
        id: id,
        deletedAt: IsNull(),
      },
    });

    if (!existBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'BLOG_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateBlogInput.slug) {
      if (!existBlog.slugs.includes(updateBlogInput.slug)) {
        let existSlug: any;
        existSlug = await this.blogRepository
          .createQueryBuilder('blog')
          .where(`slugs::text like :slug`, { slug: `%"${updateBlogInput.slug}"%` })
          .andWhere('"deletedAt" is null')
          .getOne();
        if (existSlug && existSlug.id !== id) {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'SLUG_EXISTED',
            },
            HttpStatus.CONFLICT,
          );
        }

        existSlug = await this.categoryBlogRepository.findOne({
          where: {
            slug: updateBlogInput.slug,
            deletedAt: IsNull(),
          },
        });
        if (existSlug) {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'SLUG_EXISTED',
            },
            HttpStatus.CONFLICT,
          );
        }

        existSlug = await this.productRepository
          .createQueryBuilder('product')
          .where(`slugs::text like :slug`, { slug: `%"${updateBlogInput.slug}"%` })
          .getOne();

        if (existSlug) {
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'SLUG_EXISTED',
            },
            HttpStatus.CONFLICT,
          );
        }
        existBlog.slugs.push(updateBlogInput.slug);
      } else {
        const index: number = existBlog.slugs.indexOf(updateBlogInput.slug);
        const temp: any = existBlog.slugs[existBlog.slugs.length - 1];
        existBlog.slugs[existBlog.slugs.length - 1] = existBlog.slugs[index];
        existBlog.slugs[index] = temp;
      }
    }

    if (updateBlogInput.authorId) {
      const existAuthor: Employee = await this.employeeRepository.findOne({
        where: {
          id: updateBlogInput.authorId,
          deletedAt: IsNull(),
        },
      });

      if (!existAuthor) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'AUTHOR_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    if (updateBlogInput.categoryBlogId) {
      const existCategoryBlog: any = await this.categoryBlogRepository
        .createQueryBuilder('category_blog')
        .leftJoinAndMapMany(
          'category_blog.childrens',
          CategoryBlog,
          'category_blog_children',
          '"category_blog".id=category_blog_children."parentId"',
        )
        .where('"category_blog"."deletedAt" is null')
        .andWhere('"category_blog".id = :id', { id: updateBlogInput.categoryBlogId })
        .getOne();

      if (!existCategoryBlog) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'CATEGORY_BLOG_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (existCategoryBlog.childrens.length > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'CATEGORY_BLOG_MUST_BE_CHILDREN',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    existBlog.setAttributes(updateBlogInput);
    if (updateBlogInput.tags?.length > 0) {
      existBlog.tags = updateBlogInput.tags.join('|');
    }

    await this.blogRepository.save(existBlog);
    await this.connection.queryResultCache.clear();
    return {
      data: existBlog,
    };
  }

  async deleteBlog(id: string) {
    const existBlog: Blog = await this.blogRepository.findOne({
      where: {
        id: id,
        deletedAt: IsNull(),
      },
    });

    if (!existBlog) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'BLOG_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const deletedAt = new Date();
    existBlog.deletedAt = deletedAt;
    //clear cache
    await this.connection.queryResultCache.clear();
    await this.blogRepository.save(existBlog);
    return {
      message: 'SUCCESS',
    };
  }

  async blogFilterAdmin(blogFilterInput: FilterBlogInput) {
    const page = blogFilterInput.page || 1;
    const limit = blogFilterInput.limit || parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE);
    let cacheKey = 'blog_filter_admin';
    const searchValue = blogFilterInput.searchValue;
    let searchValueConvert = '';
    const parentId = blogFilterInput.parentId;
    const categoryBlogs = blogFilterInput.categoryBlogs;
    const categoryBlogOfParents = [];
    const blogQuery = this.blogRepository
      .createQueryBuilder('blog')
      .select(['blog.id', 'blog.title', 'blog.imageFeatured', 'blog.timePublication', 'blog.status', 'blog.slugs'])
      .where('blog."deletedAt" is null')
      .leftJoinAndMapOne('blog.categoryBlog', CategoryBlog, 'category_blog', '"blog"."categoryBlogId"=category_blog.id')
      .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id')
      .orderBy('"blog"."createdAt"', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    const countQuery = this.blogRepository
      .createQueryBuilder('blog')
      .where('blog."deletedAt" is null')
      .leftJoinAndMapOne('blog.categoryBlog', CategoryBlog, 'category_blog', '"blog"."categoryBlogId"=category_blog.id')
      .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id');

    if (searchValue) {
      searchValueConvert += `%${convertTv(searchValue)}%`;
      cacheKey += 'searchValue' + searchValue;
      const bracket = new Brackets(qb => {
        qb.orWhere(`LOWER(convertTVkdau("blog"."title")) like '${searchValueConvert}'`);
        qb.orWhere(`LOWER(convertTVkdau("employee"."fullName")) like '${searchValueConvert}'`);
      });
      blogQuery.andWhere(bracket);
      countQuery.andWhere(bracket);
    }
    if (parentId) {
      cacheKey += 'parentId' + parentId;
      const categoryBlogChildrens = await this.categoryBlogRepository.find({
        where: {
          parentId: parentId,
          deletedAt: IsNull(),
        },
      });
      if (categoryBlogChildrens.length > 0) {
        for (const categoryBlogChildren of categoryBlogChildrens) {
          categoryBlogOfParents.push(categoryBlogChildren);
        }
      } else {
        categoryBlogOfParents.push(parentId);
      }
      blogQuery.andWhere('blog."categoryBlogId" IN (:...categoryBlogOfParents)');
      countQuery.andWhere('blog."categoryBlogId" IN (:...categoryBlogOfParents)');
    }

    if (categoryBlogs?.length > 0) {
      cacheKey += 'categoryBlogs' + categoryBlogs.join(',');
      blogQuery.andWhere('blog."categoryBlogId" IN (:...categoryBlogs)');
      countQuery.andWhere('blog."categoryBlogId" IN (:...categoryBlogs)');
    }
    const countBlog: number = await countQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(cacheKey)
      .setParameters({
        categoryBlogOfParents,
        categoryBlogs,
      })
      .getCount();

    const blogs: Blog[] = await blogQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`${cacheKey}_page${page}_limit${limit}`)
      .setParameters({
        categoryBlogOfParents,
        categoryBlogs,
      })
      .getMany();

    const pages = Math.ceil(Number(countBlog) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: countBlog,
      data: blogs,
    };
  }

  async blogFilter(
    searchValue: string,
    parentId: string,
    categoryBlogs: string[],
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    let cacheKey = 'blog_filter';
    let searchValueConvert = '';

    const categoryBlogOfParents = [];
    const blogQuery = this.blogRepository
      .createQueryBuilder('blog')
      .select([
        'blog.id',
        'blog.title',
        'blog.imageFeatured',
        'blog.shortDescription',
        'blog.tags',
        'blog.timePublication',
        'blog.pageTitle',
        'blog.slugs',
      ])
      .where('(blog."timePublication" <=:now or blog."timePublication" is null)', { now: new Date() })
      .andWhere(`blog."status" = 'publish'`)
      .leftJoinAndMapOne('blog.categoryBlog', CategoryBlog, 'category_blog', '"blog"."categoryBlogId"=category_blog.id')
      .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id')
      .orderBy('"blog"."position"', 'ASC')
      .orderBy('"blog"."timePublication"', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    const countQuery = this.blogRepository
      .createQueryBuilder('blog')
      .where('(blog."timePublication" <=:now or blog."timePublication" is null)', { now: new Date() })
      .andWhere(`blog."status" = 'publish'`)
      .leftJoinAndMapOne('blog.categoryBlog', CategoryBlog, 'category_blog', '"blog"."categoryBlogId"=category_blog.id')
      .leftJoinAndMapOne('blog.author', Employee, 'employee', '"blog"."authorId"=employee.id');

    if (searchValue) {
      searchValueConvert += `%${convertTv(searchValue)}%`;
      cacheKey += 'searchValue' + searchValue;
      const bracket = new Brackets(qb => {
        qb.orWhere(`LOWER(convertTVkdau("blog"."title")) like '${searchValueConvert}'`);
        qb.orWhere(`LOWER(convertTVkdau("employee"."fullName")) like '${searchValueConvert}'`);
      });
      blogQuery.andWhere(bracket);
      countQuery.andWhere(bracket);
    }
    if (parentId) {
      cacheKey += 'parentId' + parentId;
      const categoryBlogChildrens = await this.categoryBlogRepository.find({
        where: {
          parentId: parentId,
          deletedAt: IsNull(),
        },
      });
      if (categoryBlogChildrens.length > 0) {
        for (const categoryBlogChildren of categoryBlogChildrens) {
          categoryBlogOfParents.push(categoryBlogChildren);
        }
      } else {
        categoryBlogOfParents.push(parentId);
      }
      blogQuery.andWhere('blog."categoryBlogId" IN (:...categoryBlogOfParents)');
      countQuery.andWhere('blog."categoryBlogId" IN (:...categoryBlogOfParents)');
    }

    if (categoryBlogs?.length > 0) {
      cacheKey += 'categoryBlogs' + categoryBlogs.join(',');
      blogQuery.andWhere('category_blog.slug IN (:...categoryBlogs)');
      countQuery.andWhere('category_blog.slug IN (:...categoryBlogs)');
    }
    const countBlog: number = await countQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(cacheKey)
      .setParameters({
        categoryBlogOfParents,
        categoryBlogs,
      })
      .getCount();

    const blogs: Blog[] = await blogQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`${cacheKey}_page${page}_limit${limit}`)
      .setParameters({
        categoryBlogOfParents,
        categoryBlogs,
      })
      .getMany();

    const pages = Math.ceil(Number(countBlog) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: countBlog,
      data: blogs,
    };
  }

  async getAllManager() {
    const employees = await this.employeeRepository.find({
      select: ['id', 'fullName'],
    });
    return {
      data: employees,
    };
  }

  async createTag(createTagInput: CreateTagInput) {
    if (!createTagInput.tag) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'TAG_NOT_EXIST',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existBlogTag = await this.blogTagRepository.findOne({
      where: {
        tag: createTagInput.tag,
      },
    });
    if (existBlogTag) {
      return {
        data: existBlogTag,
      };
    }

    let newBlogTag = new BlogTag();
    newBlogTag.setAttributes(createTagInput);
    newBlogTag = await this.blogTagRepository.save(newBlogTag);
    return {
      data: newBlogTag,
    };
  }

  async getAllTag() {
    const blogTags = await this.blogTagRepository.find();
    return {
      data: blogTags,
    };
  }
}
