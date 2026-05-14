import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Variant)
    private variantRepo: Repository<Variant>,
  ) {}

  // ─── CREATE PRODUCT ─────────────────────────────────────
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto); //first ensures the object is a proper Product instance — it runs through TypeORM's entity construction
    return this.productRepo.save(product);
  }

  // ─── LIST ALL PRODUCTS ──────────────────────────────────
  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  // ─── GET ONE PRODUCT ────────────────────────────────────
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ─── ADD VARIANT ────────────────────────────────────────
  async addVariant(productId: string, dto: CreateVariantDto): Promise<Variant> {
    // 1. Make sure product exists
    const product = await this.findOne(productId);

    // 2. Generate combination_key — normalize to lowercase
    const key = this.generateCombinationKey(dto.color, dto.size, dto.material);

    // 3. Check for duplicate within this product
    const existing = await this.variantRepo.findOne({
      where: { combination_key: key, product: { id: productId } },
    });

    if (existing) {
      throw new ConflictException(
        `Variant "${key}" already exists for this product. ` +
          `Choose a different color, size, or material combination.`,
      );
    }

    // 4. Create and save variant
    const variant = this.variantRepo.create({
      ...dto,
      combination_key: key,
      product,
    });

    return this.variantRepo.save(variant);
  }

  // ─── QUICK BUY ──────────────────────────────────────────
  async quickBuy(
    variantId: string,
  ): Promise<{ message: string; remainingStock: number }> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.stock === 0) throw new ConflictException('Out of stock');

    await this.variantRepo.decrement({ id: variantId }, 'stock', 1);
    // We return the expected remaining stock after the decrement,
    // but we don't re-query the database for the updated variant to avoid an extra round trip. In a real-world scenario, you might want to handle this more robustly, especially in high-concurrency situations, to ensure accurate stock levels.

    return {
      message: 'Purchase successful',
      remainingStock: variant.stock - 1, // We return the expected remaining stock after the decrement
    };
  }

  // ─── PRIVATE: combination_key logic ─────────────────────
  private generateCombinationKey(
    color: string,
    size: string,
    material: string,
  ): string {
    // Normalize: trim whitespace, lowercase, join with hyphen
    // "Red", " M ", "Cotton" → "red-m-cotton"
    return [color, size, material].map((v) => v.trim().toLowerCase()).join('-');
  }
}
