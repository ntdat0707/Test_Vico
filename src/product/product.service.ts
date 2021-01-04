import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, getManager, In, Connection, Brackets, Not } from 'typeorm';
import * as _ from 'lodash';
import {
  CreateManyProductInput,
  CreateProductInput,
  CreateProductVariantInput,
  FilterProductAdminInput,
  UpdateProductInput,
  UpdateProductVariantInput,
} from './product.dto';
import { Category } from '../entities/category.entity';
import { ProductVariant } from '../entities/productVariant.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { ProductImage } from '../entities/productImage.entity';
import { Blog } from '../entities/blog.entity';
import { ProductTopping } from '../entities/productTopping.entity';
import { Topping } from '../entities/topping.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { CategoryBlog } from '../entities/categoryBlog.entity';
import { changeAlias, convertTv } from '../lib/utils';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryBlog)
    private categoryBlogRepository: Repository<CategoryBlog>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductTopping)
    private productToppingRepository: Repository<ProductTopping>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>,
    private connection: Connection,
  ) {}

  async uploadImage(image: any) {
    if (!image) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'IMAGE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      data: {
        picture: image.filename,
      },
    };
  }

  async getProduct(id: string) {
    this.logger.debug(`Running api getProduct at ${new Date()}`);
    const product = await this.productRepository
      .createQueryBuilder('product')
      .where('"product"."id" = :id', { id: id })
      .andWhere('"product"."status" = true')
      .andWhere('"product_variant"."deletedAt" is null')
      .leftJoinAndMapMany(
        'product.productCategories',
        ProductCategory,
        'product_category',
        'product_category.productId = product.id',
      )
      .leftJoinAndMapOne('product_category.category', Category, 'category', 'category.id = product_category.categoryId')
      .leftJoinAndMapMany(
        'product.productVariants',
        ProductVariant,
        'product_variant',
        'product.id = product_variant.productId',
      )
      .leftJoinAndMapMany('product.images', ProductImage, 'product_image', 'product.id = product_image.productId')
      .leftJoinAndMapMany(
        'product.productToppings',
        ProductTopping,
        'product_topping',
        'product.id = product_topping.productId',
      )
      .leftJoinAndMapOne('product_topping.topping', Topping, 'topping', 'product_topping.toppingId = topping.id')
      .orderBy('"product_variant".position', 'ASC')
      .cache(`product_${id}`)
      .getOne();

    if (!product) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return { data: product };
  }

  async getProducts(page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE)) {
    this.logger.debug(`Running api getProducts at ${new Date()}`);

    const productsQuery = this.productRepository.createQueryBuilder('product');
    const productsCount = await productsQuery.cache(`products_count_page${page}_limit${limit}`).getCount();
    const products = await productsQuery
      .leftJoinAndMapMany(
        'product.productCategory',
        ProductCategory,
        'product_category',
        'product_category.productId = product.id',
      )
      .leftJoinAndMapMany('product.category', Category, 'category', 'product_category.categoryId = category.id')
      .leftJoinAndMapOne(
        'product.productVariant',
        ProductVariant,
        'product_variant',
        'product.id = product_variant.productId',
      )
      .leftJoinAndMapOne(
        'product.productImage',
        ProductImage,
        'product_image',
        'product_variant.id = product_image.productVariantId and product_image.isAvatar = true',
      )
      .select(['product.id', 'product.name', 'product.price', 'product.slugs', 'category', 'product_image'])
      .where('"product_variant"."deletedAt" is null')
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`products_page${page}_limit${limit}`)
      .getMany();
    const pages = Math.ceil(Number(productsCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: productsCount,
      data: products,
    };
  }

  async checkSlugIsExist(slug: string) {
    this.logger.debug(`Running api checkSlugIsExist at ${new Date()}`);
    const productIsExist = await this.productRepository.findOne({
      where: {
        shortName: slug,
        status: true,
      },
      cache: { id: `check_slug_is_exist${slug}`, milliseconds: 30000 },
    });
    if (!productIsExist) {
      return { data: false };
    }

    return { data: true };
  }

  async createProduct(createProductInput: CreateProductInput) {
    this.logger.debug(`Running api createProduct at ${new Date()}`);
    let existSlug: any = await this.productRepository
      .createQueryBuilder('product')
      .where(`slugs::text like :slug`, { slug: `%"${createProductInput.slug}"%` })
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
      .where(`slugs::text like :slug`, { slug: `%"${createProductInput.slug}"%` })
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
        slug: createProductInput.slug,
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
        slug: createProductInput.slug,
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

    const existItemCode = await this.productVariantRepository.findOne({
      where: {
        itemCode: createProductInput.itemCode,
      },
    });
    if (existItemCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'ITEM_CODE_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    const existCategory = await this.categoryRepository.count({
      where: {
        id: In(createProductInput.categoryIds),
        isProduct: true,
        status: true,
      },
    });
    if (existCategory !== createProductInput.categoryIds.length) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let newProduct = new Product();
    let newImageProduct: ProductImage;
    const arrImageProduct = [];

    newProduct.slugs = [];
    newProduct.slugs.push(createProductInput.slug);

    if (!createProductInput.pageTitle) {
      newProduct.pageTitle = createProductInput.name + ' | Mi Dom';
    }
    if (!createProductInput.alt) {
      newProduct.alt = createProductInput.name;
    }
    newProduct.setAttributes(createProductInput);
    newProduct.tags = createProductInput.tags?.length > 0 ? createProductInput.tags.join('|') : null;
    await getManager().transaction(async transactionalEntityManager => {
      newProduct = await transactionalEntityManager.save<Product>(newProduct);
      const arrProductTopping = [];
      if (createProductInput.toppingIds?.length) {
        for (const toppingId of createProductInput.toppingIds) {
          let newProductTopping = new ProductTopping();
          newProductTopping.toppingId = toppingId;
          newProductTopping.productId = newProduct.id;
          arrProductTopping.push(newProductTopping);
        }
        await transactionalEntityManager.save<ProductTopping[]>(arrProductTopping);
      }

      const arrProductCategory = [];
      for (const categoryId of createProductInput.categoryIds) {
        let newProductCategory = new ProductCategory();
        newProductCategory.categoryId = categoryId;
        newProductCategory.productId = newProduct.id;
        arrProductCategory.push(newProductCategory);
      }
      await transactionalEntityManager.save<ProductCategory[]>(arrProductCategory);

      if (createProductInput.productPictures?.length > 0) {
        for (let i = 0; i < createProductInput.productPictures.length; i++) {
          const productPictures = createProductInput.productPictures[i];
          newImageProduct = new ProductImage();
          newImageProduct.productId = newProduct.id;
          newImageProduct.setAttributes(productPictures);
          newImageProduct.position = productPictures.position ? productPictures.position : i + 1;
          newImageProduct.isAvatar = i === 0 ? true : false;
          arrImageProduct.push(newImageProduct);
        }
      }
      await transactionalEntityManager.save<ProductImage[]>(arrImageProduct);

      let newProductVariant = new ProductVariant();
      newProductVariant.setAttributes(createProductInput);
      newProductVariant.productId = newProduct.id;
      newProductVariant = await transactionalEntityManager.save<ProductVariant>(newProductVariant);
    });
    await this.connection.queryResultCache.clear();

    return { data: newProduct };
  }

  async createManyProduct(createManyProductInput: CreateManyProductInput) {
    this.logger.debug(`Running api createManyProduct at ${new Date()}`);
    let existSlug: any = await this.productRepository
      .createQueryBuilder('product')
      .where(`slugs::text like :slug`, { slug: `%"${createManyProductInput.slug}"%` })
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
      .where(`slugs::text like :slug`, { slug: `%"${createManyProductInput.slug}"%` })
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
        slug: createManyProductInput.slug,
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
        slug: createManyProductInput.slug,
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

    const existCategory = await this.categoryRepository.count({
      where: {
        id: In(createManyProductInput.categoryIds),
        isProduct: true,
        status: true,
      },
    });
    if (existCategory !== createManyProductInput.categoryIds.length) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CATEGORY_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    for (const productVariant of createManyProductInput.productVariants) {
      const existItemCode = await this.productVariantRepository.findOne({
        where: {
          itemCode: productVariant.itemCode,
        },
      });
      if (existItemCode) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ITEM_CODE_ALREADY_EXIST',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    let newProduct: any = new Product();
    let newImageProduct: ProductImage;
    const arrImageProduct = [];

    newProduct.slugs = [];
    newProduct.slugs.push(createManyProductInput.slug);

    if (!createManyProductInput.pageTitle) {
      newProduct.pageTitle = createManyProductInput.name + ' | Mi Dom';
    }
    if (!createManyProductInput.alt) {
      newProduct.alt = createManyProductInput.name;
    }
    newProduct.setAttributes(createManyProductInput);
    newProduct.setAttributes(createManyProductInput.productVariants[0]);
    newProduct.tags = createManyProductInput.tags?.length > 0 ? createManyProductInput.tags.join('|') : null;

    await getManager().transaction(async transactionalEntityManager => {
      newProduct = await transactionalEntityManager.save<Product>(newProduct);
      const arrProductTopping = [];
      if (createManyProductInput.toppingIds?.length) {
        for (const toppingId of createManyProductInput.toppingIds) {
          let newProductTopping = new ProductTopping();
          newProductTopping.toppingId = toppingId;
          newProductTopping.productId = newProduct.id;
          arrProductTopping.push(newProductTopping);
        }
        await transactionalEntityManager.save<ProductTopping[]>(arrProductTopping);
      }

      const arrProductCategory = [];
      for (const categoryId of createManyProductInput.categoryIds) {
        let newProductCategory = new ProductCategory();
        newProductCategory.categoryId = categoryId;
        newProductCategory.productId = newProduct.id;
        arrProductCategory.push(newProductCategory);
      }
      await transactionalEntityManager.save<ProductCategory[]>(arrProductCategory);
      if (createManyProductInput.productPictures?.length > 0) {
        for (let i = 0; i < createManyProductInput.productPictures.length; i++) {
          const productPictures = createManyProductInput.productPictures[i];
          newImageProduct = new ProductImage();
          newImageProduct.productId = newProduct.id;
          newImageProduct.setAttributes(productPictures);
          newImageProduct.position = productPictures.position ? productPictures.position : i + 1;
          newImageProduct.isAvatar = i === 0 ? true : false;
          arrImageProduct.push(newImageProduct);
        }
        await transactionalEntityManager.save<ProductImage>(arrImageProduct);
      }

      for (const productVariant of createManyProductInput.productVariants) {
        let newProductVariant = new ProductVariant();
        newProductVariant.setAttributes(productVariant);
        newProductVariant.productId = newProduct.id;
        newProductVariant = await this.productVariantRepository.save<ProductVariant>(newProductVariant);
      }
    });
    await this.connection.queryResultCache.clear();
    return { data: newProduct };
  }

  async createProductVariant(createProductVariantInput: CreateProductVariantInput) {
    this.logger.debug(`Running api createProductVariant at ${new Date()}`);
    const existProduct = await this.productRepository.findOne({
      where: {
        id: createProductVariantInput.productId,
      },
    });
    if (!existProduct) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let existProductVariant: ProductVariant;
    if (createProductVariantInput.volume && createProductVariantInput.flavor) {
      existProductVariant = await this.productVariantRepository.findOne({
        where: {
          volume: createProductVariantInput.volume,
          flavor: createProductVariantInput.flavor,
          productId: createProductVariantInput.productId,
        },
      });
      if (existProductVariant) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'FLAVOR_ALREADY_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
    }
    if (createProductVariantInput.volume && !createProductVariantInput.flavor) {
      existProductVariant = await this.productVariantRepository.findOne({
        where: {
          volume: createProductVariantInput.volume,
          productId: createProductVariantInput.productId,
        },
      });
      if (existProductVariant) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'VOLUME_ALREADY_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    if (!createProductVariantInput.volume && createProductVariantInput.flavor) {
      existProductVariant = await this.productVariantRepository.findOne({
        where: {
          productId: createProductVariantInput.productId,
          flavor: createProductVariantInput.flavor,
        },
      });
      if (existProductVariant) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'FLAVOR_ALREADY_EXIST',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    if (!createProductVariantInput.volume && !createProductVariantInput.flavor) {
      existProductVariant = await this.productVariantRepository.findOne({
        where: {
          productId: createProductVariantInput.productId,
          flavor: IsNull(),
          volume: IsNull(),
        },
      });
      if (existProductVariant) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'VARIANT_REQUIRED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const existItemCode = await this.productVariantRepository.findOne({
      where: {
        itemCode: createProductVariantInput.itemCode,
      },
    });
    if (existItemCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'ITEM_CODE_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }
    let newProductVariant = new ProductVariant();
    newProductVariant.setAttributes(createProductVariantInput);
    newProductVariant = await this.productVariantRepository.save(newProductVariant);
    await this.connection.queryResultCache.clear();
    return { data: newProductVariant };
  }

  async updateProduct(id: string, updateProductInput: UpdateProductInput) {
    this.logger.debug(`Running api updateProduct at ${new Date()}`);
    const existProduct = await this.productRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existProduct) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (updateProductInput.slug && !existProduct.slugs.includes(updateProductInput.slug)) {
      let existSlug: any = await this.productRepository
        .createQueryBuilder('product')
        .where(`slugs::text like :slug`, { slug: `%"${updateProductInput.slug}"%` })
        .andWhere('"product"."id" != :id', { id: id })
        .andWhere('"deletedAt" is null')
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

      existSlug = await this.blogRepository
        .createQueryBuilder('blog')
        .where(`slugs::text like :slug`, { slug: `%"${updateProductInput.slug}"%` })
        .andWhere('"deletedAt" is null')
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
        slug: updateProductInput.slug,
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
      existSlug = await this.categoryBlogRepository.findOne({
        slug: updateProductInput.slug,
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

      if (updateProductInput.slug) existProduct.slugs.push(updateProductInput.slug);
    } else {
      if (updateProductInput.slug) {
        const index: number = existProduct.slugs.indexOf(updateProductInput.slug);
        const temp: any = existProduct.slugs[existProduct.slugs.length - 1];
        existProduct.slugs[existProduct.slugs.length - 1] = existProduct.slugs[index];
        existProduct.slugs[index] = temp;
      }
    }

    if (updateProductInput.categoryIds) {
      const countCategories = await this.categoryRepository.count({
        where: {
          id: In(updateProductInput.categoryIds),
          isProduct: true,
          status: true,
        },
      });
      if (countCategories !== updateProductInput.categoryIds.length) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'CATEGORY_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    if (updateProductInput.tags && updateProductInput.tags.length > 0) {
      existProduct.tags = updateProductInput.tags.join('|');
    }
    let removeProductCategory = [];
    const arrInsertProductCategory = [];
    if (updateProductInput.categoryIds) {
      const productCategories = await this.productCategoryRepository
        .find({
          where: {
            productId: id,
          },
        })
        .then(productCategory => productCategory.map(x => x.categoryId));
      removeProductCategory = _.difference(productCategories, updateProductInput.categoryIds);
      const addProductCategory = _.difference(updateProductInput.categoryIds, productCategories);
      if (addProductCategory.length > 0) {
        for (const productCategory of addProductCategory) {
          const existCategory = await this.categoryRepository.findOne({
            where: {
              id: productCategory,
              status: true,
              isProduct: true,
            },
          });
          if (!existCategory) {
            throw new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error: 'CATEGORY_NOT_EXIST',
              },
              HttpStatus.NOT_FOUND,
            );
          }
          const newProductCategory = new ProductCategory();
          newProductCategory.categoryId = productCategory;
          newProductCategory.productId = id;
          arrInsertProductCategory.push(newProductCategory);
        }
      }
    }

    let removeProductTopping = [];
    const arrInsertProductTopping = [];
    if (updateProductInput.toppingIds) {
      const productToppings = await this.productToppingRepository.find({
        where: {
          productId: id,
        },
      });
      const productToppingIds = productToppings.map((x: { toppingId: any }) => x.toppingId);
      removeProductTopping = _.difference(productToppingIds, updateProductInput.toppingIds);
      const addProductTopping: string[] = _.difference(updateProductInput.toppingIds, productToppingIds);
      if (addProductTopping.length > 0) {
        for (const productTopping of addProductTopping) {
          const existTopping = await this.toppingRepository.findOne({
            where: {
              id: productTopping,
            },
          });
          if (!existTopping) {
            throw new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error: 'TOPPING_NOT_EXIST',
              },
              HttpStatus.NOT_FOUND,
            );
          }
          const newProductTopping = new ProductTopping();
          newProductTopping.toppingId = productTopping;
          newProductTopping.productId = id;
          arrInsertProductTopping.push(newProductTopping);
        }
      }
    }

    existProduct.setAttributes(updateProductInput);

    await getManager().transaction(async transactionalEntityManager => {
      if (removeProductCategory.length > 0) {
        await transactionalEntityManager.update<ProductCategory>(
          ProductCategory,
          { categoryId: In(removeProductCategory), productId: id },
          { deletedAt: new Date() },
        );
      }
      await transactionalEntityManager.save<ProductCategory[]>(arrInsertProductCategory);

      if (removeProductTopping.length > 0) {
        await transactionalEntityManager.update<ProductTopping>(
          ProductTopping,
          { toppingId: In(removeProductTopping), productId: id },
          { deletedAt: new Date() },
        );
      }
      await transactionalEntityManager.save<ProductTopping[]>(arrInsertProductTopping);
      await transactionalEntityManager.save<Product>(existProduct);
    });

    await this.connection.queryResultCache.clear();
    return { data: existProduct };
  }

  async updateProductVariant(id: string, updateProductVariantInput: UpdateProductVariantInput) {
    this.logger.debug(`Running api updateProductVariant at ${new Date()}`);
    const existProductVariant = await this.productVariantRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existProductVariant) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'PRODUCT_VARIANT_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const existItemCode = await this.productVariantRepository.findOne({
      where: {
        itemCode: updateProductVariantInput.itemCode,
        id: Not(id),
      },
    });
    if (existItemCode) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'ITEM_CODE_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    existProductVariant.setAttributes(updateProductVariantInput);
    await this.productVariantRepository.save(existProductVariant);
    return { data: existProductVariant };
  }

  async deleteProduct(id: string) {
    this.logger.debug(`Running api deleteProduct at ${new Date()}`);
    const product: any = await this.productRepository
      .createQueryBuilder('product')
      .where('"product"."id" = :id', { id: id })
      .andWhere('"product_variant"."deletedAt" is null')
      .leftJoinAndMapMany(
        'product.productVariants',
        ProductVariant,
        'product_variant',
        'product.id = product_variant.productId',
      )
      .leftJoinAndMapOne(
        'product_variant.orderDetail',
        OrderDetail,
        'order_detail',
        'product_variant.id = order_detail.productVariantId',
      )
      .cache(`product_${id}`)
      .getOne();
    if (!product) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (product.productVariants) {
      for (const productVariant of product.productVariants) {
        if (productVariant.orderDetail) {
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'PRODUCT_HAVE_ORDER',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }
    }

    const productCategories = await this.productCategoryRepository.find({
      where: {
        productId: id,
      },
    });

    const productVariants = await this.productVariantRepository.find({
      where: {
        productId: id,
      },
    });

    const productToppings = await this.productToppingRepository.find({
      where: {
        productId: id,
      },
    });

    const existProductImage = await this.productImageRepository.find({
      where: {
        productId: id,
      },
    });
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.softRemove<Product>(product);
      await transactionalEntityManager.softRemove<ProductCategory[]>(productCategories);
      await transactionalEntityManager.softRemove<ProductVariant[]>(productVariants);
      await transactionalEntityManager.softRemove<ProductTopping[]>(productToppings);
      await transactionalEntityManager.softRemove<ProductImage[]>(existProductImage);
    });
    await this.connection.queryResultCache.clear();
    return { data: true };
  }

  async deleteProductVariant(id: string) {
    this.logger.debug(`Running api deleteProductVariant at ${new Date()}`);
    const existProductVariant = await this.productVariantRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existProductVariant) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_VARIANT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const orderDetail: OrderDetail = await this.orderDetailRepository.findOne({
      where: {
        productVariantId: id,
      },
    });

    if (orderDetail) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_VARIANT_NOT_ALLOW_DELETE',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.productVariantRepository.softRemove(existProductVariant);
    await this.connection.queryResultCache.clear();
    return { data: true };
  }

  async getProductBySlug(userId: string, slug: string) {
    let cacheKey = 'get_product_by_slug';
    const productQuery = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndMapMany(
        'product.productCategories',
        ProductCategory,
        'product_category',
        'product_category.productId = product.id',
      )
      .leftJoinAndMapOne('product_category.category', Category, 'category', 'category.id = product_category.categoryId')
      .leftJoinAndMapMany(
        'product.productVariants',
        ProductVariant,
        'product_variant',
        'product.id = product_variant.productId',
      )
      .leftJoinAndMapMany('product.images', ProductImage, 'product_image', 'product.id = product_image.productId')
      .leftJoinAndMapMany(
        'product.productToppings',
        ProductTopping,
        'product_topping',
        'product.id = product_topping.productId',
      )
      .leftJoinAndMapOne('product_topping.topping', Topping, 'topping', 'product_topping.toppingId = topping.id');
    // if (userId) {
    //   cacheKey += 'userId' + userId;
    //   productQuery.leftJoinAndMapOne(
    //     'product_view.favorite',
    //     ProductFavorite,
    //     'product_favorite',
    //     'product_favorite."productId"=product_view.product_id and product_favorite."deletedAt" is null and product_favorite."userId" = :userId',
    //     { userId: userId },
    //   );
    // }
    const product = await productQuery
      .where('slugs::text like :slug', { slug: `%"${slug}"%` })
      .andWhere('"product"."status" = true')
      .andWhere('(product."timePublication" <=:now or product."timePublication" is null)', { now: new Date() })
      .cache(`${cacheKey}${slug}`, 30000)
      .getOne();

    if (!product) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      data: product,
    };
  }

  async filterProduct(
    searchValue: string[],
    userId: string,
    categoryId: string,
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    let cacheKey = 'filter_product';
    const now = new Date();
    const status = true;
    const productQuery = this.productRepository
      .createQueryBuilder('product')
      .where('(product."timePublication" <=:now or product."timePublication" is null)', { now: now })
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery: any = this.productRepository
      .createQueryBuilder('product')
      .where('(product."timePublication" <=:now or product."timePublication" is null)', { now: now });

    let newSearchValue = [];
    let searchValueJoin = '';

    if (searchValue?.length > 0) {
      for (let value of searchValue) {
        value = value.replace(/  +/g, '');
        if (value) {
          newSearchValue.push(convertTv(value.trim()));
        }
      }
      searchValueJoin = `%${newSearchValue.join(' ')}%`;
      cacheKey += `searchValue${searchValueJoin}`;
      const bracket = new Brackets(qb => {
        qb.orWhere(`LOWER(convertTVkdau("name")) like '${searchValueJoin}'`);
        qb.orWhere(`LOWER(convertTVkdau("itemCode")) like '${searchValueJoin}'`);
      });
      productQuery.andWhere(bracket);
      countQuery.andWhere(bracket);
    }

    if (categoryId) {
      cacheKey += `categoryId${categoryId}`;
      const categoryQuery = this.productCategoryRepository
        .createQueryBuilder('product_category')
        .where('product_category."categoryId"=:categoryId');

      countQuery.innerJoin(
        `(${categoryQuery.getQuery()})`,
        'product_category',
        '"product_category"."product_category_productId"=product.id',
      );
      productQuery.innerJoin(
        `(${categoryQuery.getQuery()})`,
        'product_category',
        '"product_category"."product_category_productId"=product.id',
      );
    }

    let count: any = 0;
    count = await countQuery
      .setParameters({ searchValueJoin, status, categoryId, now })
      .cache(cacheKey, 30000)
      .getCount();

    const products = await this.productRepository
      .createQueryBuilder('products')
      .select('products.id')
      .addSelect('products.name')
      .addSelect('products.slugs')
      .addSelect('products.itemCode')
      .addSelect('products.price')
      .addSelect('products.inStock')
      .addSelect('products.sellOutOfStock')
      .innerJoin(`(${productQuery.getQuery()})`, 'product', '"product"."product_id"=products.id')
      .leftJoinAndMapOne(
        'products.image',
        ProductImage,
        'product_image',
        'products.id=product_image."productId" and product_image."isAvatar"=true',
      )
      .setParameters({ searchValueJoin, status, categoryId, now })
      .cache(`${cacheKey}_limit${limit}_page${page}`, 30000)
      .getMany();

    const pages = Math.ceil(Number(count) / limit);

    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: count,
      data: products,
    };
  }

  async filterProductAdmin(filterProductAdminInput: FilterProductAdminInput) {
    let cacheKey = 'filter_product_admin';
    const page = filterProductAdminInput.page || 1;
    const limit = filterProductAdminInput.limit || parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE);
    const categoryId = filterProductAdminInput.categoryId;
    const searchValue = filterProductAdminInput.searchValue;
    const status = true;
    const productQuery = this.productRepository
      .createQueryBuilder('product')
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery: any = this.productRepository.createQueryBuilder('product');

    let newSearchValue = [];
    let searchValueJoin = '';

    if (searchValue?.length > 0) {
      for (let value of searchValue) {
        value = value.replace(/  +/g, '');
        if (value) {
          newSearchValue.push(convertTv(value.trim()));
        }
      }
      searchValueJoin = `%${newSearchValue.join(' ')}%`;
      cacheKey += `searchValue${searchValueJoin}`;
      const bracket = new Brackets(qb => {
        qb.orWhere(`LOWER(convertTVkdau("name")) like '${searchValueJoin}'`);
        qb.orWhere(`LOWER(convertTVkdau("itemCode")) like '${searchValueJoin}'`);
      });
      productQuery.andWhere(bracket);
      countQuery.andWhere(bracket);
    }

    if (categoryId) {
      cacheKey += `categoryId${categoryId}`;
      const categoryQuery = this.productCategoryRepository
        .createQueryBuilder('product_category')
        .where('product_category."categoryId"=:categoryId');

      countQuery.innerJoin(
        `(${categoryQuery.getQuery()})`,
        'product_category',
        '"product_category"."product_category_productId"=product.id',
      );
      productQuery.innerJoin(
        `(${categoryQuery.getQuery()})`,
        'product_category',
        '"product_category"."product_category_productId"=product.id',
      );
    }

    let count: any = 0;
    count = await countQuery
      .setParameters({ searchValueJoin, status, categoryId })
      .cache(cacheKey, 30000)
      .getCount();

    const products = await this.productRepository
      .createQueryBuilder('products')
      .innerJoin(`(${productQuery.getQuery()})`, 'product', '"product"."product_id"=products.id')
      .leftJoinAndMapOne(
        'products.image',
        ProductImage,
        'product_image',
        'products.id=product_image."productId" and product_image."isAvatar"=true',
      )
      .innerJoinAndMapMany(
        'products.productVariants',
        ProductVariant,
        'product_variant',
        'products.id=product_variant."productId"',
      )
      .leftJoinAndMapMany(
        'products.productToppings',
        ProductTopping,
        'product_topping',
        'products.id=product_topping."productId"',
      )
      .setParameters({ searchValueJoin, status, categoryId })
      .cache(`${cacheKey}_limit${limit}_page${page}`, 30000)
      .getMany();

    const pages = Math.ceil(Number(count) / limit);

    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: count,
      data: products,
    };
  }

  parseBoolean(value: string) {
    if (value === 'true') {
      return true;
    } else {
      return false;
    }
  }

  async importProduct() {
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(`src/product/product.xlsx`);
    const sheet_name_list = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    console.log(xlData.length);
    const toppings = await this.toppingRepository.find();
    await getManager().transaction(async transactionalEntityManager => {
      for (const product of xlData) {
        let newProduct = new Product();
        newProduct.allowSelectSugar = this.parseBoolean(product.allowSelectSugar);
        newProduct.itemCode = product.itemCode;
        newProduct.name = product.name;
        newProduct.slugs = [];
        newProduct.slugs.push(changeAlias(product.slugs));
        newProduct.status = this.parseBoolean(product.status);
        newProduct.numberToppingAllow = product.numberToppingAllow ? product.numberToppingAllow : 0;
        newProduct.sellOutOfStock = this.parseBoolean(product.sellOutOfStock);
        newProduct.toppingAvailable = this.parseBoolean(product.toppingAvailable);
        newProduct.volume = product.volume ? parseInt(product.volume) : null;
        newProduct.flavor = product.flavor ? product.flavor : null;
        newProduct.inStock = product.inStock;
        newProduct.price = parseInt(product.price);
        newProduct = await transactionalEntityManager.save<Product>(newProduct);
        if (product.Image) {
          const images = product.Image.split('|');
          for (let i = 0; i < images.length; i++) {
            const newProductImage = new ProductImage();
            newProductImage.picture = images[i];
            newProductImage.position = i + 1;
            newProductImage.productId = newProduct.id;
            newProductImage.isAvatar = i === 0 ? true : false;
            await transactionalEntityManager.save<ProductImage>(newProductImage);
          }
        }
        const newProductCategory = new ProductCategory();
        newProductCategory.productId = newProduct.id;
        newProductCategory.categoryId = product.categories;
        await transactionalEntityManager.save<ProductCategory>(newProductCategory);
        for (const topping of toppings) {
          const newToppingProduct = new ProductTopping();
          newToppingProduct.productId = newProduct.id;
          newToppingProduct.toppingId = topping.id;
          await transactionalEntityManager.save<ProductTopping>(newToppingProduct);
        }
      }
    });
    return;
  }

  async importProductVariant() {
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(`src/product/product_variant.xlsx`);
    const sheet_name_list = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    console.log(xlData.length);
    const arrProductVariant = [];
    let i = 0;
    let productCode = 'SP0001';
    for (const productVariant of xlData) {
      if (productCode === productVariant.productId.trim()) {
        i++;
      } else {
        productCode = productVariant.productId;
        i = 1;
      }
      const existProduct = await this.productRepository.findOne({
        where: {
          itemCode: productVariant.productId,
        },
      });

      const newProductVariant = new ProductVariant();
      newProductVariant.productId = existProduct.id;
      newProductVariant.itemCode = productVariant.itemCode;
      newProductVariant.name = productVariant.name;
      newProductVariant.price = productVariant.price;
      newProductVariant.position = i;
      if (productVariant.volume) {
        newProductVariant.volume = parseInt(productVariant.volume.replace('ml', ''));
      }
      newProductVariant.inStock = productVariant.inStock;
      newProductVariant.flavor = productVariant.flavor;
      newProductVariant.avatar = productVariant.avatar ? productVariant.avatar : null;
      newProductVariant.unit = 'chai';
      arrProductVariant.push(newProductVariant);
    }
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(arrProductVariant);
    });
  }
}
