import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Brackets, Connection, getManager, IsNull, Repository } from 'typeorm';
import { convertTv } from '../lib/utils';
import {
  ActiveCustomerInput,
  AddProductInCartInput,
  ChangePasswordInput,
  CreateCustomerInput,
  DeleteProductInCartInput,
  RefreshCartInput,
  UpdateCartInput,
  UpdateCustomerInput,
  UpdateProfileInput,
} from './customer.dto';
import { Shipping } from '../entities/shipping.entity';
import { Product } from '../entities/product.entity';
import { Cart } from '../entities/cart.entity';
import * as bcrypt from 'bcryptjs';
import { Order } from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { Topping } from '../entities/topping.entity';
import { CartTopping } from '../entities/cartTopping.entity';
import { ProductVariant } from '../entities/productVariant.entity';
import _ = require('lodash');

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Shipping) private shippingRepository: Repository<Shipping>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartTopping) private cartToppingRepository: Repository<CartTopping>,
    @InjectRepository(ProductVariant) private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Topping) private toppingRepository: Repository<Topping>,
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
    const existProductVariant: any = await this.productVariantRepository
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

    if (
      (addProductInCartInput.sugar || addProductInCartInput.sugar === 0) &&
      !existProductVariant.product.allowSelectSugar
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'PRODUCT_DISALLOW_SELECT_SUGAR',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let newCart = new Cart();
    newCart.customerId = customerId;
    newCart.setAttributes(addProductInCartInput);
    await getManager().transaction(async transactionalEntityManager => {
      newCart = await transactionalEntityManager.save<Cart>(newCart);
      if (addProductInCartInput.toppings?.length > 0) {
        if (!existProductVariant.product.toppingAvailable) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_DISALLOW_TOPPING',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const arrInsertCartTopping = [];
        for (const topping of addProductInCartInput.toppings) {
          const existTopping = await this.toppingRepository.findOne({
            where: {
              id: topping.id,
            },
          });

          if (!existTopping) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_NOT_EXIST',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          const newCartTopping = new CartTopping();
          newCartTopping.setAttributes(topping);
          newCartTopping.cartId = newCart.id;
          arrInsertCartTopping.push(newCartTopping);
        }
        await transactionalEntityManager.save<CartTopping[]>(arrInsertCartTopping);
      }
    });
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

    if (!existCustomer.email && !activeCustomerInput.email) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'EMAIL_REQUIRED',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    existCustomer.isActive = true;

    existCustomer.setAttributes(activeCustomerInput);
    await this.customerRepository.save(existCustomer);
    return {
      data: existCustomer,
    };
  }

  async updateProfile(customerId: string, updateProfileInput: UpdateProfileInput) {
    let existCustomer: Customer;
    if (updateProfileInput.phoneNumber) {
      existCustomer = await this.customerRepository.findOne({
        where: {
          phoneNumber: updateProfileInput.phoneNumber,
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

    if (!existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'CUSTOMER_NOT_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }
    existCustomer.setAttributes(updateProfileInput);
    await this.customerRepository.save(existCustomer);
    await this.connection.queryResultCache.clear();
    return {
      data: existCustomer,
    };
  }

  async changePassword(customerId: string, changePasswordInput: ChangePasswordInput) {
    const existCustomer = await this.customerRepository.findOne({
      where: {
        id: customerId,
      },
    });

    if (!existCustomer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'CUSTOMER_NOT_EXIST',
        },
        HttpStatus.CONFLICT,
      );
    }

    const passwordIsValid = bcrypt.compareSync(changePasswordInput.currentPassword, existCustomer.password);
    if (!passwordIsValid) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'INCORRECT_CURRENT_PASSWORD',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const hashPassword: string = await bcrypt.hash(changePasswordInput.newPassword, 10);
    existCustomer.password = hashPassword;
    await this.customerRepository.save(existCustomer);
    await this.connection.queryResultCache.clear();
    return {
      data: existCustomer,
    };
  }

  async getAllShippingByCustomer(customerId: string) {
    const shippings = await this.shippingRepository.find({
      where: {
        customerId: customerId,
        status: true,
      },
      cache: { id: `get_all_shipping_by_customer_id${customerId}`, milliseconds: 30000 },
    });

    return {
      data: shippings,
    };
  }

  async getAllOrderByCustomer(customerId: string) {
    const orders = await this.connection
      .createQueryBuilder(Order, 'order')
      .orderBy('"order"."createdAt"', 'DESC')
      .innerJoinAndMapMany('order.orderDetails', OrderDetail, 'order_detail', 'order.id = order_detail.orderId')
      .cache(`get_all_order_by_customer_${customerId}`)
      .getMany();
    return {
      data: orders,
    };
  }

  async getCustomer(customerId: string) {
    const customer: any = await this.connection
      .createQueryBuilder(Customer, 'customer')
      .select([
        'customer.id',
        'customer.email',
        'customer.fullName',
        'customer.shippingDefaultId',
        'customer.avatar',
        'customer.birthDay',
        'customer.code',
        'customer.gender',
        'customer.isActive',
        'shipping',
      ])
      .leftJoinAndMapOne(
        'customer.shippingDefault',
        Shipping,
        'shipping',
        'customer."shippingDefaultId" = shipping."id"',
      )
      .cache(`get_customer_${customerId}`)
      .where('customer.id =:customerId', { customerId: customerId })
      .getOne();

    if (!customer) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CUSTOMER_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const orders = await this.orderRepository.find({
      where: {
        customerId: customerId,
      },
    });

    let totalRevenue = 0;

    for (let i = 0; i < orders.length; i++) {
      totalRevenue += orders[i].orderAmount;
    }

    customer.totalRevenue = totalRevenue;
    customer.totalOrder = orders.length;

    return {
      data: customer,
    };
  }

  async getAllCartCustomer(customerId: string) {
    const cart: any = await this.connection
      .createQueryBuilder(Cart, 'cart')
      .innerJoinAndMapOne(
        'cart.productVariant',
        ProductVariant,
        'product_variant',
        'product_variant.id = cart.productVariantId',
      )
      .leftJoinAndMapMany('cart.toppings', CartTopping, 'cart_topping', 'cart_topping."cartId" = cart."id"')
      .innerJoinAndMapOne('cart_topping.topping', Topping, 'topping', 'topping.id = cart_topping.toppingId')
      .cache(`get_all_cart_customer_${customerId}`)
      .where('cart.customerId =:customerId', { customerId: customerId })
      .getMany();

    return {
      data: cart,
    };
  }

  async deleteProductInCart(customerId: string, deleteProductInCartInput: DeleteProductInCartInput) {
    const existCart = await this.cartRepository.findOne({
      where: {
        customerId: customerId,
        id: deleteProductInCartInput.cartId,
      },
    });

    if (!existCart) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CART_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const cartToppings = await this.cartToppingRepository.find({
      where: {
        cartId: existCart.id,
      },
    });

    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.remove<Cart>(existCart);
      if (cartToppings.length > 0) {
        await transactionalEntityManager.remove<CartTopping[]>(cartToppings);
      }
    });

    return {
      data: true,
    };
  }

  async updateCart(customerId: string, id: string, updateCartInput: UpdateCartInput) {
    const existCart = await this.cartRepository.findOne({
      where: {
        id: id,
        customerId: customerId,
      },
    });

    if (!existCart) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'CART_NOT_EXIST',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let existProductVariant: any;
    if (existCart.productVariantId !== updateCartInput.productVariantId) {
      existProductVariant = await this.productVariantRepository
        .createQueryBuilder('product_variant')
        .leftJoinAndMapOne('product_variant.product', Product, 'product', '"product_variant"."productId"=product.id')
        .where('product_variant.id=:id', { id: updateCartInput.productVariantId })
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

      if ((updateCartInput.sugar || updateCartInput.sugar === 0) && !existProductVariant.product.allowSelectSugar) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRODUCT_DISALLOW_SELECT_SUGAR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      existProductVariant = await this.productVariantRepository
        .createQueryBuilder('product_variant')
        .leftJoinAndMapOne('product_variant.product', Product, 'product', '"product_variant"."productId"=product.id')
        .where('product_variant.id=:id', { id: existCart.productVariantId })
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

      if ((updateCartInput.sugar || updateCartInput.sugar === 0) && !existProductVariant.product.allowSelectSugar) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'PRODUCT_DISALLOW_SELECT_SUGAR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const cartToppings = await this.cartToppingRepository
      .find({
        where: {
          cartId: existCart.id,
        },
      })
      .then(toppings =>
        toppings.map((topping: any) => ({
          toppingId: topping.toppingId,
          quantity: topping.quantity,
        })),
      );

    const addToppingInCart = _.differenceWith(updateCartInput.toppings, cartToppings, _.isEqual);

    const removeToppingInCart = _.differenceWith(cartToppings, updateCartInput.toppings, _.isEqual);

    existCart.setAttributes(updateCartInput);
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save<Cart>(existCart);
      if (addToppingInCart.length > 0) {
        if (!existProductVariant.product.toppingAvailable) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_DISALLOW_TOPPING',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const arrInsertCartTopping = [];
        for (const topping of addToppingInCart) {
          const existTopping = await this.toppingRepository.findOne({
            where: {
              id: topping.id,
            },
          });

          if (!existTopping) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'TOPPING_NOT_EXIST',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          const newCartTopping = new CartTopping();
          newCartTopping.setAttributes(topping);
          newCartTopping.cartId = existCart.id;
          arrInsertCartTopping.push(newCartTopping);
        }
        await transactionalEntityManager.save<CartTopping[]>(arrInsertCartTopping);
        for (const topping of removeToppingInCart) {
          const existToppingInCart = await this.cartToppingRepository.findOne({
            where: {
              cartId: id,
              toppingId: topping.toppingId,
            },
          });
          await transactionalEntityManager.remove(existToppingInCart);
        }
      }
    });
    return {
      data: true,
    };
  }

  async refreshCart(customerId: string, refreshCartInput: RefreshCartInput) {
    await getManager().transaction(async transactionalEntityManager => {
      const cartOfCustomer = await this.cartRepository.find({
        where: {
          customerId: customerId,
        },
      });
      if (cartOfCustomer.length > 0) {
        for (const product of cartOfCustomer) {
          const cartToppings = await this.cartToppingRepository.findOne({
            where: {
              cartId: product.id,
            },
          });
          await transactionalEntityManager.remove<CartTopping>(cartToppings);
        }
        await transactionalEntityManager.remove<Cart>(cartOfCustomer);
      }
      for (const product of refreshCartInput.productsInCart) {
        const existProductVariant: any = await this.productVariantRepository
          .createQueryBuilder('product_variant')
          .leftJoinAndMapOne('product_variant.product', Product, 'product', '"product_variant"."productId"=product.id')
          .where('product_variant.id=:id', { id: product.productVariantId })
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

        if ((product.sugar || product.sugar === 0) && !existProductVariant.product.allowSelectSugar) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'PRODUCT_DISALLOW_SELECT_SUGAR',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        let newCart = new Cart();
        newCart.customerId = customerId;
        newCart.setAttributes(product);
        newCart = await transactionalEntityManager.save<Cart>(newCart);
        if (product.toppings?.length > 0) {
          if (!existProductVariant.product.toppingAvailable) {
            throw new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'PRODUCT_DISALLOW_TOPPING',
              },
              HttpStatus.BAD_REQUEST,
            );
          }

          const arrInsertCartTopping = [];
          for (const topping of product.toppings) {
            const existTopping = await this.toppingRepository.findOne({
              where: {
                id: topping.id,
              },
            });

            if (!existTopping) {
              throw new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'TOPPING_NOT_EXIST',
                },
                HttpStatus.BAD_REQUEST,
              );
            }
            const newCartTopping = new CartTopping();
            newCartTopping.setAttributes(topping);
            newCartTopping.cartId = newCart.id;
            arrInsertCartTopping.push(newCartTopping);
          }
          await transactionalEntityManager.save<CartTopping[]>(arrInsertCartTopping);
        }
      }
    });

    return {
      data: true,
    };
  }
}
