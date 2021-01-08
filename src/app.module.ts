import { Module, CacheModule, Inject, CACHE_MANAGER } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import * as redisStore from 'cache-manager-redis-store';
import { ToppingModule } from './topping/topping.module';
import { RoleModule } from './role/role.module';
import { ShippingModule } from './shipping/shipping.module';
import { CategoryBlogModule } from './category-blog/category-blog.module';
import { BlogModule } from './blog/blog.module';
import { CustomerModule } from './customer/customer.module';
import { DescriptionModule } from './description/description.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6380',
      auth_pass: process.env.REDIS_PASSWORD || 'ed5f884edd376efe6b792e93da90ad6d5b77ba509d4006e75ef141bf0e42d29a',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 5435,
      username: process.env.DATABASE_USER_NAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'mi_dom',
      entities: ['./dist/**/**.entity{.ts,.js}'],
      subscribers: ['./dist/**/**.subscriber{.ts,.js}'],
      synchronize: false,
      logging: true,
      migrationsRun: true,
      migrations: ['./dist/migrations/*.js'],
      cli: {
        migrationsDir: './migrations',
      },
      cache: {
        type: 'redis',
        duration: 30000, // 30 seconds
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || '6380',
          password: process.env.REDIS_PASSWORD || 'ed5f884edd376efe6b792e93da90ad6d5b77ba509d4006e75ef141bf0e42d29a',
        },
      },
    }),
    ProductModule,
    CategoryModule,
    OrderModule,
    AuthModule,
    RoleModule,
    CategoryBlogModule,
    ToppingModule,
    ShippingModule,
    BlogModule,
    CustomerModule,
    DescriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(@Inject(CACHE_MANAGER) cacheManager: any) {
    const client = cacheManager.store.getClient();

    client.on('error', (error: any) => {
      console.info(error);
    });
  }
}
