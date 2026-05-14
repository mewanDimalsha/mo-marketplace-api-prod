import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Variant])], // Register Product and Variant entities with TypeORM
  providers: [ProductsService], // Register the ProductsService as a provider for dependency injection
  controllers: [ProductsController], // Register the ProductsController to handle incoming requests related to products
})
export class ProductsModule {}
