import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Variant } from './variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') // Use UUID for unique product IDs
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Variant, (variant) => variant.product, {
    cascade: true, // Automatically save variants when saving a product
    eager: true, // Automatically load variants when loading a product
  })
  variants!: Variant[];
}
