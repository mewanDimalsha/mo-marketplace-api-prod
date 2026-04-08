import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Variant } from './products/entities/variant.entity';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    // Step 1: Load .env file globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Step 2: Connect to PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Product, Variant],
        synchronize: config.get('NODE_ENV') !== 'production', // Disable in production
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    ProductsModule,
    UploadsModule,
  ],
})
export class AppModule {}
