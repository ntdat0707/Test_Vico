import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Shipping } from '../entities/shipping.entity';
import { Connection, getManager, Repository } from 'typeorm';
import { CreateShippingInput, UpdateShippingInput } from './shipping.dto';
import { Province } from '../entities/province.entity';
import { District } from '../entities/district.entity';
import { Ward } from '../entities/ward.entity';
@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  constructor(
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private wardRepository: Repository<Ward>,
    private connection: Connection,
  ) {}

  async getShippingById(customerId: string, id: string) {
    this.logger.debug(`Running api getShippingById at ${new Date()}`);
    const existShipping = await this.shippingRepository.findOne({
      where: {
        id: id,
        customerId: customerId,
        status: true,
      },
    });
    if (!existShipping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SHIPPING_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return { data: existShipping };
  }

  async getShippingByCustomerId(customerId: string) {
    this.logger.debug(`Running api getShippingByCustomerId at ${new Date()}`);
    const existShipping = await this.shippingRepository.find({
      where: {
        customerId: customerId,
        status: true,
      },
    });
    return { data: existShipping };
  }

  async createShipping(customerId: string, createShippingInput: CreateShippingInput) {
    this.logger.debug(`Running api createShipping at ${new Date()}`);

    const countShipping = await this.shippingRepository.count({
      where: {
        customerId: customerId,
      },
    });
    if (countShipping >= 30) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'CUSTOMER_LIMITED_SHIPPING_ADDRESS',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    let newShipping = new Shipping();
    newShipping.setAttributes(createShippingInput);
    newShipping.customerId = customerId;

    const existCustomer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });

    await getManager().transaction(async transactionalEntityManager => {
      newShipping = await transactionalEntityManager.save<Shipping>(newShipping);
      if (!existCustomer.shippingDefaultId) {
        existCustomer.shippingDefaultId = newShipping.id;
        await transactionalEntityManager.save<Customer>(existCustomer);
      } else if (createShippingInput.isDefault) {
        existCustomer.shippingDefaultId = newShipping.id;
        await transactionalEntityManager.save<Customer>(existCustomer);
      }
    });

    return { data: newShipping };
  }

  async updateShipping(customerId: string, id: string, updateShippingInput: UpdateShippingInput) {
    this.logger.debug(`Running api updateShipping at ${new Date()}`);

    const existShipping = await this.shippingRepository.findOne({
      where: {
        id: id,
        customerId: customerId,
        status: true,
      },
    });
    if (!existShipping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SHIPPING_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const wardId = updateShippingInput.wardId;
    const districtId = updateShippingInput.districtId;
    const provinceId = updateShippingInput.provinceId;

    if (wardId && provinceId && districtId) {
      if (!Number.isInteger(provinceId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PROVINCE_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(districtId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'DISTRICT_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!Number.isInteger(wardId)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'WARD_ID_NOT_VALID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const provinceQuery = this.provinceRepository
        .createQueryBuilder('province')
        .where('"deletedAt" is null')
        .andWhere('id=:provinceId');
      const districtQuery = this.districtRepository
        .createQueryBuilder('district')
        .where('"deletedAt" is null')
        .andWhere('id=:districtId');
      const wardQuery = this.wardRepository
        .createQueryBuilder('ward')
        .where('"deletedAt" is null')
        .andWhere('id=:wardId');
      const rawLocations = await this.connection
        .createQueryBuilder()
        .addSelect('*')
        .addFrom(`(${provinceQuery.getQuery()})`, 'province')
        .leftJoin(
          `(${districtQuery.getQuery()})`,
          'district',
          '"district"."district_provinceId"=province."province_id"',
        )
        .leftJoin(`(${wardQuery.getQuery()})`, 'ward', '"ward"."ward_districtId"=district."district_id"')
        .setParameters({
          provinceId: updateShippingInput.provinceId,
          districtId: updateShippingInput.districtId,
          wardId: updateShippingInput.wardId,
        })
        .getRawOne();

      if (!rawLocations || !rawLocations.province_id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'PROVINCE_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!rawLocations.district_id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'DISTRICT_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (!rawLocations.ward_id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'WARD_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }
    let shippingAddress = null;
    await getManager().transaction(async transactionalEntityManager => {
      if (updateShippingInput.isDefault) {
        const customer = await this.customerRepository.findOne({
          where: {
            id: customerId,
          },
        });

        if (customer.shippingDefaultId !== id) {
          customer.shippingDefaultId = id;
          await transactionalEntityManager.save<Customer>(customer);
        }
      }
      if (!existShipping.isHaveOrder) {
        existShipping.setAttributes(updateShippingInput);
        shippingAddress = await transactionalEntityManager.save<Shipping>(existShipping);
      } else {
        const newShipping = new Shipping();
        newShipping.setAttributes(updateShippingInput);
        newShipping.customerId = customerId;
        existShipping.status = false;
        shippingAddress = await transactionalEntityManager.save<Shipping>(newShipping);
        await transactionalEntityManager.save<Shipping>(existShipping);
      }
    });

    return { data: shippingAddress };
  }

  async setShippingDefault(customerId: string, id: string) {
    this.logger.debug(`Running api setShippingDefault at ${new Date()}`);

    const existShipping = await this.shippingRepository.findOne({
      where: {
        id: id,
        customerId: customerId,
        status: true,
      },
    });
    if (!existShipping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SHIPPING_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.customerRepository.update({ id: customerId }, { shippingDefaultId: id });
    return { data: existShipping };
  }

  async deleteShipping(customerId: string, id: string) {
    this.logger.debug(`Running api deleteShipping at ${new Date()}`);

    const existShipping = await this.shippingRepository.findOne({
      where: {
        id: id,
        customerId: customerId,
        status: true,
      },
    });
    if (!existShipping) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SHIPPING_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const customer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });

    if (customer.shippingDefaultId === id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SHIPPING_DEFAULT_CANNOT_DELETE',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.shippingRepository.softRemove(existShipping);
    return { data: true };
  }
}
