import { Module, CacheModule, Inject, CACHE_MANAGER } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import * as redisStore from 'cache-manager-redis-store';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6381',
      auth_pass: process.env.REDIS_PASSWORD || 'ed5f884edd376efe6b792e93da90ad6d5b77ba509d4006e75ef141bf0e42d29a',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5436,
      username: process.env.DATABASE_USER_NAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'vico',
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
          port: process.env.REDIS_PORT || '6381',
          password: process.env.REDIS_PASSWORD || 'ed5f884edd376efe6b792e93da90ad6d5b77ba509d4006e75ef141bf0e42d29a',
        },
      },
    }),
    CategoryModule,
    AuthModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(@Inject(CACHE_MANAGER) cacheManager: any) {
    const client = cacheManager.store.getClient();

    client.on('error', (error: any) => {
      // console.info(error);
    });
  }
}
