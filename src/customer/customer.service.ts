import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Brackets, Connection, getManager, IsNull, Repository } from 'typeorm';
import { convertTv } from '../lib/utils';
import { UpdateCustomerInput } from './customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
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
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE, 10),
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
        qb.where(`"customer"."phoneNumber" like '${searchValueConvert}'`)
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

    await this.connection.queryResultCache.clear();
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save<Customer>(existCustomer);
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
}
