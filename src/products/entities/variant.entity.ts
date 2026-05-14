import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('variants')
@Unique(['product', 'combination_key']) // Ensure unique combination of product and variant attributes
export class Variant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  color!: string;

  @Column()
  size!: string;

  @Column()
  material!: string;

  @Column()
  combination_key!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
