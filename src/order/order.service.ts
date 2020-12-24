import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { District } from '../entities/district.entity';
import { Province } from '../entities/province.entity';
import { Shipping } from '../entities/shipping.entity';
import { Ward } from '../entities/ward.entity';
import { Between, Connection, getManager, In, IsNull, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderInput, OrderFilterInput, UpdateOrderInput } from './order.dto';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/productVariant.entity';
import { Topping } from '../entities/topping.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { OrderDetailTopping } from '../entities/orderDetailTopping.entity';
import { Customer } from '../entities/customer.entity';
import { ProductImage } from '../entities/productImage.entity';
import { mapDataOrder } from '../lib/mapData/mapDataOrder';
import { convertTv } from 'src/lib/utils';
import { ProductTopping } from 'src/entities/productTopping.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(Order.name);
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(OrderDetailTopping)
    private orderDetailToppingRepository: Repository<OrderDetailTopping>,
    @InjectRepository(Shipping)
    private shippingRepository: Repository<Shipping>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductTopping)
    private productToppingRepository: Repository<ProductTopping>,
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private connection: Connection,
  ) {}

  async getOrders(page = 1, limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE)) {
    this.logger.warn(`Running api getOrders at ${new Date()}`);
    const ordersQuery = this.orderRepository
      .createQueryBuilder('order')
      .orderBy('"order"."createdAt"', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    const ordersCount = await ordersQuery.cache(`orders_count_page${page}_limit${limit}`).getCount();
    const orders = await ordersQuery.cache(`orders_page${page}_limit${limit}`).getMany();
    const pages = Math.ceil(Number(ordersCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: ordersCount,
      data: orders,
    };
  }

  async getOrdersByCustomer(
    customerId: string,
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
  ) {
    this.logger.warn(`Running api getOrdersByCustomer at ${new Date()}`);
    const ordersQuery = this.orderRepository
      .createQueryBuilder('order')
      .where('"order"."customerId" = :customerId', { customerId: customerId })
      .orderBy('"order"."createdAt"', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);
    const ordersCount = await ordersQuery
      .cache(`orders_by_customer_count_customerId${customerId}_page${page}_limit${limit}`)
      .getCount();
    const orders = await ordersQuery
      .cache(`orders_by_customer_customerId${customerId}_page${page}_limit${limit}`)
      .getMany();
    const pages = Math.ceil(Number(ordersCount) / limit);
    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: ordersCount,
      data: orders,
    };
  }

  async getOrder(id: string) {
    this.logger.warn(`Running api getOrder at ${new Date()}`);
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndMapOne('order.customer', Customer, 'customer', 'order.customerId = customer.id')
      .leftJoinAndMapOne('order.shipping', Shipping, 'shipping', 'order.shippingId = shipping.id')
      .leftJoinAndMapMany('order.orderDetail', OrderDetail, 'order_detail', 'order.id = order_detail.orderId')
      .leftJoinAndMapOne(
        'order_detail.orderDetailTopping',
        OrderDetailTopping,
        'order_detail_topping',
        'order_detail.id = order_detail_topping.orderDetailId',
      )
      .leftJoinAndMapOne(
        'order_detail.productVariant',
        ProductVariant,
        'product_variant',
        'order_detail.productVariantId = product_variant.id',
      )
      .leftJoinAndMapOne('order_detail.topping', Topping, 'topping', 'order_detail.toppingId = topping.id')
      .leftJoinAndMapMany(
        'product_variant.image',
        ProductImage,
        'product_image',
        'product_image.productVariantId = product_variant.id',
      )
      .where('"order"."id" = :id', { id: id })
      .andWhere('"product_variant"."deletedAt" is null')
      .cache(`order_${id}`)
      .select([
        'order',
        'customer.id',
        'customer.email',
        'customer.fullName',
        'customer.shippingDefaultId',
        'customer.avatar',
        'shipping',
        'order_detail',
        'order_detail_topping',
        'product_variant',
        'topping',
        'product_image',
      ])
      .getOne();

    if (!order) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ORDER_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return { data: order };
  }

  async getOrderByOrderCode(orderCode: string) {
    this.logger.warn(`Running api getOrder at ${new Date()}`);
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndMapOne('order.customer', Customer, 'customer', 'order.customerId = customer.id')
      .leftJoinAndMapOne('order.shipping', Shipping, 'shipping', 'order.shippingId = shipping.id')
      .leftJoinAndMapMany('order.orderDetail', OrderDetail, 'order_detail', 'order.id = order_detail.orderId')
      .leftJoinAndMapOne(
        'order_detail.orderDetailTopping',
        OrderDetailTopping,
        'order_detail_topping',
        'order_detail.id = order_detail_topping.orderDetailId',
      )
      .leftJoinAndMapOne(
        'order_detail.productVariant',
        ProductVariant,
        'product_variant',
        'order_detail.productVariantId = product_variant.id',
      )
      .leftJoinAndMapOne('order_detail.topping', Topping, 'topping', 'order_detail.toppingId = topping.id')
      .leftJoinAndMapMany(
        'product_variant.image',
        ProductImage,
        'product_image',
        'product_image.productVariantId = product_variant.id',
      )
      .where('"order"."orderCode" = :orderCode', { orderCode: orderCode })
      .andWhere('"product_variant"."deletedAt" is null')
      .cache(`order_orderCode_${orderCode}`)
      .select([
        'order',
        'customer.id',
        'customer.email',
        'customer.fullName',
        'customer.shippingDefaultId',
        'customer.avatar',
        'shipping',
        'order_detail',
        'order_detail_topping',
        'product_variant',
        'topping',
        'product_image',
      ])
      .getOne();

    if (!order) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ORDER_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return { data: order };
  }

  async createOrder(customerId: string, createOrderInput: CreateOrderInput) {
    this.logger.warn(`Running api getToppingById at ${new Date()}`);
    const currentDate = moment()
      .format('YY:MM:DD')
      .replace(/:/g, '');
    const beforeTime = moment().startOf('day'); // set to 12:00 am today
    const afterTime = moment().endOf('day');
    const count = await this.orderRepository.count({
      where: {
        createdAt: Between(beforeTime, afterTime),
      },
    });

    const orderNumber = ('0000' + (count + 1)).slice(-4);
    const orderCode = currentDate + orderNumber;

    const existShipping = await this.shippingRepository
      .createQueryBuilder('shipping')
      .leftJoinAndMapOne('shipping.province', Province, 'province', '"shipping"."provinceId"=province.id')
      .leftJoinAndMapOne('shipping.district', District, 'district', '"shipping"."districtId"=district.id')
      .leftJoinAndMapOne('shipping.ward', Ward, 'ward', '"shipping"."wardId"=ward.id')
      .where('shipping.id=:id', { id: createOrderInput.shippingId })
      .getOne();

    if (!existShipping || existShipping.customerId !== customerId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SHIPPING_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let existProductVariant: ProductVariant;
    const arrUpdateStockProductVariant = [];
    const arrUpdateStockTopping = [];
    let totalQuantity = 0;
    let totalPrice = 0;
    let totalDiscount = 0;
    let isInArrUpdate: boolean;

    if (createOrderInput.orderDetails?.length > 0) {
      for (let i = 0; i < createOrderInput.orderDetails.length; i++) {
        existProductVariant = await this.productVariantRepository.findOne({
          where: {
            id: createOrderInput.orderDetails[i].id,
          },
        });
        if (!existProductVariant) {
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'PRODUCT_VARIANT_NOT_EXIST',
            },
            HttpStatus.NOT_FOUND,
          );
        }

        const product = await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndMapOne(
            'product.productVariant',
            ProductVariant,
            'product_variant',
            'product.id = product_variant.productId',
          )
          .where('"product_variant"."id" = :productVariantId', { productVariantId: existProductVariant.id })
          .andWhere('"product_variant"."deletedAt" is null')
          .getOne();

        if (product.toppingAvailable === false && createOrderInput.orderDetails[i].toppings?.length > 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CANNOT_ORDER_TOPPING',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (product.numberToppingAllow > 0) {
          let totalTopping = 0;
          for (let j = 0; j < createOrderInput.orderDetails[i].toppings?.length; j++) {
            const existProductTopping = await this.productToppingRepository.findOne({
              productId: product.id,
              toppingId: createOrderInput.orderDetails[i].toppings[j].id,
            });
            if (!existProductTopping) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'CANNOT_ORDER_TOPPING',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            totalTopping += createOrderInput.orderDetails[i].toppings[j].quantity;
          }
          if (totalTopping > product.numberToppingAllow) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOO_MUCH_TOPPING',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        if (existProductVariant.inStock === 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: 'PRODUCT_VARIANT_OUT_OF_STOCK',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        if (createOrderInput.orderDetails[i].price !== existProductVariant.price) {
          throw new HttpException(
            {
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: 'PRICE_INCORRECT',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        const existProduct = await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndMapOne(
            'product.productVariant',
            ProductVariant,
            'product_variant',
            'product.id = product_variant.productId',
          )
          .where('product_variant.id = :id', { id: existProductVariant.id })
          .andWhere('"product_variant"."deletedAt" is null')
          .getOne();

        if (existProduct.toppingAvailable === false && createOrderInput.orderDetails[i].toppings?.length > 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CANNOT_ORDER_TOPPING',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        if (createOrderInput.orderDetails[i].toppings?.length > 0) {
          for (let j = 0; j < createOrderInput.orderDetails[i].toppings.length; j++) {
            const existTopping = await this.toppingRepository.findOne({
              where: {
                id: createOrderInput.orderDetails[i].toppings[j].id,
                categoryId: createOrderInput.orderDetails[i].toppings[j].categoryId,
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

            if (existTopping.price !== createOrderInput.orderDetails[i].toppings[j].price) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'TOPPING_PRICE_INVALID',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            totalPrice =
              totalPrice +
              createOrderInput.orderDetails[i].toppings[j].price *
                createOrderInput.orderDetails[i].toppings[j].quantity *
                createOrderInput.orderDetails[i].quantity;

            isInArrUpdate = false;
            for (let k = 0; k < arrUpdateStockTopping.length; k++) {
              if (arrUpdateStockTopping[k].id === existTopping.id) {
                arrUpdateStockTopping[k].inStock -=
                  createOrderInput.orderDetails[i].toppings[i].quantity * createOrderInput.orderDetails[i].quantity;
                if (arrUpdateStockTopping[k].inStock < 0) {
                  throw new HttpException(
                    {
                      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                      message: 'TOPPING_OUT_OF_STOCK',
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY,
                  );
                }
                isInArrUpdate = true;
                break;
              }
            }
            if (isInArrUpdate === false) {
              existTopping.inStock -=
                createOrderInput.orderDetails[i].toppings[i].quantity * createOrderInput.orderDetails[i].quantity;
              if (existTopping.inStock < 0) {
                throw new HttpException(
                  {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'TOPPING_OUT_OF_STOCK',
                  },
                  HttpStatus.BAD_REQUEST,
                );
              }
              arrUpdateStockTopping.push(existTopping);
            }
          }
        }

        totalQuantity += createOrderInput.orderDetails[i].quantity;
        totalPrice += createOrderInput.orderDetails[i].price * createOrderInput.orderDetails[i].quantity;
        isInArrUpdate = false;
        for (let j = 0; j < arrUpdateStockProductVariant.length; j++) {
          if (arrUpdateStockProductVariant[j].id === existProductVariant.id) {
            arrUpdateStockProductVariant[j].inStock -= createOrderInput.orderDetails[i].quantity;
            if (arrUpdateStockProductVariant[j].inStock < 0) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                  message: 'PRODUCT_VARIANT_OUT_OF_STOCK',
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
              );
            }
            isInArrUpdate = true;
            break;
          }
        }
        if (isInArrUpdate === false) {
          existProductVariant.inStock -= createOrderInput.orderDetails[i].quantity;
          if (existProductVariant.inStock < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                message: 'PRODUCT_VARIANT_OUT_OF_STOCK',
              },
              HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
          arrUpdateStockProductVariant.push(existProductVariant);
        }
      }
    }

    if (createOrderInput.toppings?.length > 0) {
      for (let i = 0; i < createOrderInput.toppings.length; i++) {
        const existTopping = await this.toppingRepository.findOne({
          where: {
            id: createOrderInput.toppings[i].id,
            categoryId: createOrderInput.toppings[i].categoryId,
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

        if (existTopping.inStock === 0) {
          throw new HttpException(
            {
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: 'TOPPING_OUT_OF_STOCK',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        if (createOrderInput.toppings[i].price !== existTopping.price) {
          throw new HttpException(
            {
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: 'PRICE_INCORRECT',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        totalQuantity = totalQuantity + createOrderInput.toppings[i].quantity;
        totalPrice = totalPrice + createOrderInput.toppings[i].price * createOrderInput.toppings[i].quantity;
        isInArrUpdate = false;
        for (let j = 0; j < arrUpdateStockTopping.length; j++) {
          if (arrUpdateStockTopping[j].id === existTopping.id) {
            arrUpdateStockTopping[j].inStock -= createOrderInput.toppings[i].quantity;
            if (arrUpdateStockTopping[j].inStock < 0) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                  message: 'TOPPING_OUT_OF_STOCK',
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
              );
            }
            isInArrUpdate = true;
            break;
          }
        }
        if (isInArrUpdate === false) {
          existTopping.inStock = existTopping.inStock - createOrderInput.toppings[i].quantity;
          if (existTopping.inStock < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                message: 'TOPPING_OUT_OF_STOCK',
              },
              HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
          arrUpdateStockTopping.push(existTopping);
        }
      }
    }
    if (totalPrice - totalDiscount !== createOrderInput.orderAmount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'ORDER_AMOUNT_WRONG',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (totalDiscount !== createOrderInput.totalDiscount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'TOTAL_DISCOUNT_WRONG',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (totalQuantity !== createOrderInput.orderQuantity) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'ORDER_QUANTITY_WRONG',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    let newOrder = new Order();
    let newOrderDetail: OrderDetail;
    let newOrderDetailTopping: OrderDetailTopping;
    const arrOrderDetail = [];
    const arrOrderDetailTopping = [];
    existShipping.isHaveOrder = true;
    await getManager().transaction(async transactionalEntityManager => {
      newOrder.setAttributes(createOrderInput);
      newOrder.customerId = customerId;
      newOrder.orderCode = orderCode;
      newOrder = await transactionalEntityManager.save<Order>(newOrder);
      if (createOrderInput.orderDetails?.length > 0) {
        for (let i = 0; i < createOrderInput.orderDetails.length; i++) {
          newOrderDetail = new OrderDetail();
          newOrderDetail.setAttributes(createOrderInput.orderDetails[i]);
          newOrderDetail.orderId = newOrder.id;
          newOrderDetail = await transactionalEntityManager.save<OrderDetail>(newOrderDetail);
          for (let j = 0; j < createOrderInput.orderDetails[i].toppings?.length; j++) {
            newOrderDetailTopping = new OrderDetailTopping();
            newOrderDetailTopping.toppingId = createOrderInput.orderDetails[i].toppings[j].id;
            newOrderDetailTopping.quantity =
              createOrderInput.orderDetails[i].toppings[j].quantity * createOrderInput.orderDetails[i].quantity;
            newOrderDetailTopping.unitPrice = createOrderInput.orderDetails[i].toppings[j].price;
            newOrderDetailTopping.orderDetailId = newOrderDetail.id;
            arrOrderDetailTopping.push(newOrderDetailTopping);
          }
        }
      }

      if (createOrderInput.toppings?.length > 0) {
        for (let i = 0; i < createOrderInput.toppings.length; i++) {
          newOrderDetail = new OrderDetail();
          newOrderDetail.toppingId = createOrderInput.toppings[i].id;
          newOrderDetail.quantity = createOrderInput.toppings[i].quantity;
          newOrderDetail.unitPrice = createOrderInput.toppings[i].price;
          newOrderDetail.orderId = newOrder.id;
          arrOrderDetail.push(newOrderDetail);
        }
      }

      await transactionalEntityManager.save<OrderDetail[]>(arrOrderDetail);
      await transactionalEntityManager.save<OrderDetailTopping[]>(arrOrderDetailTopping);
      await transactionalEntityManager.save<ProductVariant[]>(arrUpdateStockProductVariant);
      await transactionalEntityManager.save<Topping[]>(arrUpdateStockTopping);
      await transactionalEntityManager.save<Shipping>(existShipping);
    });

    return { data: newOrder };
  }

  async orderFilter(orderFilterInput: OrderFilterInput) {
    const page = orderFilterInput.page || 1;
    const limit = orderFilterInput.limit || parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE);
    let cacheKey = 'filter_order';
    let searchValue = '';
    const minOrderAmount = orderFilterInput.minOrderAmount;
    const maxOrderAmount = orderFilterInput.maxOrderAmount;
    let createdAtTo: any = orderFilterInput.createdAtTo;
    let createdAtFrom: any = orderFilterInput.createdAtFrom;
    const status = orderFilterInput.status;
    const customerId = orderFilterInput.customerId;

    const customerQuery = this.customerRepository.createQueryBuilder('customer');
    const orderQuery = this.orderRepository.createQueryBuilder('order');

    if (customerId) {
      cacheKey += 'customerId' + customerId;
      customerQuery.andWhere('"id" = :customerId');
    }

    if (minOrderAmount) {
      cacheKey += 'minOrderAmount' + minOrderAmount;
      orderQuery.andWhere('"orderAmount" >=:minOrderAmount');
    }
    if (maxOrderAmount) {
      cacheKey += 'maxOrderAmount' + maxOrderAmount;
      orderQuery.andWhere('"orderAmount" <=:maxOrderAmount');
    }
    if (createdAtTo) {
      cacheKey += 'createdAtTo' + createdAtTo;
      orderQuery.andWhere('"createdAt" <=:createdAtTo');
    } else {
      createdAtTo = moment().format('YYYY-MM-DD 23:59:59');
      cacheKey += 'createdAtTo' + createdAtTo;
      orderQuery.andWhere('"createdAt" <=:createdAtTo');
    }
    if (createdAtFrom) {
      cacheKey += 'createdAtFrom' + createdAtFrom;
      orderQuery.andWhere('"createdAt" >=:createdAtFrom');
    } else {
      createdAtFrom = moment()
        .subtract(7, 'days')
        .format('YYYY-MM-DD 00:00:00');
      cacheKey += 'createdAtFrom' + createdAtFrom;
      orderQuery.andWhere('"createdAt" >=:createdAtFrom');
    }

    if (status && status.length > 0) {
      cacheKey += 'status' + status.join(',');
      orderQuery.andWhere('"status" IN (:...status)');
    }

    if (orderFilterInput.searchValue) {
      searchValue = `%${convertTv(orderFilterInput.searchValue)}%`;
      cacheKey += 'searchValue' + searchValue;
    }

    const countQuery: any = this.connection
      .createQueryBuilder()
      .addSelect('count("order"."order_id")')
      .addFrom(`(${orderQuery.getQuery()})`, 'order')
      .innerJoin(`(${customerQuery.getQuery()})`, 'customer', '"order"."order_customerId"="customer"."customer_id"')
      .setParameters({
        minOrderAmount,
        maxOrderAmount,
        createdAtTo,
        createdAtFrom,
        status,
        customerId,
      })
      .cache(cacheKey);

    const dataQuery = this.connection
      .createQueryBuilder()
      .addSelect('*')
      .addFrom(`(${orderQuery.getQuery()})`, 'order')
      .innerJoin(`(${customerQuery.getQuery()})`, 'customer', '"order"."order_customerId"="customer"."customer_id"')
      .orderBy('"order"."order_createdAt"', 'DESC')
      .setParameters({
        minOrderAmount,
        maxOrderAmount,
        createdAtTo,
        createdAtFrom,
        status,
        customerId,
      })
      .limit(limit)
      .offset((page - 1) * limit)
      .cache(`${cacheKey}_limit${limit}_page${page}`, 30000);

    if (searchValue) {
      countQuery
        .where(`"customer_phone" like '${searchValue}'`)
        .orWhere(`LOWER(convertTVkdau("customer_fullName")) like '${searchValue}'`)
        .orWhere(`"order_orderCode" like '${searchValue}'`);

      dataQuery
        .where(`"customer_phone" like '${searchValue}'`)
        .orWhere(`LOWER(convertTVkdau("customer_fullName")) like '${searchValue}'`)
        .orWhere(`"order_orderCode" like '${searchValue}'`);
    }

    const countOrder = (await countQuery.getRawOne()).count;
    const pages = Math.ceil(Number(countOrder) / limit);
    const rawOrders = await dataQuery.getRawMany();

    const orders = mapDataOrder(rawOrders);

    return {
      page: Number(page),
      totalPages: pages,
      limit: Number(limit),
      totalRecords: Number(countOrder),
      data: orders,
    };
  }

  async updateOrder(id: string, updateOrderInput: UpdateOrderInput) {
    const order = await this.orderRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!order) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ORDER_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (order.status === 4) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_COMPLETED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (order.status === 5) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_CANCELED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (order.status === 6) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_REFUNDED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updateOrderInput.shippingId) {
      const shipping = await this.shippingRepository.findOne({
        customerId: order.customerId,
        id: updateOrderInput.shippingId,
      });
      if (!shipping) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'SHIPPING_NOT_EXIST',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      order.shippingId = updateOrderInput.shippingId;
    }

    const arrUpdateProductStock = [];
    const arrUpdateToppingStock = [];
    let isInArrUpdate: boolean;
    if (updateOrderInput.status === 5) {
      const orderDetailProduct = await this.orderDetailRepository.find({
        where: {
          orderId: id,
          toppingId: IsNull(),
        },
      });
      if (orderDetailProduct?.length > 0) {
        for (let i = 0; i < orderDetailProduct.length; i++) {
          const existProductVariant = await this.productVariantRepository.findOne({
            where: {
              id: orderDetailProduct[i].productVariantId,
            },
          });

          isInArrUpdate = false;
          for (let j = 0; j < arrUpdateProductStock.length; j++) {
            if (arrUpdateProductStock[j].id === existProductVariant.id) {
              arrUpdateProductStock[j].inStock += orderDetailProduct[i].quantity;
              isInArrUpdate = true;
              break;
            }
          }
          if (isInArrUpdate === false) {
            existProductVariant.inStock += orderDetailProduct[i].quantity;
            arrUpdateProductStock.push(existProductVariant);
          }

          const existProductTopping = await this.orderDetailToppingRepository.find({
            where: {
              orderDetailId: orderDetailProduct[i].id,
            },
          });
          for (let j = 0; j < existProductTopping.length; j++) {
            const existTopping = await this.toppingRepository.findOne({
              where: {
                id: existProductTopping[j].toppingId,
              },
            });
            isInArrUpdate = false;
            for (let k = 0; k < arrUpdateToppingStock.length; k++) {
              if (arrUpdateToppingStock[k].id === existTopping.id) {
                arrUpdateToppingStock[k].inStock += existProductTopping[j].quantity;
                isInArrUpdate = true;
                break;
              }
            }
            if (isInArrUpdate === false) {
              existTopping.inStock += existProductTopping[j].quantity;
              arrUpdateToppingStock.push(existTopping);
            }
          }
        }
      }

      const orderDetailTopping = await this.orderDetailRepository.find({
        where: {
          orderId: id,
          productVariantId: IsNull(),
        },
      });

      if (orderDetailTopping?.length > 0) {
        for (let i = 0; i < orderDetailTopping.length; i++) {
          const existTopping = await this.toppingRepository.findOne({
            where: {
              id: orderDetailTopping[i].toppingId,
            },
          });

          let isInArrUpdate = false;
          for (let j = 0; j < arrUpdateToppingStock.length; j++) {
            if (orderDetailTopping[i].toppingId === arrUpdateToppingStock[j].id) {
              arrUpdateToppingStock[j].inStock += orderDetailTopping[i].quantity;
              isInArrUpdate = true;
              break;
            }
          }
          if (isInArrUpdate === false) {
            existTopping.inStock += orderDetailTopping[i].quantity;
            arrUpdateToppingStock.push(existTopping);
          }
        }
      }
    }

    if (updateOrderInput.status || updateOrderInput.status === 0) {
      order.status = updateOrderInput.status;
    }

    await this.connection.queryResultCache.clear();
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save<Order>(order);
      if (arrUpdateProductStock.length > 0) {
        await transactionalEntityManager.save<ProductVariant[]>(arrUpdateProductStock);
      }
      if (arrUpdateToppingStock.length > 0) {
        await transactionalEntityManager.save<Topping[]>(arrUpdateToppingStock);
      }
    });
    return {
      data: order,
    };
  }
}
