import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Shipping } from '../entities/shipping.entity';
import { Connection, getManager, Repository } from 'typeorm';
import { CreateShippingInput, UpdateShippingInput } from './shipping.dto';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  constructor(
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
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
          message: 'CANNOT_CREATE_SHIPPING',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    let newShipping = new Shipping();
    newShipping.setAttributes(createShippingInput);
    newShipping.customerId = customerId;

    const existShippingDefaultId = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });

    await getManager().transaction(async transactionalEntityManager => {
      newShipping = await transactionalEntityManager.save<Shipping>(newShipping);
      if (existShippingDefaultId.shippingDefaultId === null) {
        existShippingDefaultId.shippingDefaultId = newShipping.id;
        await transactionalEntityManager.save<Customer>(existShippingDefaultId);
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

    existShipping.setAttributes(updateShippingInput);
    await this.shippingRepository.save(existShipping);
    return { data: existShipping };
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
    await this.shippingRepository.softRemove(existShipping);
    return { data: 'success' };
  }
}
