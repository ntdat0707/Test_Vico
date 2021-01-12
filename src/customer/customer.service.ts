import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Brackets, Connection, getManager, In, IsNull, Repository } from 'typeorm';
import { convertTv } from '../lib/utils';
import { ActiveCustomerInput, AddProductInCartInput, CreateCustomerInput, UpdateCustomerInput } from './customer.dto';
import { Shipping } from '../entities/shipping.entity';
import { ProductVariant } from '../product/product.dto';
import { Product } from '../entities/product.entity';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Shipping) private shippingRepository: Repository<Shipping>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(ProductVariant) private productVariantRepository: Repository<ProductVariant>,
    private connection: Connection,
  ) {}
  async updateCustomerAvatar(customerId: string, avatar: any) {
    if (!avatar) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'AVATAR_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existCustomer: Customer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });
    existCustomer.avatar = avatar.filename;
    await this.customerRepository.save(existCustomer);
    await this.connection.queryResultCache.clear();
    return {
      data: existCustomer,
    };
  }

  async filterCustomer(
    searchValue: string,
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    let cacheKey = 'search_customer';

    const customerQuery = this.connection
      .createQueryBuilder(Customer, 'customer')
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery = this.connection.createQueryBuilder(Customer, 'customer');

    let searchValueConvert = '';
    if (searchValue) {
      searchValueConvert = `%${convertTv(searchValue)}%`;
      cacheKey += '_searchValue' + searchValue;
      const bracket = new Brackets(qb => {
        qb.where(`"customer"."phone" like '${searchValueConvert}'`)
          .orWhere(`LOWER(convertTVkdau("customer"."fullName")) like '${searchValueConvert}'`)
          .orWhere(`"customer"."email" like '%${searchValue}%'`)
          .orWhere(`LOWER("customer"."code") like '%${searchValue}%'`);
      });
      customerQuery.where(bracket);
      countQuery.where(bracket);
    }
    const customerCount = await countQuery.cache(`${cacheKey}_count_page${page}_limit${limit}`).getCount();

    const pages = Math.ceil(Number(customerCount) / limit);
    const customers = await customerQuery.cache(`${cacheKey}_page${page}_limit${limit}`).getMany();

    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: customerCount,
      data: customers,
    };
  }

  async updateCustomer(customerId: string, updateCustomerInput: UpdateCustomerInput) {
    let existCustomer: Customer;
    if (updateCustomerInput.phoneNumber) {
      existCustomer = await this.customerRepository.findOne({
        where: {
          phoneNumber: updateCustomerInput.phoneNumber,
          deletedAt: IsNull(),
        },
      });

      if (existCustomer && existCustomer.id !== customerId) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'PHONE_EXISTED',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    existCustomer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });

    existCustomer.setAttributes(updateCustomerInput);
    await this.customerRepository.save(existCustomer);
    await this.connection.queryResultCache.clear();
    return {
      data: existCustomer,
    };
  }

  async deleteCustomer(id: string) {
    const existCustomer: Customer = await this.customerRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CUSTOMER_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const deletedAt: Date = new Date();
    existCustomer.deletedAt = deletedAt;

    const shippings: Shipping[] = await this.shippingRepository.find({
      where: {
        customerId: existCustomer.id,
      },
    });
    const arrCustomerShipping = [];
    for (const shipping of shippings) {
      shipping.deletedAt = deletedAt;
      arrCustomerShipping.push(shipping);
    }

    await this.connection.queryResultCache.clear();
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save<Customer>(existCustomer);
      await transactionalEntityManager.save<Shipping>(arrCustomerShipping);
    });

    return {
      data: { status: true },
    };
  }

  async checkEmailExist(email: string) {
    const existCustomer: Customer = await this.customerRepository.findOne({
      where: {
        email: email,
        deletedAt: IsNull(),
      },
    });

    if (existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'EMAIL_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }
    return true;
  }

  async checkPhoneExist(phone: string) {
    const existCustomer: Customer = await this.customerRepository.findOne({
      where: {
        phoneNumber: phone,
        deletedAt: IsNull(),
      },
    });

    if (existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'PHONE_NUMBER_EXISTED',
        },
        HttpStatus.CONFLICT,
      );
    }
    return true;
  }

  async addProductInCart(customerId: string, addProductInCartInput: AddProductInCartInput) {
    const existProductVariant = await this.productVariantRepository
      .createQueryBuilder('product_variant')
      .leftJoinAndMapOne('product_variant.product', Product, 'product', '"product_variant"."productId"=product.id')
      .where('product_variant.id=:id', { id: addProductInCartInput.productVariantId })
      .andWhere('("product"."timePublication" <=:now or "product"."timePublication" is null)', { now: new Date() })
      .getOne();

    if (!existProductVariant) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'PRODUCT_VARIANT_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const newCart = new Cart();
    newCart.customerId = customerId;
    newCart.productVariantId = addProductInCartInput.productVariantId;
    await this.cartRepository.save(newCart);
    return {
      data: true,
    };
  }

  async createCustomer(createCustomerInput: CreateCustomerInput) {
    let existCustomer: Customer;
    if (createCustomerInput.email) {
      existCustomer = await this.customerRepository.findOne({
        where: {
          email: createCustomerInput.email,
        },
      });

      if (existCustomer) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'EMAIL_EXISTED',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    if (!createCustomerInput.phoneNumber) {
      existCustomer = await this.customerRepository.findOne({
        where: {
          phoneNumber: createCustomerInput.phoneNumber,
        },
      });

      if (existCustomer) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'PHONE_EXISTED',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    let newCustomer = new Customer();
    newCustomer.setAttributes(createCustomerInput);
    newCustomer.isActive = false;
    newCustomer.acceptEmailMkt = true;
    let customerCode = '';
    while (true) {
      const random =
        Math.random()
          .toString(36)
          .substring(2, 4) +
        Math.random()
          .toString(36)
          .substring(2, 8);
      const randomCode = random.toUpperCase();
      customerCode = randomCode;
      const existCode = await this.customerRepository.findOne({
        where: {
          code: customerCode,
        },
      });
      if (!existCode) {
        break;
      }
    }
    newCustomer.code = customerCode;
    await this.connection.queryResultCache.clear();
    newCustomer = await this.customerRepository.save(newCustomer);

    return {
      data: newCustomer,
    };
  }

  async activeCustomer(activeCustomerInput: ActiveCustomerInput) {
    const existCustomer = await this.customerRepository.findOne({
      where: {
        id: activeCustomerInput.customerId,
      },
    });

    if (!existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CUSTOMER_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existCustomer.isActive) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CUSTOMER_ACTIVATED',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    existCustomer.isActive = true;

    return {
      data: existCustomer,
    };
  }
}
