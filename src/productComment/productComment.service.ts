import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Connection } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductCommentService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private connection: Connection,
  ) {}

  async getCommentByProduct(
    page = 1,
    limit: number = parseInt(process.env.DEFAULT_MAX_ITEMS_PER_PAGE),
    productId: string,
    userId: string,
  ) {
    const existProduct = await this.productRepository.findOne({
      where: { id: productId, deletedAt: IsNull(), userId: userId },
    });

    if (!existProduct) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'PRODUCT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      page: Number(page),
      limit: limit,
    };
  }
}
