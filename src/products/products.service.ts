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
    ) { }

    // ─── CREATE PRODUCT ─────────────────────────────────────
    async createProduct(dto: CreateProductDto): Promise<Product> {
        const product = this.productRepo.create(dto);
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
    async quickBuy(variantId: string): Promise<{ message: string; remainingStock: number }> {
        const variant = await this.variantRepo.findOne({
            where: { id: variantId },
        });

        if (!variant) throw new NotFoundException('Variant not found');

        if (variant.stock === 0) {
            throw new ConflictException(
                'This variant is out of stock and cannot be purchased.',
            );
        }

        // Decrement stock by 1
        variant.stock -= 1;
        await this.variantRepo.save(variant);

        return {
            message: 'Purchase successful',
            remainingStock: variant.stock,
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
        return [color, size, material]
            .map((v) => v.trim().toLowerCase())
            .join('-');
    }
}