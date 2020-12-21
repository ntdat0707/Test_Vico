import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topping } from '../entities/topping.entity';
import { Connection, Not, Repository } from 'typeorm';
import { CreateToppingInput, UpdateToppingInput } from './topping.dto';
import { Category } from '../entities/category.entity';
import { ProductTopping } from 'src/entities/productTopping.entity';

@Injectable()
export class ToppingService {
  private readonly logger = new Logger(ToppingService.name);
  constructor(
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private connection: Connection,
  ) {}

  async getToppingById(id: string) {
    this.logger.warn(`Running api getToppingById at ${new Date()}`);
    const topping = await this.toppingRepository.findOne({
      where: {
        id: id,
      },
      cache: { id: `topping_id_${id}`, milliseconds: 30000 },
    });
    if (!topping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'TOPPING_ID_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return { data: topping };
  }

  async getToppingByProduct(id: string) {
    this.logger.warn(`Running api getToppingByProduct at ${new Date()}`);

    const topping = await this.toppingRepository
      .createQueryBuilder('topping')
      .leftJoinAndMapOne(
        'topping.productTopping',
        ProductTopping,
        'product_topping',
        'topping.id = product_topping.toppingId',
      )
      .where('product_topping.productId = :id', { id: id })
      .select('topping')
      .getMany();

    return { data: topping };
  }

  async getToppings(page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE)) {
    this.logger.warn(`Running api getToppings at ${new Date()}`);
    const toppingQuery = this.toppingRepository.createQueryBuilder('topping');
    const toppingCount = await toppingQuery.cache(`topping_count_page${page}_limit${limit}`).getCount();
    const topping = await toppingQuery
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`topping_page${page}_limit${limit}`)
      .getMany();
    const pages = Math.ceil(Number(toppingCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: toppingCount,
      data: topping,
    };
  }

  async createTopping(toppingPicture: any, createToppingInput: CreateToppingInput) {
    this.logger.warn(`Running api createTopping at ${new Date()}`);
    const existTopping = await this.toppingRepository.findOne({
      where: {
        name: createToppingInput.name,
      },
    });
    if (existTopping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'TOPPING_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    const existCategory = await this.categoryRepository.findOne({
      where: {
        id: createToppingInput.categoryId,
        isProduct: false,
        status: true,
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

    if (existCategory.isProduct) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CATEGORY_IS_OF_PRODUCT',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let newTopping = new Topping();
    newTopping.setAttributes(createToppingInput);

    if (toppingPicture) {
      newTopping.picture = toppingPicture.filename;
    }
    await this.connection.queryResultCache.clear();
    newTopping = await this.toppingRepository.save(newTopping);
    return { data: newTopping };
  }

  async updateTopping(id: string, toppingPicture: any, updateToppingInput: UpdateToppingInput) {
    this.logger.warn(`Running api updateTopping at ${new Date()}`);
    const existTopping = await this.toppingRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existTopping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'TOPPING_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const existNameTopping = await this.toppingRepository.findOne({
      where: {
        name: updateToppingInput.name,
        id: Not(id),
      },
    });
    if (existNameTopping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'NAME_ALREADY_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (existTopping.categoryId !== updateToppingInput.categoryId) {
      const existCategory = await this.categoryRepository.findOne({
        where: {
          id: updateToppingInput.categoryId,
          isProduct: false,
          status: true,
        },
      });
      if (!existCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'CATEGORY_ID_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    existTopping.setAttributes(updateToppingInput);
    if (toppingPicture) {
      existTopping.picture = toppingPicture.filename;
    }

    await this.toppingRepository.save(existTopping);
    return { data: 'success' };
  }

  async deleteTopping(id: string) {
    this.logger.warn(`Running api deleteTopping at ${new Date()}`);
    const existTopping = await this.toppingRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existTopping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'TOPPING_ID_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.toppingRepository.softRemove(existTopping);
    return { data: 'success' };
  }
}
