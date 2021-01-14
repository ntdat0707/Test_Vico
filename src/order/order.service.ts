import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { District } from '../entities/district.entity';
import { Province } from '../entities/province.entity';
import { Shipping } from '../entities/shipping.entity';
import { Ward } from '../entities/ward.entity';
import { Between, Connection, getManager, IsNull, Repository } from 'typeorm';
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
import { convertTv } from '../lib/utils';
import { ProductTopping } from '../entities/productTopping.entity';
import { Cart } from 'src/entities/cart.entity';

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
    this.logger.debug(`Running api getOrders at ${new Date()}`);
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
    this.logger.debug(`Running api getOrdersByCustomer at ${new Date()}`);
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
    this.logger.debug(`Running api getOrder at ${new Date()}`);
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
    this.logger.debug(`Running api getOrder at ${new Date()}`);
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
    this.logger.debug(`Running api getToppingById at ${new Date()}`);
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

    const arrUpdateStockProductVariant = [];
    const arrUpdateStockTopping = [];
    let totalQuantity = 0;
    let totalPrice = 0;
    const totalDiscount = 0;
    let isInArrUpdateTopping = false;
    let isInArrUpdateVariant = false;
    if (createOrderInput.orderDetails?.length > 0) {
      for (const orderDetail of createOrderInput.orderDetails) {
        let totalPriceDetail = 0;
        const product: any = await this.productRepository
          .createQueryBuilder('product')
          .innerJoinAndMapOne(
            'product.productVariant',
            ProductVariant,
            'product_variant',
            'product.id = product_variant.productId',
          )
          .where('"product_variant"."id" = :productVariantId', {
            productVariantId: orderDetail.id,
          })
          .andWhere('"product_variant"."deletedAt" is null')
          .andWhere('("product"."timePublication" <=:now or "product"."timePublication" is null)', { now: new Date() })
          .getOne();

        if (!product) {
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'PRODUCT_VARIANT_NOT_EXIST',
            },
            HttpStatus.NOT_FOUND,
          );
        }

        if (
          (product.toppingAvailable === false || product.numberToppingAllow < 1) &&
          orderDetail.toppings?.length > 0
        ) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'CANNOT_ORDER_TOPPING',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (product.productVariant.inStock === 0 && !product.sellOutOfStock) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_VARIANT_OUT_OF_STOCK',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (orderDetail.unitPrice !== product.productVariant.price) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'UNIT_PRICE_INCORRECT',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        totalPriceDetail += orderDetail.unitPrice;
        if (orderDetail.toppings?.length > 0) {
          let totalTopping = 0;
          for (const topping of orderDetail.toppings) {
            const existProductTopping = await this.productToppingRepository.findOne({
              where: {
                productId: product.id,
                toppingId: topping.id,
              },
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
            const existTopping = await this.toppingRepository.findOne({
              where: {
                id: topping.id,
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
            if (existTopping.price !== topping.price) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'TOPPING_PRICE_INVALID',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            totalTopping += topping.quantity;
            totalPriceDetail += topping.price * topping.quantity;
            for (const updateTopping of arrUpdateStockTopping) {
              isInArrUpdateTopping = false;
              if (updateTopping.id === existTopping.id) {
                updateTopping.inStock -= topping.quantity * orderDetail.quantity;
                if (updateTopping.inStock < 0) {
                  throw new HttpException(
                    {
                      statusCode: HttpStatus.BAD_REQUEST,
                      message: 'TOPPING_OUT_OF_STOCK',
                    },
                    HttpStatus.BAD_REQUEST,
                  );
                }
                isInArrUpdateTopping = true;
                break;
              }
            }
            if (!isInArrUpdateTopping) {
              existTopping.inStock -= topping.quantity * orderDetail.quantity;
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
          if (totalTopping > product.numberToppingAllow) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: `TOPPING_ALLOW_MUST_BE_${product.numberToppingAllow}`,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        if (totalPriceDetail !== orderDetail.totalPrice) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'TOTAL_PRICE_IN_ORDER_DETAIL_INCORRECT',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        totalQuantity += orderDetail.quantity;
        totalPrice += orderDetail.totalPrice * orderDetail.quantity;
        for (const updateProductVariant of arrUpdateStockProductVariant) {
          isInArrUpdateVariant = false;
          if (updateProductVariant.id === product.productVariant.id) {
            updateProductVariant.inStock -= orderDetail.quantity;
            if (updateProductVariant.inStock < 0) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'PRODUCT_VARIANT_OUT_OF_STOCK',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            isInArrUpdateVariant = true;
            break;
          }
        }
        if (!isInArrUpdateVariant) {
          product.productVariant.inStock -= orderDetail.quantity;
          if (product.productVariant.inStock < 0) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'PRODUCT_VARIANT_OUT_OF_STOCK',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          arrUpdateStockProductVariant.push(product.productVariant);
        }
      }
    }

    if (totalPrice - totalDiscount !== createOrderInput.orderAmount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_AMOUNT_WRONG',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (totalDiscount !== createOrderInput.totalDiscount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'TOTAL_DISCOUNT_WRONG',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (totalQuantity !== createOrderInput.orderQuantity) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'ORDER_QUANTITY_WRONG',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let newOrder = new Order();
    let newOrderDetail: OrderDetail;
    let newOrderDetailTopping: OrderDetailTopping;
    const arrOrderDetail = [];
    const arrOrderDetailTopping = [];
    existShipping.isHaveOrder = true;
    newOrder.setAttributes(createOrderInput);
    newOrder.customerId = customerId;
    newOrder.orderCode = orderCode;
    await getManager().transaction(async transactionalEntityManager => {
      newOrder = await transactionalEntityManager.save<Order>(newOrder);
      if (createOrderInput.orderDetails?.length > 0) {
        for (const orderDetail of createOrderInput.orderDetails) {
          newOrderDetail = new OrderDetail();
          newOrderDetail.setAttributes(orderDetail);
          newOrderDetail.orderId = newOrder.id;
          newOrderDetail = await transactionalEntityManager.save<OrderDetail>(newOrderDetail);
          for (const topping of orderDetail.toppings) {
            newOrderDetailTopping = new OrderDetailTopping();
            newOrderDetailTopping.toppingId = topping.id;
            newOrderDetailTopping.quantity = topping.quantity * orderDetail.quantity;
            newOrderDetailTopping.unitPrice = topping.price;
            newOrderDetailTopping.orderDetailId = newOrderDetail.id;
            arrOrderDetailTopping.push(newOrderDetailTopping);
          }
        }
      }
      await transactionalEntityManager.save<OrderDetail[]>(arrOrderDetail);
      await transactionalEntityManager.save<OrderDetailTopping[]>(arrOrderDetailTopping);
      await transactionalEntityManager.save<ProductVariant[]>(arrUpdateStockProductVariant);
      await transactionalEntityManager.save<Topping[]>(arrUpdateStockTopping);
      await transactionalEntityManager.save<Shipping>(existShipping);
      await transactionalEntityManager.delete(Cart, { customerId: customerId });
    });
    await this.connection.queryResultCache.clear();
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
    const arrStatus = orderFilterInput.arrStatus;
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
      cacheKey += 'status' + arrStatus.join(',');
      orderQuery.andWhere('"status" IN (:...arrStatus)');
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
        arrStatus,
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
      const orderDetailProducts = await this.orderDetailRepository.find({
        where: {
          orderId: id,
          toppingId: IsNull(),
        },
      });
      if (orderDetailProducts?.length > 0) {
        for (const orderDetailProduct of orderDetailProducts) {
          const existProductVariant = await this.productVariantRepository.findOne({
            where: {
              id: orderDetailProduct.productVariantId,
            },
          });

          isInArrUpdate = false;
          for (const productStock of arrUpdateProductStock) {
            if (productStock.id === existProductVariant.id) {
              productStock.inStock += orderDetailProduct.quantity;
              isInArrUpdate = true;
              break;
            }
          }
          if (isInArrUpdate === false) {
            existProductVariant.inStock += orderDetailProduct.quantity;
            arrUpdateProductStock.push(existProductVariant);
          }

          const orderDetailProductToppings = await this.orderDetailToppingRepository.find({
            where: {
              orderDetailId: orderDetailProduct.id,
            },
          });
          for (const orderDetailProductTopping of orderDetailProductToppings) {
            const existTopping = await this.toppingRepository.findOne({
              where: {
                id: orderDetailProductTopping.toppingId,
              },
            });
            isInArrUpdate = false;
            for (const toppingStock of arrUpdateToppingStock) {
              if (toppingStock.id === existTopping.id) {
                toppingStock.inStock += orderDetailProductTopping.quantity;
                isInArrUpdate = true;
                break;
              }
            }
            if (isInArrUpdate === false) {
              existTopping.inStock += orderDetailProductTopping.quantity;
              arrUpdateToppingStock.push(existTopping);
            }
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
